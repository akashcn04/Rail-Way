import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PnrStatus from './pages/PnrStatus';
import Schedule from './pages/Schedules';
import Stations from './pages/Stations';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { User } from './types';
import Employee from './pages/Employee';

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
          <Route path="/schedule" element={<Schedule user={user} />} />
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
         path="/employee" 
         element={user? <Employee />:<Navigate to="/login"/>} 
         />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;