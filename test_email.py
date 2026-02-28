from dotenv import load_dotenv
load_dotenv()

import os
print(f"USERNAME: {os.getenv('MAIL_USERNAME')}")
print(f"PASSWORD: {os.getenv('MAIL_PASSWORD')}")
print(f"FROM: {os.getenv('MAIL_FROM')}")


from utils.email import send_verification_email

result = send_verification_email("michellepostrado26@gmail.com", "testtoken123")
print(f"Email sent: {result}")