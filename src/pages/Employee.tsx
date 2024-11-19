import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Employee() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [contact, setContact] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    salary: 0,
    contact: '',
  });

  const [loading, setLoading] = useState(false);

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map the position to a salary
      const salaryMap: { [key: string]: number } = {
        'tc': 30000,
        'station master': 50000,
        'goods guard': 35000,
        'general manager': 80000,
        'junior engineer': 45000,
        'railway clerk': 25000,
      };

      const salary = salaryMap[position.toLowerCase()] || 0;

      // Set the salary in formData
      // console.log({name,position,salary,contact})

      setFormData({
        name,
        position,
        salary,
        contact,
      });


      // Send the form data to the backend
      // console.log(JSON.stringify(formData))
      const response = await fetch('http://localhost:3000/api/Employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          position,
          contact,
          salary
        }), // Send form data as JSON
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Request sent successfully!');
        navigate('/');
        setFormData({name: '', position: '', salary: 0, contact: '' }); // Clear the form
      } else {
        // Log the error response from the backend
        console.log('Error response from backend:', data);
        toast.error(data.message || 'Failed to send Request');
      }
    } catch (error) {
      // Log the error that occurred during the fetch request
      console.error('Error while Requesting:', error);
      toast.error('Failed to send Request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6">Join TrainWay as an Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="position" className="block text-gray-700">Position</label>
            <select
              id="position"
              name="position"
              value={position}
              onChange={handlePositionChange}
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Position</option>
              <option value="tc">Ticket Collector (TC)</option>
              <option value="station master">Station Master</option>
              <option value="goods guard">Goods Guard</option>
              <option value="general manager">General Manager</option>
              <option value="junior engineer">Junior Engineer</option>
              <option value="railway clerk">Railway Clerk</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="contact" className="block text-gray-700">Contact Information</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md mt-4 hover:bg-indigo-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
