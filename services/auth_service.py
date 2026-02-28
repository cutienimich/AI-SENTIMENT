import os
from datetime import datetime, timedelta, timezone
from services.db_service import get_db_connection

from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_verification_token
)
from utils.email import send_verification_email

TOKEN_EXPIRY_HOURS = 24


def register_user(email: str, password: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM accounts WHERE email = %s", (email,))
        existing = cursor.fetchone()

        if existing:
            return {"error": "Email is already registered"}

        # Hash password and generate verification token
        hashed = hash_password(password)
        token = generate_verification_token()
        token_expiry = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS)

        # Save to DB
        cursor.execute("""
            INSERT INTO accounts (email, password, is_verified, verification_token, token_expiry)
            VALUES (%s, %s, %s, %s, %s)
        """, (email, hashed, False, token, token_expiry))
        conn.commit()

        # Send verification email
        send_verification_email(email, token)
        # Send verification email
        print(f"Sending email to: {email} with token: {token}")
        email_sent = send_verification_email(email, token)
        print(f"Email sent result: {email_sent}")

        return {"message": "Registration successful! Please check your email to verify your account."}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def verify_user(token: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, token_expiry FROM accounts 
            WHERE verification_token = %s AND is_verified = FALSE
        """, (token,))
        account = cursor.fetchone()

        if not account:
            return {"error": "Invalid or already used verification link"}

        # Check if token is expired
        token_expiry = account[1]
        if datetime.now(timezone.utc) > token_expiry.replace(tzinfo=timezone.utc):
            return {"error": "Verification link has expired"}

        # Mark as verified
        cursor.execute("""
            UPDATE accounts 
            SET is_verified = TRUE, verification_token = NULL, token_expiry = NULL
            WHERE id = %s
        """, (account[0],))
        conn.commit()

        return {"message": "Email verified successfully! You can now log in."}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def login_user(email: str, password: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, password, is_verified FROM accounts WHERE email = %s
        """, (email,))
        account = cursor.fetchone()

        if not account:
            return {"error": "Invalid email or password"}

        if not verify_password(password, account[1]):
            return {"error": "Invalid email or password"}

        if not account[2]:
            return {"error": "Please verify your email first"}

        token = create_access_token({"sub": email})
        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        print(f"Login error: {e}")  # ← add this
        raise e
    finally:
        cursor.close()
        conn.close()