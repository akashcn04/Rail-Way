import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const stations = [
  {
    id: 1,
    name: 'Central Station',
    location: '123 Main Street, Downtown',
    facilities: ['Parking', 'Food Court', 'Waiting Room'],
    contact: '+1 234-567-8900',
    timing: '24/7',
  },
  {
    id: 2,
    name: 'North Junction',
    location: '456 North Ave, Uptown',
    facilities: ['Parking', 'Restrooms', 'ATM'],
    contact: '+1 234-567-8901',
    timing: '5:00 AM - 11:00 PM',
  },
  {
    id: 3,
    name: 'East Terminal',
    location: '789 East Blvd, Eastside',
    facilities: ['Parking', 'Shopping', 'Medical'],
    contact: '+1 234-567-8902',
    timing: '24/7',
  },
];

export default function Stations() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Stations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <div key={station.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{station.name}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <span className="text-gray-600">{station.location}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <span className="text-gray-600">{station.contact}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <span className="text-gray-600">{station.timing}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Available Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {station.facilities.map((facility) => (
                        <span
                          key={facility}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}