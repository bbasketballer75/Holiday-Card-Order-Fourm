#!/usr/bin/env python3
"""
Run a Pieces MCP Gateway connecting to an upstream SSE MCP endpoint.

This wrapper imports the MCPGateway from the installed Pieces CLI package and
runs it with an explicit upstream URL. Use this for local testing with the
mock MCP SSE server at `http://localhost:39300/model_context_protocol/2024-11-05/sse`.

Usage:
  python py-run-mcp-gateway.py --upstream-url "http://localhost:39300/model_context_protocol/2024-11-05/sse"

Notes:
  - Requires `pieces-cli` to be installed (pip install pieces-cli) or the
    local repository to be installed as an editable package.
  - This runs the gateway in stdio mode; you can connect a client that speaks
    the MCP stdio protocol to the gateway's stdio streams.
"""
import argparse
import asyncio
import sys

def main():
    parser = argparse.ArgumentParser(description="Run Pieces MCP Gateway wrapper")
    parser.add_argument(
        "--upstream-url",
        dest="upstream_url",
        default="http://localhost:39300/model_context_protocol/2024-11-05/sse",
        help="Upstream SSE MCP endpoint (default: local mock server)",
    )
    parser.add_argument(
        "--server-name",
        dest="server_name",
        default="pieces-stdio-mcp-local",
        help="Server name for the local MCP gateway",
    )
    args = parser.parse_args()

    try:
        from pieces.mcp.gateway import MCPGateway
        from pieces.settings import Settings
        import logging
        # Enable debug logging for troubleshooting during tests
        try:
            Settings.logger.logger.setLevel(logging.DEBUG)
        except Exception:
            pass
    except Exception as e:
        print("Failed to import pieces. Is 'pieces-cli' installed?", file=sys.stderr)
        raise

    # For debugging, use a subclass that prints lifecycle markers to stdout/stderr
    class DebugMCPGateway(MCPGateway):
        async def run(self):
            try:
                print('DBG: Gateway.run started', file=sys.stderr, flush=True)
                if self.upstream.upstream_url:
                    try:
                        await self.upstream.connect(send_notification=False)
                    except Exception as e:
                        print(f'DBG: upstream connect failed: {e}', file=sys.stderr, flush=True)
                print('DBG: entering stdio server', file=sys.stderr, flush=True)
                await super().run()
            finally:
                print('DBG: Gateway.run finished', file=sys.stderr, flush=True)

    gateway = DebugMCPGateway(server_name=args.server_name, upstream_url=args.upstream_url)
    print(f'Gateway starting with upstream: {args.upstream_url}', file=sys.stderr, flush=True)
    # Debugging: monkey-patch stdio server and ServerSession to print lifecycle events
    try:
        from contextlib import asynccontextmanager
        import mcp.server.stdio as stdio_mod
        import mcp.server.session as session_mod

        original_stdio_server = stdio_mod.stdio_server

        @asynccontextmanager
        async def debug_stdio_server(*a, **kw):
            async with original_stdio_server(*a, **kw) as (read_stream, write_stream):
                print('GATEWAY_STDIO_ENTERED', flush=True)
                yield read_stream, write_stream

        stdio_mod.stdio_server = debug_stdio_server

        orig_received = session_mod.ServerSession._received_request

        async def patched_received_request(self, responder):
            try:
                # responder.request.root is a Pydantic model (types.ClientRequest)
                root = getattr(responder, 'request', None)
                r = getattr(root, 'root', None)
                name = type(r).__name__ if r is not None else 'Unknown'
                print(f'GATEWAY_RECEIVED_REQUEST: {name}', flush=True)
            except Exception as e:
                print(f'GATEWAY_RECEIVED_REQUEST_ERROR: {e}', flush=True)
            return await orig_received(self, responder)

        session_mod.ServerSession._received_request = patched_received_request
    except Exception:
        # If debug patching fails, don't stop gateway from starting
        pass

    # Add a temporary logging handler that prints a readiness marker when the
    # gateway starts its stdio server. This ensures tests don't race by seeing
    # the process is alive before stdio is accepting connections.
    import logging
    import threading

    class _ReadyHandler(logging.Handler):
        def __init__(self):
            super().__init__()
            self._printed = False

        def emit(self, record):
            try:
                msg = self.format(record)
                if "Starting stdio server for" in msg and not self._printed:
                    # Print readiness to stdout (captured by tests)
                    print("GATEWAY_READY", flush=True)
                    self._printed = True
            except Exception:
                pass

    try:
        # Ensure the logger will emit info-level messages and add our handlers
        Settings.logger.logger.setLevel(logging.DEBUG)
        ready_handler = _ReadyHandler()
        Settings.logger.logger.addHandler(ready_handler)
        # Also mirror internal debug logs to stderr for easier debugging
        log_stream_handler = logging.StreamHandler(sys.stderr)
        log_stream_handler.setLevel(logging.DEBUG)
        Settings.logger.logger.addHandler(log_stream_handler)
    except Exception:
        ready_handler = None
        log_stream_handler = None

    try:
        asyncio.run(gateway.run())
    except KeyboardInterrupt:
        print("MCP Gateway interrupted, shutting down")
    except Exception:
        raise
    finally:
        try:
            if ready_handler is not None:
                Settings.logger.logger.removeHandler(ready_handler)
            if log_stream_handler is not None:
                Settings.logger.logger.removeHandler(log_stream_handler)
        except Exception:
            pass

if __name__ == "__main__":
    main()
