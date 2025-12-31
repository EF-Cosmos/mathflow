
import jwt

secret = "your-super-secret-jwt-key-change-this-in-production"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

try:
    decoded = jwt.decode(anon_key, secret, algorithms=["HS256"])
    print("Signature Valid!")
    print(decoded)
except jwt.InvalidSignatureError:
    print("Signature INVALID!")
except Exception as e:
    print(f"Error: {e}")
