import requests
import json
import os
import time

# Configuration
API_URL = "http://localhost:8000"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MTc5NDAzLCJleHAiOjIwODI1Mzk0MDN9.kjq2CFAdDsu769R-hFIrHr11Am4cKhUTJEVIZtIPrk8"

# Headers
headers = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json"
}

def register_and_login():
    email = f"testuser_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering user: {email}")
    
    # 1. Sign Up
    auth_url = f"{API_URL}/auth/v1/signup"
    payload = {
        "email": email,
        "password": password
    }
    response = requests.post(auth_url, headers=headers, json=payload)
    
    if response.status_code != 200:
        print(f"Signup failed: {response.text}")
        return None
        
    data = response.json()
    access_token = data.get("access_token")
    user_id = data.get("user", {}).get("id")
    
    print(f"User registered. ID: {user_id}")
    return access_token, user_id

def test_flow():
    token, user_id = register_and_login()
    if not token:
        return

    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {token}"

    # 2. Create Derivation
    print("\nCreating Derivation...")
    derivation_url = f"{API_URL}/rest/v1/derivations"
    derivation_payload = {
        "title": "Test Derivation",
        "user_id": user_id
    }
    # Prefer return=representation to get the ID back
    auth_headers["Prefer"] = "return=representation"
    
    response = requests.post(derivation_url, headers=auth_headers, json=derivation_payload)
    
    if response.status_code != 201:
        print(f"Create derivation failed: {response.status_code} {response.text}")
        return

    derivation = response.json()[0]
    derivation_id = derivation["id"]
    print(f"Derivation created. ID: {derivation_id}")

    # 3. Create Steps
    print("\nCreating Steps...")
    steps_url = f"{API_URL}/rest/v1/derivation_steps"
    steps_payload = [
        {
            "derivation_id": derivation_id,
            "step_number": 1,
            "input_latex": "",
            "output_latex": "x^2",
            "operation": "Input"
        },
        {
            "derivation_id": derivation_id,
            "step_number": 2,
            "input_latex": "x^2",
            "output_latex": "2x",
            "operation": "Derivative"
        }
    ]
    
    response = requests.post(steps_url, headers=auth_headers, json=steps_payload)
    
    if response.status_code != 201:
        print(f"Create steps failed: {response.status_code} {response.text}")
        return
        
    print("Steps created successfully.")

    # 4. Read Steps
    print("\nReading Steps...")
    read_url = f"{API_URL}/rest/v1/derivation_steps?derivation_id=eq.{derivation_id}&select=*"
    response = requests.get(read_url, headers=auth_headers)
    
    if response.status_code != 200:
        print(f"Read steps failed: {response.status_code} {response.text}")
        return
        
    steps = response.json()
    print(f"Read {len(steps)} steps:")
    for step in steps:
        print(f" - Step {step['step_number']}: {step['input_latex']} -> {step['output_latex']} ({step['operation']})")

    # 5. Delete Steps (Simulate Update)
    print("\nDeleting Steps (Simulate Update)...")
    delete_url = f"{API_URL}/rest/v1/derivation_steps?derivation_id=eq.{derivation_id}"
    response = requests.delete(delete_url, headers=auth_headers)
    
    if response.status_code != 204:
        print(f"Delete steps failed: {response.status_code} {response.text}")
        return
    print("Steps deleted.")
    
    # 6. Verify Deletion
    response = requests.get(read_url, headers=auth_headers)
    steps = response.json()
    print(f"Steps after delete: {len(steps)}")

if __name__ == "__main__":
    test_flow()
