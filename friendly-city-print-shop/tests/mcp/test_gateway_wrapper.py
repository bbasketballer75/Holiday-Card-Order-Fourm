import subprocess
from pathlib import Path
import time
import pytest
from tests.mcp.log_utils import create_gateway_mapping


def test_gateway_process_is_popen_and_has_log(gateway_process):
    # The gateway_process fixture yields either a raw Popen or a mapping-style
    # wrapper that delegates to Popen. Normalize to the `proc` variable here.
    if isinstance(gateway_process, subprocess.Popen):
        proc = gateway_process
        # Also ensure mapping-style access raises for raw Popen
        with pytest.raises(TypeError):
            _ = gateway_process['proc']  # type: ignore[index]
    else:
        assert hasattr(gateway_process, 'proc')
        proc = gateway_process.proc
        assert isinstance(proc, subprocess.Popen)
        assert gateway_process['proc'] is proc

    # It should expose a log attribute with stdout/stderr paths
    assert hasattr(gateway_process, 'log')
    log = getattr(gateway_process, 'log')
    assert 'stdout' in log and 'stderr' in log

    # The stdout log file should exist (the draining thread created it)
    stdout_path = Path(log['stdout'])
    stderr_path = Path(log['stderr'])
    deadline = time.time() + 5
    while time.time() < deadline and not (stdout_path.exists() and stderr_path.exists()):
        time.sleep(0.05)
    assert stdout_path.exists(), f"stdout log file not created: {stdout_path}"
    assert stderr_path.exists(), f"stderr log file not created: {stderr_path}"

    # Should have standard Popen streams available on the proc
    assert hasattr(proc, 'stdin') and proc.stdin is not None
    # The fixture yields the raw Popen, which is not subscriptable.
    # `gateway_process['proc']` should be available for mapping-style wrapper
    if not isinstance(gateway_process, subprocess.Popen):
        assert gateway_process['proc'] is proc


def test_gateway_mapping_compatibility(gateway_process):
    # Ensure a mapping-style wrapper can be created from the raw Popen
    mapping = create_gateway_mapping(gateway_process)
    assert isinstance(mapping, dict)
    if isinstance(gateway_process, subprocess.Popen):
        assert mapping['proc'] is gateway_process
    else:
        assert mapping['proc'] is gateway_process.proc
    if isinstance(gateway_process, subprocess.Popen):
        gp_log = getattr(gateway_process, 'log')
    else:
        gp_log = gateway_process.log
    assert mapping['log'] == gp_log
