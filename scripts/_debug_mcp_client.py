import subprocess, sys, json, time, os

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
gateway_script = os.path.join(root_dir, 'friendly-city-print-shop', 'scripts', 'py-run-mcp-gateway.py')
proc = subprocess.Popen([sys.executable, gateway_script, '--upstream-url', 'http://127.0.0.1:39300/model_context_protocol/2024-11-05/sse'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

# Wait for a readiness line
start = time.time()
ready = False
while time.time() - start < 10:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    print('OUT:', line.strip())
    if 'GATEWAY_READY' in line:
        ready = True
        break

if not ready:
    print('Gateway did not ready in time; stderr:')
    print(proc.stderr.read())
    proc.kill()
    sys.exit(1)

# send initialize
init = { "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "debug-client", "version": "0.1"}} }
proc.stdin.write(json.dumps(init) + "\n")
proc.stdin.flush()

# Wait for response
start = time.time(); responses = []
while time.time() - start < 10:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    print('OUT2:', line.strip())
    try:
        j = json.loads(line.strip())
        responses.append(j)
        if any(r.get('id') == 1 for r in responses):
            break
    except Exception:
        continue

print('Init responses:', responses)

# Send tools/list
tools_list = { "jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {} }
proc.stdin.write(json.dumps(tools_list) + "\n")
proc.stdin.flush()

# Wait for tools/list response
start = time.time(); responses = []
while time.time() - start < 10:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    try:
        j = json.loads(line.strip())
        responses.append(j)
        if any(r.get('id') == 2 for r in responses):
            break
    except Exception:
        print('NONJSON:', line.strip())
        continue

print('tools/list responses:', responses)

# Call echo tool
echo_call = { "jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"toolId": "echo", "request": {"text": "Hello world"}} }
proc.stdin.write(json.dumps(echo_call) + "\n")
proc.stdin.flush()

# Wait for echo reply
start = time.time(); responses = []
while time.time() - start < 10:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    try:
        j = json.loads(line.strip())
        responses.append(j)
        if any(r.get('id') == 3 for r in responses):
            break
    except Exception:
        print('NONJSON:', line.strip())
        continue

print('Echo responses:', responses)

# Call ask_pieces_ltm tool
ask_ltm_call = { "jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"toolId": "ask_pieces_ltm", "request": {"text": "test LTM"}} }
proc.stdin.write(json.dumps(ask_ltm_call) + "\n")
proc.stdin.flush()

# Wait for LTM reply
start = time.time(); responses = []
while time.time() - start < 10:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    try:
        j = json.loads(line.strip())
        responses.append(j)
        if any(r.get('id') == 4 for r in responses):
            break
    except Exception:
        print('NONJSON:', line.strip())
        continue

print('ask_pieces_ltm responses:', responses)

proc.terminate()
proc.wait()
