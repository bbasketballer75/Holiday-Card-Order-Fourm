# Local MCP Integration Tests

This document explains how to run the local MCP mock server and gateway integration tests.

Prerequisites

- Node.js (v22.x recommended)
- Python 3.13 (or the version in your venv)
- `pip` and `npm` in PATH

Start the mock server

```
cd friendly-city-print-shop
# set PORT env var if needed
PORT=39300 node scripts/mcp-server.js
```

Run the Gateway (local)

```
python scripts/py-run-mcp-gateway.py --upstream-url http://127.0.0.1:39300/model_context_protocol/2024-11-05/sse
```

Run tests

```
# from repo root
python -m venv .venv
.venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
pip install -U pip
pip install pytest pytest-asyncio httpx httpx-sse pieces-cli
python -m pytest tests/mcp -q -r a
```

Manual SSE debugging

```
# Run a small SSE client that prints events
python scripts/tmp_sse_check.py --host 127.0.0.1 --port 39300
```

CI Notes

- There's a GitHub Actions workflow at `.github/workflows/mcp-integration.yml` which runs the `tests/mcp` suite and uploads result artifacts.

## Testing: `gateway_process` fixture

The `gateway_process` fixture yields a raw `subprocess.Popen` instance for the locally-run MCP gateway. This makes it work like a normal process object (you can write to `gateway_process.stdin`) and preserves standard runtime behavior.

The fixture also attaches a `log` attribute to the `Popen` instance. The `log` value is a dict with two paths you can use to follow gateway logs in tests:

```python
# Example: use log_utils helpers from tests to tail log files
from tests.mcp.log_utils import start_log_reader, collect_jsonrpc_responses, create_gateway_mapping

def test_using_gateway_mobile_fixture(gateway_process):
    import json
    # tail the gateway log
    q, stopped = start_log_reader(gateway_process.log['stdout'])

    # send a message to the gateway via stdin
    gateway_process.stdin.write(json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}) + "\n")
    gateway_process.stdin.flush()

    # parse JSON-RPC responses from the gateway stdout
    responses = collect_jsonrpc_responses(q, [1], timeout=5.0)
    assert 1 in responses

    # If you prefer mapping-style access, the small helper `create_gateway_mapping`
    # can wrap the raw Popen to expose `{'proc': proc, 'log': proc.log}` which is
    # convenient in older tests.
    wrapper = create_gateway_mapping(gateway_process)
    assert wrapper['proc'] is gateway_process
```

