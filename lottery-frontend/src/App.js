import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage'
import UserPage from './components/UserPage';
// import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/userpage" element={<UserPage />} />
        {/* <Route path="/admin/login" element={<AdminLoginPage />} /> */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
