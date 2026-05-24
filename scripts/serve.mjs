import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const rootArg = process.argv[2] ?? 'dist';
const port = Number(process.argv[3] ?? 4173);
const root = path.resolve(process.cwd(), rootArg);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const resolveUnderRoot = (pathname) => {
  const resolved = path.resolve(root, `.${pathname}`);
  if (resolved === root || resolved.startsWith(`${root}${path.sep}`)) {
    return resolved;
  }
  throw new Error('Path outside root');
};

const server = http.createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let filePath = resolveUnderRoot(path.normalize(requested));

    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat) {
      if (!path.extname(filePath)) {
        filePath = resolveUnderRoot(`${path.relative(root, filePath)}/index.html`);
      } else {
        filePath = path.join(root, '404.html');
      }
    } else if (stat.isDirectory()) {
      filePath = resolveUnderRoot(`${path.relative(root, filePath)}/index.html`);
    }

    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Mockery static server on http://localhost:${port} serving ${root}`);
});
