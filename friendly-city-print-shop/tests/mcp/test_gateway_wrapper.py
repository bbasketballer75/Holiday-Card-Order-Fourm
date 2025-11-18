import subprocess
from pathlib import Path
import time
import pytest
from tests.mcp.log_utils import create_gateway_mapping


def test_gateway_process_is_popen_and_has_log(gateway_process):
    # The gateway_process fixture should yield a raw subprocess.Popen instance.
    assert isinstance(gateway_process, subprocess.Popen)

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

    # Should have standard Popen streams available
    assert hasattr(gateway_process, 'stdin') and gateway_process.stdin is not None
    # The fixture yields the raw Popen, which is not subscriptable.
    with pytest.raises(TypeError):
        _ = gateway_process['proc']  # type: ignore[index]


def test_gateway_mapping_compatibility(gateway_process):
    # Ensure a mapping-style wrapper can be created from the raw Popen
    mapping = create_gateway_mapping(gateway_process)
    assert isinstance(mapping, dict)
    assert mapping['proc'] is gateway_process
    assert mapping['log'] == gateway_process.log
