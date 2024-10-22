import React, { useState, useContext } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const { isLoggedIn, logout } = useContext(AuthContext); // Get login status and logout function from context

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleAccountMenu = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "PNR Status", href: "#" },
    { name: "Train Schedule", href: "#" },
    { name: "Stations", href: "#" },
    { name: "Contact Us", href: "#" },
  ];

  return (
    <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white text-2xl font-bold">Rail-Way</span>
            </Link>
          </div>

          <div className="hidden md:flex">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <div className="relative">
                <FaUserCircle
                  onClick={toggleAccountMenu}
                  className="text-white text-3xl cursor-pointer"
                />
                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                    <Link
                      to="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Payments
                    </Link>
                    <Link
                      to="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cancellations
                    </Link>
                    <Link
                      to="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Book History
                    </Link>
                    <Link
                      to="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Book Train
                    </Link>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={logout} // Call logout function from context
                    >
                      Log Out
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
