import sys
import time

print('ECHO server starting', flush=True)
try:
    for line in sys.stdin:
        if not line:
            continue
        print('RX:', line.strip(), flush=True)
        sys.stdout.flush()
except Exception as e:
    print('ECHO server error:', e, file=sys.stderr)
    raise
