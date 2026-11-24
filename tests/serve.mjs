import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.json': 'application/json', '.xml': 'application/xml', '.ico': 'image/x-icon', '.txt': 'text/plain' };

export function startServer(port, inject = '') {
  const server = http.createServer((req, res) => {
    let p;
    try { p = path.join(root, decodeURIComponent(req.url.split('?')[0])); } catch { p = ''; }
    if (p !== root && !p.startsWith(root + path.sep)) {
      res.writeHead(404);
      return res.end();
    }
    for (const c of [p, p + '.html', path.join(p, 'index.html')]) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        const type = types[path.extname(c)] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': type });
        if (inject && type === 'text/html') return res.end(fs.readFileSync(c, 'utf8').replace('<head>', '<head>' + inject));
        return fs.createReadStream(c).pipe(res);
      }
    }
    res.writeHead(404);
    res.end();
  });
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)));
}
