import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import AnswerSurvey from './pages/AnswerSurvey';




function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-survey" element={<CreateSurvey />} />
            <Route path="/survey/:surveyId" element={<SurveyDetail />} />
            <Route path="/answer/:token" element={<AnswerSurvey />} />

        </Routes>
    )
}

export default App;


