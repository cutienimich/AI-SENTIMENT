import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-page">

            {/* Section 1 - Title */}
            <section className="section title-section">
                <h1 className="title">EmotiSurvey</h1>
                <p className="subtitle">Suriin ang emosyon sa likod ng bawat sagot</p>
                <a href="#login-section" className="scroll-down">↓ Magsimula</a>
            </section>

            {/* Section 2 - Login Form */}
            <section className="section form-section" id="login-section">
                <div className="form-card">
                    <h2>Mag-login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Ilagay ang iyong email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Ilagay ang iyong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-extras">
                            <Link to="/forgot-password">Nakalimutan ang password?</Link>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Naglo-login...' : 'Login'}
                        </button>
                    </form>
                    <p className="register-link">
                        Wala pang account? <Link to="/register">Mag-register dito</Link>
                    </p>
                </div>
            </section>

            {/* Section 3 - About Us */}
            <section className="section about-section">
                <h2>Tungkol sa Amin</h2>
                <p>Ang EmotiSurvey ay isang sistema na gumagamit ng artificial intelligence para suriin ang emosyon ng mga kalahok sa survey.</p>
            </section>

            {/* Section 4 - Follow Us */}
            <section className="section follow-section">
                <h2>Sundan Kami</h2>
                <div className="social-links">
                    <a href="#">Facebook</a>
                    <a href="#">Twitter</a>
                    <a href="#">Instagram</a>
                </div>
            </section>

        </div>
    );
}