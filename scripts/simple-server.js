const http = require('http');

const PORT = 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok\n');
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
