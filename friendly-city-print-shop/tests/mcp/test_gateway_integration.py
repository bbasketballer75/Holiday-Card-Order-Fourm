import json
import time
import queue
import threading
from tests.mcp.log_utils import start_log_reader, collect_jsonrpc_responses
from pathlib import Path

import pytest


# Use `start_log_reader` helper to tail file or process stdout


def _collect_responses(q, expected_ids, timeout=10.0):
    return collect_jsonrpc_responses(q, expected_ids, timeout=timeout)


def _send_requests(proc, requests):
    for r in requests:
        proc.stdin.write(r + "\n")
        proc.stdin.flush()


@pytest.mark.integration
def test_initialize_list_call_flow(gateway_process):
    # Start a reader for gateway stdout
    # gateway_process yields the raw `subprocess.Popen` with a `log` attribute
    q, stopped = start_log_reader(gateway_process.log['stdout'])

    try:
        # Initialize, notifications and list_tools
        # Send initialize + wait for initialize result
        _send_requests(gateway_process, [json.dumps({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"},
            },
        })])
        init_resps = _collect_responses(q, expected_ids=[1], timeout=10.0)
        assert 1 in init_resps

        # Send notification and list_tools, wait for list_tools response
        _send_requests(gateway_process, [json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}), json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})])
        responses = _collect_responses(q, expected_ids=[2], timeout=10.0)
        assert 2 in responses
        assert 'result' in responses[2]
        assert 'tools' in responses[2]['result']
        assert isinstance(responses[2]['result']['tools'], list)
    finally:
        stopped.set()


@pytest.mark.integration
def test_tool_call_echo_and_ask_ltm(gateway_process):
    q, stopped = start_log_reader(gateway_process.log['stdout'])
    try:
        # Initialize + tools/list
        init = json.dumps({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}},
        })
        notif = json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})
        list_req = json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        # Call echo tool
        call_echo = json.dumps({"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "echo", "arguments": {"text": "Hello"}}})
        # Call ask_pieces_ltm tool (success)
        call_ltm_ok = json.dumps({"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "ask_pieces_ltm", "arguments": {"question": "What is 2+2?"}}})
        # Call ask_pieces_ltm tool (error path)
        call_ltm_err = json.dumps({"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "ask_pieces_ltm", "arguments": {"question": "please FAIL"}}})

        # Initialize and wait for init response
        _send_requests(gateway_process, [init])
        init_resps = _collect_responses(q, expected_ids=[1], timeout=10.0)
        assert 1 in init_resps

        # Send notification and list request and wait for tools list
        _send_requests(gateway_process, [notif, list_req])
        list_resps = _collect_responses(q, expected_ids=[2], timeout=10.0)
        assert 2 in list_resps

        # Send tool call requests and wait for responses
        _send_requests(gateway_process, [call_echo, call_ltm_ok, call_ltm_err])
        responses = _collect_responses(q, expected_ids=[3, 4, 5], timeout=20.0)
        assert 3 in responses
        assert 'result' in responses[3]
        assert 'content' in responses[3]['result']

        assert 4 in responses
        assert 'result' in responses[4]
        # Structured content is expected, but gateway may normalize the response to plain content
        if 'structuredContent' not in responses[4]['result']:
            # Fallback: ensure content text contains the expected answer
            assert 'content' in responses[4]['result']
            text_items = [c.get('text', '') for c in responses[4]['result']['content'] if isinstance(c, dict)]
            assert any('Mock LTM response' in t for t in text_items)

        assert 5 in responses
        # The gateway may return either a JSON-RPC error or a result describing the failure
        if 'error' in responses[5]:
            assert responses[5]['error']['code'] == -32000
        else:
            # Fallback: look for a helpful error message in result.content
            assert 'result' in responses[5]
            content_items = responses[5]['result'].get('content', [])
            assert any(isinstance(c, dict) and (('Unable to execute' in c.get('text', '')) or ('Simulated LTM error' in c.get('text', ''))) for c in content_items)
    finally:
        stopped.set()


def test_sse_client_persistent_connection(mock_mcp_server):
    # Verify that posting a JSON-RPC request triggers a broadcast Log in the mock server.
    import requests
    post_url = mock_mcp_server['url'] + '/model_context_protocol/2024-11-05/message'
    resp = requests.post(post_url, json={"jsonrpc": "2.0", "id": 7, "method": "tools/list", "params": {}})
    assert resp.status_code == 200
    # Wait for the server to log the broadcast
    stdout_log = Path(mock_mcp_server['log']['stdout'])
    deadline = time.time() + 5
    while time.time() < deadline:
        try:
            logs = stdout_log.read_text(errors='ignore')
        except Exception:
            logs = ''
        if 'Broadcasting response' in logs:
            assert 'tools' in logs or 'Echo Tool' in logs
            break
        time.sleep(0.05)
    else:
        pytest.fail('Server did not broadcast message')
