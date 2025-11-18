import queue
import time
import threading
from subprocess import Popen
from typing import Tuple, Union


def start_log_reader(proc_or_path: Union[Popen, str]) -> Tuple[queue.Queue, threading.Event]:
    """Start a background reader for a process stdout stream or a log file path.

    Returns a tuple of (queue.Queue, threading.Event) where the queue will be
    populated with new lines read from the stream/file and the Event can be
    set to stop the reader thread.
    """
    q: queue.Queue = queue.Queue()
    stopped = threading.Event()

    def reader_stream(proc: Popen):
        stdout = getattr(proc, 'stdout', None)
        if stdout is None:
            return
        while not stopped.is_set():
            try:
                line = stdout.readline()
                if not line:
                    time.sleep(0.01)
                    continue
                q.put(line)
            except Exception:
                break

    def reader_file(path: str):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                f.seek(0, 2)
                while not stopped.is_set():
                    line = f.readline()
                    if not line:
                        time.sleep(0.01)
                        continue
                    q.put(line)
        except Exception:
            # Ignore I/O errors while trying to tail the log
            return

    if isinstance(proc_or_path, str):
        t = threading.Thread(target=reader_file, args=(proc_or_path,), daemon=True)
    else:
        t = threading.Thread(target=reader_stream, args=(proc_or_path,), daemon=True)
    t.start()
    return q, stopped


def collect_jsonrpc_responses(q: queue.Queue, expected_ids, timeout=10.0):
    import json
    responses = {}
    deadline = time.time() + timeout
    while time.time() < deadline and len(responses) < len(expected_ids):
        try:
            line = q.get(timeout=0.5)
        except queue.Empty:
            continue
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
            if 'jsonrpc' in payload and 'id' in payload:
                responses[payload['id']] = payload
        except Exception:
            # ignore logs/non-json
            continue
    return responses


def create_gateway_mapping(proc: Popen) -> dict:
    """Create a small mapping-style wrapper for the gateway process.

    This is useful for older tests that expect `gateway_process['proc']` and
    `gateway_process['log']` mapping-style access. Use this helper to convert
    a raw `subprocess.Popen` instance into a mapping-like object.
    """
    # If the passed `proc` is already a wrapper with a `proc` attribute, unwrap it
    underlying = getattr(proc, 'proc', proc)
    return {'proc': underlying, 'log': getattr(underlying, 'log', getattr(proc, 'log', {}))}

