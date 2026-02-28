import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './Dashboard.css';

export default function Dashboard() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSurveys = async () => {
        try {
            const response = await api.get('/surveys');
            setSurveys(response.data);
        } catch (err) {
            console.error('Failed to fetch surveys:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const featured = surveys[0];
    const rest = surveys.slice(1);

    return (
        <div className="dashboard">

            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">EmotiSurvey</span>
                </div>

                <div className="header-profile" ref={dropdownRef}>
                    <button
                        className="profile-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-email">{user?.email}</div>
                            <hr />
                            <Link to="/about" className="dropdown-item">Tungkol sa Amin</Link>
                            <Link to="/terms" className="dropdown-item">Mga Tuntunin at Patakaran</Link>
                            <Link to="/follow" className="dropdown-item">Sundan Kami</Link>
                            <hr />
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                Mag-logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main */}
            <main className="main">

                {/* Top bar */}
                <div className="main-topbar">
                    <h1>Aking mga Survey</h1>

                </div>

                {loading ? (
                    <div className="loading">Naglo-load...</div>
                ) : surveys.length === 0 ? (
                    <div className="empty-state">
                        <p>Wala pang survey na nagawa.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Survey */}
                        {featured && (
                            <div className="featured-survey" onClick={() => navigate(`/survey/${featured.survey_id}`)}>
                                <div className="featured-badge">Pinakabago</div>
                                <h2>{featured.title}</h2>
                                <p>{featured.description || 'Walang paglalarawan'}</p>
                                <div className="featured-footer">
                                    <span className={`status ${featured.is_active ? 'active' : 'inactive'}`}>
                                        {featured.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                    </span>
                                    <span className="survey-date">
                                        {new Date(featured.created_at).toLocaleDateString('fil-PH')}
                                    </span>
                                    <span className="respondent-count">
                                        👥 {featured.respondent_count} sumagot
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Rest of surveys */}
                        {rest.length > 0 && (
                            <>
                                <h3 className="list-title">Iba pang mga Survey</h3>
                                <div className="survey-list">
                                    {rest.map(survey => (
                                        <div
                                            key={survey.survey_id}
                                            className="survey-card"
                                            onClick={() => navigate(`/survey/${survey.survey_id}`)}
                                        >
                                            <div className="survey-card-info">
                                                <h4>{survey.title}</h4>
                                                <p>{survey.description || 'Walang paglalarawan'}</p>
                                            </div>
                                           <div className="survey-card-right">
                                            <span className={`status ${survey.is_active ? 'active' : 'inactive'}`}>
                                                {survey.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                            </span>
                                            <span className="survey-date">
                                                {new Date(survey.created_at).toLocaleDateString('fil-PH')}
                                            </span>
                                            <span className="respondent-count">
                                                👥 {survey.respondent_count} sumagot
                                            </span>
                                        </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
                    <button className="btn-create btn-create-bottom" onClick={() => navigate('/create-survey')}>
                    + Gumawa ng Survey
                </button>
            </main>
        </div>
    );
}