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
    except Exception as e:
        print("Failed to import pieces. Is 'pieces-cli' installed?", file=sys.stderr)
        raise

    gateway = MCPGateway(server_name=args.server_name, upstream_url=args.upstream_url)
    try:
        asyncio.run(gateway.run())
    except KeyboardInterrupt:
        print("MCP Gateway interrupted, shutting down")
    except Exception:
        raise

if __name__ == "__main__":
    main()
