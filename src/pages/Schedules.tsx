import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Train as TrainIcon, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User } from '../types';

interface ScheduleProps {
  user: User | null;
}

export default function Schedule({ user }: ScheduleProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/schedules?date=${selectedDate}`);
        const data = await response.json();

        if (response.ok) {
          setSchedules(data.schedules || []);
        } else {
          toast.error(data.message || 'Failed to fetch schedules');
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Failed to fetch schedules');
      }
    };

    fetchSchedules();
  }, [selectedDate , user]);

  const openPaymentModal = (trainId: string) => {
    if (!user) {
      console.log("User status:", user);
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    setSelectedTrainId(trainId);
  };

  const confirmPayment = async () => {
    if (!selectedTrainId) return;
    setLoading(true);

    try {
        const response = await fetch('http://localhost:3000/api/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user!.id,
                scheduleId: selectedTrainId,
                paymentMethod: paymentMethod,
                transactionId: `txn_${Date.now()}`,
                amount: 300,
                status: 'success',
            }),
        });

        const data = await response.json();
        console.log("Server response:", response.status, data); // Debugging log

        if (response.ok) {
            toast.success('Payment successful and ticket booked!');
            navigate('/');
        } else {
            toast.error(data.message || 'Failed to book ticket');
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        toast.error('Payment failed');
    } finally {
        setSelectedTrainId(null);
        setLoading(false);
    }
};


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Train Schedule</h1>

            <div className="mb-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Seats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.length > 0 ? (
                    schedules.map((train) => (
                      <tr key={train.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TrainIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{train.train_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-500">{train.departure_station} → {train.arrival_station}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-500">{train.departure_time.substring(11, 16)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-500">{train.arrival_time.substring(11, 16)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${train.available_seats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {train.available_seats} seats
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{train.price}/-</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openPaymentModal(train.id)}
                            disabled={loading || train.available_seats === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Booking...' : 'Book Now'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No schedules available for the selected date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedTrainId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full mb-4 border border-gray-300 rounded-md p-2"
            >
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
              <option value="credit_card">Credit Card</option>
            </select>
            <button
              onClick={confirmPayment}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700"
            >
              {loading ? 'Processing...' : 'Pay'}
            </button>
            <button
              onClick={() => setSelectedTrainId(null)}
              className="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
