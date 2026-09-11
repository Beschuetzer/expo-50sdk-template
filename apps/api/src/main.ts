import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

const port = Number(process.env.PORT ?? 4200);
const host = process.env.HOST ?? '0.0.0.0';

function sendJson(response: ServerResponse, statusCode: number, body: object) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  });
  response.end(JSON.stringify(body));
}

function handleRequest(request: IncomingMessage, response: ServerResponse) {
  console.log(`Incoming request: ${request.method} ${request.url}`);
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  sendJson(response, 404, {
    status: 'not_found',
    message: 'Try GET /health',
  });
}

const server = createServer(handleRequest);

server.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
