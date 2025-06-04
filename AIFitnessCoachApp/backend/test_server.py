#!/usr/bin/env python3
"""
Simple test server to verify network connectivity
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import socket

class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "Test Server",
                "message": "Connection successful!"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == '__main__':
    host = '0.0.0.0'
    port = 8000
    ip = get_ip_address()
    
    print(f"🧪 Starting test server...")
    print(f"📍 Server will listen on: {host}:{port}")
    print(f"💻 Your machine's IP: {ip}")
    print(f"📱 Test from phone browser: http://{ip}:{port}/health")
    print(f"\nPress Ctrl+C to stop\n")
    
    server = HTTPServer((host, port), TestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✋ Server stopped")