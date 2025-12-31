
import jwt

secret = "your-super-secret-jwt-key-change-this-in-production"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MTcyNzA2LCJleHAiOjIwODI1MzI3MDZ9.Z-v-zSbWGYG52KIuWODLDc3dXO7mumSh3RvTy8SZAM0"

try:
    decoded = jwt.decode(anon_key, secret, algorithms=["HS256"])
    print("Signature Valid!")
    print(decoded)
except jwt.InvalidSignatureError:
    print("Signature INVALID!")
except Exception as e:
    print(f"Error: {e}")
