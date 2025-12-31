
import jwt

secret = "your-super-secret-jwt-token-with-at-least-32-characters-long"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

try:
    decoded = jwt.decode(anon_key, secret, algorithms=["HS256"])
    print("ANON_KEY is VALID")
    print(decoded)
except Exception as e:
    print(f"ANON_KEY is INVALID: {e}")
