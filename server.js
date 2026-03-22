// Simple static server for dist so anyone can run without dev server
import http from 'http';
import { readFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { extname, join } from 'path';

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const root = join(process.cwd(), 'dist');
const port = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || !extname(urlPath)) urlPath = '/index.html';
  const filePath = join(root, urlPath);
  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  const type = mime[extname(filePath)] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Static site running at http://localhost:${port}`);
});
