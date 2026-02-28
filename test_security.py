from dotenv import load_dotenv
load_dotenv() 

from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_verification_token
)

# Test 1: hash_password
print("=== Test 1: Hash Password ===")
hashed = hash_password("mypassword123")
print(f"Hashed: {hashed}")

# Test 2: verify_password
print("\n=== Test 2: Verify Password ===")
print(f"Correct password: {verify_password('mypassword123', hashed)}")   # True
print(f"Wrong password: {verify_password('wrongpassword', hashed)}")      # False

# Test 3: create_access_token
print("\n=== Test 3: Create JWT Token ===")
token = create_access_token({"sub": "test@email.com"})
print(f"Token: {token}")

# Test 4: decode_access_token
print("\n=== Test 4: Decode JWT Token ===")
decoded = decode_access_token(token)
print(f"Decoded: {decoded}")

# Test 5: invalid token
print("\n=== Test 5: Invalid Token ===")
invalid = decode_access_token("invalidtoken123")
print(f"Invalid token result: {invalid}")   # None

# Test 6: generate_verification_token
print("\n=== Test 6: Verification Token ===")
ver_token = generate_verification_token()
print(f"Verification Token: {ver_token}")