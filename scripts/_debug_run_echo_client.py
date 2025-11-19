import subprocess, sys, time

proc = subprocess.Popen([sys.executable, 'scripts/_debug_stdio_echo.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
time.sleep(0.1)
proc.stdin.write('hello\n')
proc.stdin.flush()
line = proc.stdout.readline()
print('OUT:', line)
proc.terminate()
proc.wait()
