import React, { useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface PnrResult {
  passengerName: string;
  trainName: string;
  seatNumber: string;
  boardingStation: string;
  status: string;
}

export default function PnrStatus() {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState<PnrResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/pnr/${pnr}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success('PNR details found!');
      } else {
        toast.error('Invalid PNR number');
        setResult(null);
      }
    } catch (error) {
      toast.error('Failed to fetch PNR details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            PNR Status
          </h1>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="Enter 10-digit PNR number"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                pattern="\d{10}"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  'Checking...'
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Check Status
                  </span>
                )}
              </button>
            </div>
          </form>

          {result && (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Passenger Name</h3>
                  <p className="mt-1 text-lg font-semibold">{result.passengerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Train</h3>
                  <p className="mt-1 text-lg font-semibold">{result.trainName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Seat Number</h3>
                  <p className="mt-1 text-lg font-semibold">{result.seatNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Boarding Station</h3>
                  <p className="mt-1 text-lg font-semibold">{result.boardingStation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className={`mt-1 text-lg font-semibold ${
                    result.status === 'Confirmed' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}