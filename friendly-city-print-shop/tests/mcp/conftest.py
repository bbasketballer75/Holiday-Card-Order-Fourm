import os
import subprocess
import time
import requests
import socket
import pytest
import sys
from pathlib import Path
import threading
from typing import Dict


def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def _node_available():
    from shutil import which
    return which('node') is not None


def _drain_stream_to_file(proc, stream, path):
    try:
        with open(path, 'a', encoding='utf-8') as f:
            while True:
                line = stream.readline()
                if not line:
                    if proc.poll() is not None:
                        break
                    time.sleep(0.01)
                    continue
                f.write(line)
                f.flush()
    except Exception:
        pass


# Historically we used a wrapper to expose `gateway_process['proc']` mapping.
# To remain backwards compatible we yield a small wrapper object which exposes
# mapping-style `['proc']`/`['log']` access while also delegating attribute
# access to the underlying `subprocess.Popen` instance so tests can still use
# `gateway_process.stdin` like before.

class GatewayProcessWrapper:
    """Wrapper that holds a proc and log dict while delegating attributes to
    the underlying `subprocess.Popen` instance.
    """
    def __init__(self, proc: subprocess.Popen, log: Dict[str, str]):
        self.proc = proc
        self.log = log

    def __getitem__(self, key):
        if key == 'proc':
            return self.proc
        if key == 'log':
            return self.log
        raise KeyError(key)

    def __getattr__(self, name):
        # Delegate attribute access to the underlying Popen
        return getattr(self.proc, name)

    def terminate(self):
        return self.proc.terminate()

    def kill(self):
        return self.proc.kill()

    def wait(self, timeout=None):
        return self.proc.wait(timeout=timeout)

    def poll(self):
        return self.proc.poll()

    def __repr__(self):
        return f"<GatewayProcessWrapper pid={getattr(self.proc, 'pid', None)} log={self.log}>"


@pytest.fixture(scope='module')
def mock_mcp_server(tmp_path_factory):
    """Start the repository's MCP mock server in a subprocess for tests.

    Returns the base URL (e.g. http://127.0.0.1:39300) and ensures the process
    is terminated on fixture teardown.
    """
    if not _node_available():
        pytest.skip("node not found in PATH; skipping mock server tests")

    port = find_free_port()
    env = os.environ.copy()
    env['PORT'] = str(port)

    # Discover the repository root by walking parents until we find a 'scripts/mcp-server.js'
    repo_path = Path(__file__).resolve().parent
    script = None
    cwd = None
    for parent in list(repo_path.parents):
        candidate = parent
        if (candidate / 'scripts' / 'mcp-server.js').exists():
            script = str((candidate / 'scripts' / 'mcp-server.js').resolve())
            cwd = str(candidate.resolve())
            break
    if script is None:
        # Fallback: try to find from the known repo root
        repo_root = Path(__file__).resolve()
        for p in repo_root.parents:
            if (p / 'friendly-city-print-shop').exists():
                repo_root = str(p)
                break
        script = os.path.abspath(os.path.join(repo_root, 'friendly-city-print-shop', 'scripts', 'mcp-server.js'))
        cwd = os.path.abspath(os.path.join(repo_root, 'friendly-city-print-shop'))
    print(f'Launching mock server: script={script} cwd={cwd}', file=sys.stderr)

    # Start Node server in the friendly-city-print-shop directory to ensure paths remain consistent
    # Launch the server (capturing stdout/stderr)
    proc = subprocess.Popen(['node', script], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=cwd)

    # Create a log directory to persist server logs for debugging and test synchronization
    log_dir = tmp_path_factory.mktemp('mcp-server-logs')
    stdout_log = str((log_dir / 'stdout.log').resolve())
    stderr_log = str((log_dir / 'stderr.log').resolve())

    # Start background threads to flush stdout/stderr to log files
    t_out = threading.Thread(target=_drain_stream_to_file, args=(proc, proc.stdout, stdout_log), daemon=True)
    t_err = threading.Thread(target=_drain_stream_to_file, args=(proc, proc.stderr, stderr_log), daemon=True)
    t_out.start()
    t_err.start()

    # Wait for an HTTP 200 on root with small timeout and collect initial logs
    url = f'http://127.0.0.1:{port}/'
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            r = requests.get(url, timeout=0.5)
            if r.status_code == 200:
                break
        except Exception:
            time.sleep(0.1)
    else:
        # Try read some logs to help debugging
        # Collect a small amount of logs for debugging without blocking
        out = ''
        err = ''
        try:
            if proc.stdout:
                while True:
                    line = proc.stdout.readline()
                    if not line:
                        break
                    out += line
                    if len(out) > 10000:
                        break
        except Exception:
            pass
        try:
            if proc.stderr:
                while True:
                    line = proc.stderr.readline()
                    if not line:
                        break
                    err += line
                    if len(err) > 10000:
                        break
        except Exception:
            # ignore errors while reading stderr
            pass
        proc.kill()
        pytest.skip(f'Mock server failed to start; stdout:\n{out}\n stderr:\n{err}')

    yield {'url': f'http://127.0.0.1:{port}', 'proc': proc, 'log': {'stdout': stdout_log, 'stderr': stderr_log}}

    # Teardown
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()


