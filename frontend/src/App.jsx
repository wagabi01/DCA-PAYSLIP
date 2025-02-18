import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styless/custom.css"; // Custom CSS file for additional styling
import PayslipPage from './pages/PayslipPage.jsx';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/payslip" element={<PayslipPage />} /> {/* New route for PayslipPage */}
            </Routes>
        </Router>
    );
};

export default App;
