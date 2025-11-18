Param(
    [string]$UpstreamURL = "http://localhost:39300/model_context_protocol/2024-11-05/sse"
)

Write-Host "Starting MCP Gateway with upstream URL: $UpstreamURL"

python ./scripts/py-run-mcp-gateway.py --upstream-url $UpstreamURL
