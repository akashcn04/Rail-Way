export interface User {
  id: string;
  name: string;
  email: string;
  contact?: string;
  address?: string;
}

export interface Train {
  id: string;
  name: string;
  totalSeats: number;
  availableSeats: number;
}

export interface Schedule {
  id: string;
  trainId: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  scheduleId: string;
  status: 'confirmed' | 'cancelled';
  seatNumber: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'refunded';
  createdAt: string;
}