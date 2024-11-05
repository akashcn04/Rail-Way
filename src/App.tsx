import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PnrStatus from './pages/PnrStatus';
import Schedule from './pages/Schedule';
import Stations from './pages/Stations';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import History from './pages/account/History';
import Payments from './pages/account/Payments';
import Cancellations from './pages/account/Cancellations';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pnr" element={<PnrStatus />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/" /> : <Signup />} 
          />
          <Route 
            path="/history" 
            element={user ? <History /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payments" 
            element={user ? <Payments /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cancellations" 
            element={user ? <Cancellations /> : <Navigate to="/login" />} 
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;