const http = require('node:http');
const api = require('./api.js')

const hostname = 'localhost';
const port = 8000;

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
        api.evalReq(req, res);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
