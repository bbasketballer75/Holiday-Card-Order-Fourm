import subprocess, sys, json, time

proc = subprocess.Popen([sys.executable, 'friendly-city-print-shop/scripts/py-run-mcp-gateway.py', '--upstream-url', 'http://127.0.0.1:39300/model_context_protocol/2024-11-05/sse'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

# Wait for the gateway to start
for _ in range(10):
    time.sleep(0.5)
    if proc.poll() is not None:
        print('proc exited, stderr:')
        print(proc.stderr.read())
        sys.exit(1)

init = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "test", "version": "1.0"},
    },
}
proc.stdin.write(json.dumps(init) + "\n")
proc.stdin.flush()

# Wait up to 5 seconds for output
start = time.time()
while time.time() - start < 5:
    line = proc.stdout.readline()
    if line:
        print('OUT:', line.strip())
        break

err = proc.stderr.read()
print('ERR:', err)

try:
    proc.terminate()
    proc.wait(timeout=1)
except Exception:
    proc.kill()
