
import jwt
import time

secret = "your-super-secret-jwt-key-change-this-in-production"

payload = {
    "role": "anon",
    "iss": "supabase",
    "iat": int(time.time()),
    "exp": int(time.time()) + (10 * 365 * 24 * 3600) # 10 years
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
