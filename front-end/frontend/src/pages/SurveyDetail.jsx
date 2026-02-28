import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './SurveyDetail.css';

export default function SurveyDetail() {
    const { surveyId } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [newQuestion, setNewQuestion] = useState({ question_text: '' });
    const [addingQuestion, setAddingQuestion] = useState(false);

    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSurveyData();
    }, [surveyId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeTab === 'responses') fetchResponses();
        if (activeTab === 'analytics') fetchAnalytics();
    }, [activeTab]);

    const fetchSurveyData = async () => {
        try {
            const [surveyRes, questionsRes] = await Promise.all([
                api.get(`/surveys`),
                api.get(`/questions/${surveyId}`)
            ]);
            const found = surveyRes.data.find(s => s.survey_id === parseInt(surveyId));
            setSurvey(found);
            setEditTitle(found?.title || '');
            setEditDescription(found?.description || '');
            setQuestions(questionsRes.data.questions || []);
        } catch (err) {
            setError('Hindi ma-load ang survey.');
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        try {
            const res = await api.get(`/responses/${surveyId}`);
            setResponses(res.data.responses || []);
        } catch (err) {
            console.error('Failed to fetch responses:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`/analytics/${surveyId}`);
            setAnalytics(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    const handleToggle = async () => {
        try {
            const res = await api.patch(`/surveys/${surveyId}/toggle`);
            setSurvey({ ...survey, is_active: res.data.is_active });
        } catch (err) {
            console.error('Failed to toggle survey:', err);
        }
    };

    const handleCopyLink = () => {
        const token = survey?.survey_link?.replace('/survey/', '');
        const link = `${window.location.origin}/answer/${token}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/surveys/${surveyId}`, {
                title: editTitle,
                description: editDescription
            });
            setSurvey({ ...survey, title: editTitle, description: editDescription });
            setEditMode(false);
        } catch (err) {
            console.error('Failed to update survey:', err);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Sigurado ka bang gusto mong burahin ang tanong na ito?')) return;
        try {
            await api.delete(`/questions/${questionId}`);
            setQuestions(questions.filter(q => q.question_id !== questionId));
        } catch (err) {
            console.error('Failed to delete question:', err);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.question_text.trim()) return;
        setAddingQuestion(true);
        try {
            const res = await api.post('/questions', {
                survey_id: parseInt(surveyId),
                question_text: newQuestion.question_text
            });
            setQuestions([...questions, {
                question_id: res.data.question_id,
                question_text: newQuestion.question_text
            }]);
            setNewQuestion({ question_text: '' });
        } catch (err) {
            console.error('Failed to add question:', err);
        } finally {
            setAddingQuestion(false);
        }
    };

    const handleTabChange = (tab) => {
        if (editMode) setEditMode(false);
        setActiveTab(tab);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Naglo-load...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    return (
        <div className="survey-detail">

            {/* Header */}
            <header className="header">
                <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">EmotiSurvey</span>
                </div>
                <div className="header-profile" ref={dropdownRef}>
                    <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
                    </button>
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-email">{user?.email}</div>
                            <hr />
                            <button className="dropdown-item logout" onClick={handleLogout}>Mag-logout</button>
                        </div>
                    )}
                </div>
            </header>

            <main className="main">

                <div className="page-top">
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>← Bumalik</button>
                    <div className="survey-title-area">
                        {editMode ? (
                            <div className="edit-title-form">
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="edit-input-title"
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="edit-input-desc"
                                    rows={2}
                                />
                                <div className="edit-actions">
                                    <button className="btn-save" onClick={handleSaveEdit}>I-save</button>
                                    <button className="btn-cancel" onClick={() => setEditMode(false)}>Kanselahin</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1>{survey?.title}</h1>
                                <p className="survey-desc">{survey?.description || 'Walang paglalarawan'}</p>
                            </>
                        )}
                    </div>

                    <div className="survey-actions">
                        <span className={`status ${survey?.is_active ? 'active' : 'inactive'}`}>
                            {survey?.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                        </span>
                        <button className="btn-toggle" onClick={handleToggle}>
                            {survey?.is_active ? 'I-deactivate' : 'I-activate'}
                        </button>
                        <button className="btn-copy" onClick={handleCopyLink}>
                            {copied ? '✓ Nakopya!' : '🔗 Kopyahin ang Link'}
                        </button>
                        {!editMode && (
                            <button className="btn-edit" onClick={() => setEditMode(true)}>✏️ I-edit</button>
                        )}
                        <button
                            className="btn-delete-survey"
                            onClick={async () => {
                                if (!window.confirm('Sigurado ka bang gusto mong burahin ang survey na ito? Hindi na ito mababawi.')) return;
                                try {
                                    await api.delete(`/surveys/${surveyId}`);
                                    navigate('/dashboard');
                                } catch (err) {
                                    console.error('Failed to delete survey:', err);
                                }
                            }}
                        >
                            🗑️ Burahin
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {['overview', 'questions', 'responses', 'analytics'].map(tab => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab === 'overview' && 'Overview'}
                            {tab === 'questions' && 'Mga Tanong'}
                            {tab === 'responses' && 'Mga Sagot'}
                            {tab === 'analytics' && 'Analytics'}
                        </button>
                    ))}
                </div>

                <div className="tab-content">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="overview-cards">
                                <div className="overview-card">
                                    <span className="card-label">Kabuuang Tanong</span>
                                    <span className="card-value">{questions.length}</span>
                                </div>
                                <div className="overview-card">
                                    <span className="card-label">Kabuuang Sagot</span>
                                    <span className="card-value">{analytics?.total_responses ?? '—'}</span>
                                </div>
                                <div className="overview-card">
                                    <span className="card-label">Status</span>
                                    <span className={`card-value ${survey?.is_active ? 'text-active' : 'text-inactive'}`}>
                                        {survey?.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Questions Tab */}
                    {activeTab === 'questions' && (
                        <div className="questions-tab">
                            {questions.length === 0 ? (
                                <p className="empty-text">Wala pang tanong.</p>
                            ) : (
                                questions.map((q, index) => (
                                    <div key={q.question_id} className="question-item">
                                        <div className="question-item-info">
                                            <span className="q-number">#{index + 1}</span>
                                            <div>
                                                <p className="q-text">{q.question_text}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteQuestion(q.question_id)}
                                        >
                                            🗑️ Burahin
                                        </button>
                                    </div>
                                ))
                            )}

                            <div className="add-question-form">
                                <h3>Magdagdag ng Tanong</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Ilagay ang tanong"
                                        value={newQuestion.question_text}
                                        onChange={(e) => setNewQuestion({ question_text: e.target.value })}
                                        maxLength={500}
                                    />
                                </div>
                                <button
                                    className="btn-add"
                                    onClick={handleAddQuestion}
                                    disabled={addingQuestion}
                                >
                                    {addingQuestion ? 'Nagdadagdag...' : '+ Idagdag'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Responses Tab */}
                    {activeTab === 'responses' && (
                        <div className="responses-tab">
                            {responses.length === 0 ? (
                                <p className="empty-text">Wala pang mga sagot.</p>
                            ) : (
                                <table className="responses-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Tanong</th>
                                            <th>Sagot</th>
                                            <th>Emosyon</th>
                                            <th>Sentiment</th>
                                            <th>Score</th>
                                            <th>Petsa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {responses.map(r => (
                                            <tr key={r.response_id}>
                                                <td>{r.respondent_email}</td>
                                                <td>{r.question_text}</td>
                                                <td>{r.original_text}</td>
                                                <td><span className="emotion-badge">{r.emotion_label}</span></td>
                                                <td>
                                                    <span className={`sentiment-badge ${r.sentiment_label}`}>
                                                        {r.sentiment_label}
                                                    </span>
                                                </td>
                                                <td>{(r.sentiment_score * 100).toFixed(1)}%</td>
                                                <td>{new Date(r.created_at).toLocaleDateString('fil-PH')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="analytics-tab">
                            {!analytics ? (
                                <p className="empty-text">Naglo-load ng analytics...</p>
                            ) : analytics.total_responses === 0 ? (
                                <p className="empty-text">Wala pang mga sagot para sa analytics.</p>
                            ) : (
                                <>
                                    <h3>Kabuuang Distribusyon ng Sentiment</h3>
                                    <div className="emotion-grid">
                                        {Object.entries(analytics.sentiment_distribution).map(([sentiment, data]) => (
                                            <div key={sentiment} className={`emotion-card sentiment-${sentiment}`}>
                                                <span className="emotion-name">{sentiment}</span>
                                                <span className="emotion-percent">{data.percentage}%</span>
                                                <div className="emotion-bar">
                                                    <div className={`emotion-fill fill-${sentiment}`} style={{ width: `${data.percentage}%` }} />
                                                </div>
                                                <span className="emotion-count">{data.count} sagot</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3>Kabuuang Distribusyon ng Emosyon</h3>
                                    <div className="emotion-grid">
                                        {Object.entries(analytics.emotion_distribution).map(([emotion, data]) => (
                                            <div key={emotion} className="emotion-card">
                                                <span className="emotion-name">{emotion}</span>
                                                <span className="emotion-percent">{data.percentage}%</span>
                                                <div className="emotion-bar">
                                                    <div className="emotion-fill" style={{ width: `${data.percentage}%` }} />
                                                </div>
                                                <span className="emotion-count">{data.count} sagot</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 className="per-question-title">Per Tanong</h3>
                                    {analytics.per_question.map(q => (
                                        <div key={q.question_id} className="question-analytics">
                                            <p className="q-analytics-text">{q.question_text}</p>

                                            <p className="analytics-sub-title">Sentiment</p>
                                            <div className="emotion-grid">
                                                {Object.entries(q.sentiment_distribution).map(([sentiment, data]) => (
                                                    <div key={sentiment} className={`emotion-card sentiment-${sentiment}`}>
                                                        <span className="emotion-name">{sentiment}</span>
                                                        <span className="emotion-percent">{data.percentage}%</span>
                                                        <div className="emotion-bar">
                                                            <div className={`emotion-fill fill-${sentiment}`} style={{ width: `${data.percentage}%` }} />
                                                        </div>
                                                        <span className="emotion-count">{data.count} sagot</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="analytics-sub-title">Emosyon</p>
                                            <div className="emotion-grid">
                                                {Object.entries(q.emotion_distribution).map(([emotion, data]) => (
                                                    <div key={emotion} className="emotion-card">
                                                        <span className="emotion-name">{emotion}</span>
                                                        <span className="emotion-percent">{data.percentage}%</span>
                                                        <div className="emotion-bar">
                                                            <div className="emotion-fill" style={{ width: `${data.percentage}%` }} />
                                                        </div>
                                                        <span className="emotion-count">{data.count} sagot</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}