import httpx

url = 'http://127.0.0.1:39300/model_context_protocol/2024-11-05/sse'
print('Connecting to', url)
with httpx.Client(timeout=None) as client:
    with client.stream('GET', url) as rs:
        for line in rs.iter_lines():
            if line.strip():
                print('LINE:', line)
                break
