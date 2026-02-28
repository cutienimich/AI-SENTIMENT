from services.db_service import execute_query


def get_emotion_distribution_by_survey(survey_id: int):

    # Check if survey exists
    survey = execute_query(
        "SELECT id, title FROM surveys WHERE id = %s",
        (survey_id,),
        fetchone=True
    )

    if not survey:
        return None

    # Get total responses
    total = execute_query("""
        SELECT COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
    """, (survey_id,), fetchone=True)[0]

    if total == 0:
        return {
            "survey_id": survey_id,
            "title": survey[1],
            "total_responses": 0,
            "sentiment_distribution": {},
            "emotion_distribution": {},
            "per_question": []
        }

    # Overall sentiment distribution
    sentiment_rows = execute_query("""
        SELECT sentiment_label, COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
        GROUP BY sentiment_label
        ORDER BY COUNT(*) DESC
    """, (survey_id,), fetch=True)

    overall_sentiment = {}
    for sentiment, count in sentiment_rows:
        overall_sentiment[sentiment] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    # Overall emotion distribution
    emotion_rows = execute_query("""
        SELECT emotion_label, COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
        GROUP BY emotion_label
        ORDER BY COUNT(*) DESC
    """, (survey_id,), fetch=True)

    overall_emotion = {}
    for emotion, count in emotion_rows:
        overall_emotion[emotion] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    # Per question breakdown
    questions = execute_query("""
        SELECT id, question_text FROM questions WHERE survey_id = %s
    """, (survey_id,), fetch=True)

    per_question = []
    for q_id, q_text in questions:

        q_total = execute_query("""
            SELECT COUNT(*) FROM responses WHERE question_id = %s
        """, (q_id,), fetchone=True)[0]

        if q_total == 0:
            continue

        # Per question sentiment
        q_sentiments = execute_query("""
            SELECT sentiment_label, COUNT(*) FROM responses
            WHERE question_id = %s
            GROUP BY sentiment_label
            ORDER BY COUNT(*) DESC
        """, (q_id,), fetch=True)

        q_sentiment_distribution = {}
        for sentiment, count in q_sentiments:
            q_sentiment_distribution[sentiment] = {
                "count": count,
                "percentage": round((count / q_total) * 100, 2)
            }

        # Per question emotion
        q_emotions = execute_query("""
            SELECT emotion_label, COUNT(*) FROM responses
            WHERE question_id = %s
            GROUP BY emotion_label
            ORDER BY COUNT(*) DESC
        """, (q_id,), fetch=True)

        q_emotion_distribution = {}
        for emotion, count in q_emotions:
            q_emotion_distribution[emotion] = {
                "count": count,
                "percentage": round((count / q_total) * 100, 2)
            }

        per_question.append({
            "question_id": q_id,
            "question_text": q_text,
            "total_responses": q_total,
            "sentiment_distribution": q_sentiment_distribution,
            "emotion_distribution": q_emotion_distribution
        })

    return {
        "survey_id": survey_id,
        "title": survey[1],
        "total_responses": total,
        "sentiment_distribution": overall_sentiment,
        "emotion_distribution": overall_emotion,
        "per_question": per_question
    }