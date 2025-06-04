import socket
import sys

def test_bind():
    try:
        # Test binding to all interfaces
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('0.0.0.0', 8000))
        s.listen(1)
        print("✅ Successfully bound to 0.0.0.0:8000")
        print("✅ Server is accessible from all network interfaces")
        print(f"📱 Access from phone: http://192.168.1.187:8000")
        print("\nPress Ctrl+C to stop")
        
        while True:
            conn, addr = s.accept()
            print(f"📲 Connection from: {addr}")
            conn.send(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello from Python!")
            conn.close()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPossible solutions:")
        print("1. Make sure no other process is using port 8000")
        print("2. Check firewall settings")
        print("3. Try running with sudo (not recommended)")

if __name__ == "__main__":
    test_bind()