import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './AnswerSurvey.css';

export default function AnswerSurvey() {
    const { token } = useParams();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSurvey();
    }, [token]);

    const fetchSurvey = async () => {
        try{
            // Get survey by token
            const surveyRes = await api.get(`/survey/${token}`);
            setSurvey(surveyRes.data);

            // Get questions
            const questionsRes = await api.get(`/questions/${surveyRes.data.survey_id}`);
            setQuestions(questionsRes.data.questions || []);

            // Initialize answers
            const initialAnswers = {};
            questionsRes.data.questions.forEach(q => {
                initialAnswers[q.question_id] = '';
            });
            setAnswers(initialAnswers);

        } catch (err) {
            if (err.response?.status === 403) {
                setError('Ang survey na ito ay hindi na aktibo.');
            } else if (err.response?.status === 404) {
                setError('Hindi mahanap ang survey.');
            } else if (err.response?.status === 401) {
                navigate(`/login?redirect=/answer/${token}`);
            } else {
                setError('May problema sa pag-load ng survey.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all answered
        for (const q of questions) {
            if (!answers[q.question_id]?.trim()) {
                setError(`Pakisagot ang lahat ng tanong.`);
                return;
            }
        }

        setSubmitting(true);

        try {
            // Submit each answer
            for (const q of questions) {
                await api.post('/submit-response', {
                    question_id: q.question_id,
                    text: answers[q.question_id]
                });
            }
            setSubmitted(true);
        } catch (err) {
            if (err.response?.data?.detail === 'You have already answered this survey') {
                setError('Nakapag-sagot ka na sa survey na ito.');
            } else {
                setError('Nabigo ang pag-submit. Subukan ulit.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="answer-survey">
                <header className="header">
                    <div className="header-logo">
                        <img src={viteLogo} alt="Logo" className="logo-img" />
                        <span className="logo-text">EmotiSurvey</span>
                    </div>
                </header>
                <div className="loading-screen">Naglo-load...</div>
            </div>
        );
    }

    // Error
    if (error && !survey) {
        return (
            <div className="answer-survey">
                <header className="header">
                    <div className="header-logo">
                        <img src={viteLogo} alt="Logo" className="logo-img" />
                        <span className="logo-text">EmotiSurvey</span>
                    </div>
                </header>
                <div className="error-screen">
                    <div className="error-card">
                        <span className="error-icon">⚠️</span>
                        <h2>{error}</h2>
                    </div>
                </div>
            </div>
        );
    }

    // Thank you screen
    if (submitted) {
        return (
            <div className="answer-survey">
                <header className="header">
                    <div className="header-logo">
                        <img src={viteLogo} alt="Logo" className="logo-img" />
                        <span className="logo-text">EmotiSurvey</span>
                    </div>
                </header>
                <div className="thankyou-screen">
                    <div className="thankyou-card">
                        <span className="thankyou-icon">✅</span>
                        <h2>Salamat sa iyong sagot!</h2>
                        <p>Ang iyong mga sagot ay matagumpay na naitala.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="answer-survey">

            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">EmotiSurvey</span>
                </div>
            </header>

            {/* Main */}
            <main className="main">
                {/* Survey Info */}
                <div className="survey-info-card">
                    <h1>{survey?.title}</h1>
                    {survey?.description && <p>{survey.description}</p>}
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {questions.map((q, index) => (
                        <div key={q.question_id} className="question-card">
                            <div className="question-header">
                                <span className="question-number">Tanong {index + 1}</span>
                                <span className="question-required">*</span>
                            </div>
                            <p className="question-text">{q.question_text}</p>
                            <textarea
                                className="answer-input"
                                placeholder="Isulat ang iyong sagot dito..."
                                value={answers[q.question_id] || ''}
                                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                                rows={4}
                                maxLength={1000}
                                required
                            />
                            <span className="char-count">
                                {answers[q.question_id]?.length || 0}/1000
                            </span>
                        </div>
                    ))}

                    <div className="submit-area">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Isinusumite...' : 'Isumite ang mga Sagot'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}