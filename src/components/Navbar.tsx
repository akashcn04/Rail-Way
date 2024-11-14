import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Train, Menu, X, UserCircle } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-indigo-600 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Train className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-xl font-bold">RailBooker</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  Home
                </Link>
                <Link to="/pnr" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  PNR Status
                </Link>
                <Link to="/schedule" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  Train Schedule
                </Link>
                <Link to="/stations" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  Stations
                </Link>
                <Link to="/contact" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-white hover:bg-indigo-500 px-3 py-2 rounded-md"
                  >
                    <UserCircle className="h-6 w-6 mr-2" />
                    {user.name}
                  </button>
                  
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link 
                            to="/history" 
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            History
                          </Link>
                          <Link 
                            to="/payments" 
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Payments
                          </Link>
                          <Link 
                            to="/cancellations" 
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Cancellations
                          </Link>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout?.();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link 
              to="/pnr" 
              onClick={() => setIsOpen(false)}
              className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
            >
              PNR Status
            </Link>
            <Link 
              to="/schedule" 
              onClick={() => setIsOpen(false)}
              className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
            >
              Train Schedule
            </Link>
            <Link 
              to="/stations" 
              onClick={() => setIsOpen(false)}
              className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
            >
              Stations
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)}
              className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
            >
              Contact Us
            </Link>
            {!user && (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
              >
                Login / Signup
              </Link>
            )}
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-indigo-500">
              <div className="px-2 space-y-1">
                <Link 
                  to="/history" 
                  onClick={() => setIsOpen(false)}
                  className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  History
                </Link>
                <Link 
                  to="/payments" 
                  onClick={() => setIsOpen(false)}
                  className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  Payments
                </Link>
                <Link 
                  to="/cancellations" 
                  onClick={() => setIsOpen(false)}
                  className="text-white block hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  Cancellations
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout?.();
                  }}
                  className="text-white block w-full text-left hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}