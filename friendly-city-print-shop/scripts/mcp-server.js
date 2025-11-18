#!/usr/bin/env node
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || process.env.MCP_PORT || 39300;
const clients = new Set();

function sendSSE(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    if (req.method === 'GET' && parsed.pathname === '/model_context_protocol/2024-11-05/sse') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        res.write('\n');
        const id = Date.now() + Math.random();
        clients.add(res);
        sendSSE(res, 'connected', { id });
        req.on('close', () => {
            clients.delete(res);
        });
        return;
    }

    if (req.method === 'POST' && parsed.pathname === '/model_context_protocol/2024-11-05/message') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                const message = JSON.parse(body);
                for (const client of clients) {
                    sendSSE(client, 'message', { message });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ delivered: true, clients: clients.size }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'invalid json', msg: err.message }));
            }
        });
        return;
    }

    if (req.method === 'GET' && parsed.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Simple MCP SSE mock server for local development.\n');
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(PORT, () => {
    console.log(`MCP SSE mock server listening on http://localhost:${PORT}`);
    console.log('SSE endpoint: /model_context_protocol/2024-11-05/sse');
    console.log('POST messages at /model_context_protocol/2024-11-05/message');
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});
