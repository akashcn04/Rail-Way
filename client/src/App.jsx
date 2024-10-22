import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/home';
import Navbar from './components/Navbar'; // Import your Navbar
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar /> {/* Navbar is inside the AuthProvider */}
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
