"""Demo site and private SQLite quote inbox. Run: python server.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json, os, re, sqlite3, uuid

DB = Path(os.environ.get('QUOTE_DB', '~/.local/share/hatfield/quotes.sqlite3')).expanduser()
DB.parent.mkdir(parents=True, exist_ok=True)
with sqlite3.connect(DB) as db:
    db.execute('CREATE TABLE IF NOT EXISTS quotes (reference TEXT PRIMARY KEY, created TEXT DEFAULT CURRENT_TIMESTAMP, name TEXT, email TEXT, material TEXT, area TEXT, notes TEXT)')

class Site(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/status':
            self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(b'{"quotes":true}'); return
        if path in ('/', '/index.html', '/app.js') or re.fullmatch(r'/assets/[\w.-]+', path):
            return super().do_GET()
        self.send_error(404)

    def do_POST(self):
        if self.path != '/api/quotes': return self.send_error(404)
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 16000: return self.send_error(413)
            data = json.loads(self.rfile.read(length))
            values = [data[k].strip() for k in ('name','email','material','size','notes')]
            if not values[0] or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', values[1]) or not values[2] or any(len(v)>2000 for v in values) or (values[3] and not 0 < float(values[3]) <= 100000000): raise ValueError()
        except (ValueError, TypeError, KeyError, AttributeError): return self.send_error(400)
        ref = 'HF-' + uuid.uuid4().hex[:12].upper()
        try:
            with sqlite3.connect(DB) as db:
                db.execute('INSERT INTO quotes(reference,name,email,material,area,notes) VALUES(?,?,?,?,?,?)', [ref]+values)
        except sqlite3.Error: return self.send_error(503)
        self.send_response(201); self.send_header('Content-Type','application/json'); self.end_headers()
        self.wfile.write(json.dumps({'reference':ref}).encode())

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '8080'))), Site).serve_forever()
