import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


def send_verification_email(to_email: str, token: str):
    verification_link = f"{BASE_URL}/auth/verify?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your account"
    message["From"] = MAIL_FROM
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <h2>Welcome to our platform!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="{verification_link}" 
               style="background-color:#4CAF50; color:white; padding:10px 20px; 
                      text-decoration:none; border-radius:5px;">
                Verify Account
            </a>
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <p>If you did not register, ignore this email.</p>
        </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
