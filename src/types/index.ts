export interface User {
    id: string;
    name: string;
    email: string;
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
  
  export interface Ticket {
    id: string;
    pnr: string;
    userId: string;
    trainId: string;
    scheduleId: string;
    seatNumber: string;
    status: 'confirmed' | 'cancelled';
    bookingDate: string;
  }