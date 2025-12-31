import jwt
import time

secret = "your-super-secret-jwt-key-change-this-in-production"
user_id = "1d19132f-869d-4ab1-ace2-2e98b72a8714"

payload = {
    "role": "authenticated",
    "iss": "supabase",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600,
    "sub": user_id,
    "email": "user@example.com",
    "app_metadata": {
        "provider": "email",
        "providers": ["email"]
    },
    "user_metadata": {}
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