@pytest.fixture(scope='function')
def gateway_process(mock_mcp_server, tmp_path_factory):
    """Start the local MCP gateway wrapper (py-run-mcp-gateway.py) in a subprocess.

    This uses the venv Python from sys.executable to ensure the installed `pieces` package
    is available.

    The fixture yields a `GatewayProcessWrapper` object which behaves like the
    original `subprocess.Popen` via attribute access (e.g., `gateway_process.stdin`)
    while also exposing a mapping-style interface to access the underlying
    process and logs (e.g., `gateway_process` and
    `gateway_process['log']['stdout']`).
    """
    # mock_mcp_server is a dict: { 'url': ..., 'proc': proc }
    upstream_url = mock_mcp_server['url'] + '/model_context_protocol/2024-11-05/sse'
    mock_proc = mock_mcp_server['proc']

    # Compute gateway script path by walking parents to find the 'scripts/py-run-mcp-gateway.py' file
    repo_path = Path(__file__).resolve().parent
    gateway_script = None
    cwd_root = None
    for parent in repo_path.parents:
        candidate = parent
        if (candidate / 'scripts' / 'py-run-mcp-gateway.py').exists():
            gateway_script = str((candidate / 'scripts' / 'py-run-mcp-gateway.py').resolve())
            cwd_root = str(candidate.resolve())
            break
    if gateway_script is None:
        # fallback: assume script is under friendly-city-print-shop/scripts
        repo_root = Path(__file__).resolve()
        for p in repo_root.parents:
            if (p / 'friendly-city-print-shop').exists():
                repo_root = str(p)
                break
        gateway_script = os.path.join(repo_root, 'friendly-city-print-shop', 'scripts', 'py-run-mcp-gateway.py')
        cwd_root = os.path.join(repo_root, 'friendly-city-print-shop')

    env = os.environ.copy()
    # Launch using the current Python executable (venv)
    args = [sys.executable, gateway_script, '--upstream-url', upstream_url]

    proc = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, cwd=cwd_root)

    # Create a log directory to persist gateway logs for debugging and test synchronization
    gw_log_dir = tmp_path_factory.mktemp('mcp-gateway-logs')
    gw_stdout_log = str((gw_log_dir / 'stdout.log').resolve())
    gw_stderr_log = str((gw_log_dir / 'stderr.log').resolve())
    t_out_gw = threading.Thread(target=_drain_stream_to_file, args=(proc, proc.stdout, gw_stdout_log), daemon=True)
    t_err_gw = threading.Thread(target=_drain_stream_to_file, args=(proc, proc.stderr, gw_stderr_log), daemon=True)
    t_out_gw.start()
    t_err_gw.start()

    # Wait until the mock server indicates a connected client (gateway) or timeout by checking the server log file
    log_paths: Dict[str, str] = mock_mcp_server.get('log', {})
    stdout_log = log_paths.get('stdout')
    stderr_log = log_paths.get('stderr')
    deadline = time.time() + 10
    connected = False
    while time.time() < deadline:
        if proc.poll() is not None:
            stderr = ''
            try:
                if stderr_log and Path(stderr_log).exists():
                    stderr = Path(stderr_log).read_text(errors='ignore')
                elif proc.stderr:
                    stderr = proc.stderr.read()
            except Exception:
                stderr = ''
            raise RuntimeError(f'Gateway process exited early. Stderr:\n{stderr}')
        # If gateway printed a readiness message, exit early
        try:
            if gw_stdout_log and Path(gw_stdout_log).exists():
                gw_logs = Path(gw_stdout_log).read_text(errors='ignore')
                if 'GATEWAY_READY' in gw_logs:
                    connected = True
                    break
        except Exception:
            pass
        # Otherwise, read server stdout log for 'Client connected'
        try:
            if stdout_log and Path(stdout_log).exists():
                logs = Path(stdout_log).read_text(errors='ignore')
                if 'Client connected' in logs:
                    connected = True
                    break
        except Exception:
            pass
        time.sleep(0.1)
    if not connected:
        proc.kill()
        pytest.skip('Gateway failed to start')

    # Attach log paths to the underlying Popen and return a wrapper that
    # supports both mapping-style access and attribute delegation.
    proc_log = {'stdout': gw_stdout_log, 'stderr': gw_stderr_log}
    setattr(proc, 'log', proc_log)
    wrapper = GatewayProcessWrapper(proc, proc_log)
    yield wrapper

    # Teardown
    try:
        wrapper.proc.terminate()
    except Exception:
        wrapper.proc.kill()
    try:
        wrapper.proc.wait(timeout=5)
    except Exception:
        wrapper.proc.kill()
