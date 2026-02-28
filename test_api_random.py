import requests
import random

# Your local FastAPI endpoint
URL = "http://127.0.0.1:8000/questions"

# Sample random data pools
questions = [
    "How do you feel studying late at night?",
    "Do you feel stressed about school deadlines?",
    "Are you satisfied with your learning environment?",
    "Do you feel motivated today?",
    "How is your emotional state this week?"
]

emotion_tags = [
    "stress",
    "anxiety",
    "satisfaction",
    "motivation",
    "neutral",
    "exhaustion"
]

question_types = ["open_ended"]

# Test 10 random requests
for i in range(10):

    payload = {
        "survey_id": random.randint(1, 3),
        "question_text": random.choice(questions),
        "emotion_tag": random.choice(emotion_tags),
        "question_type": random.choice(question_types)
    }

    response = requests.post(URL, json=payload)

    print(f"Test {i+1}")
    print(f"Status Code: {response.status_code}")

    try:
        print(response.json())
    except:
        print(response.text)
    print("------")