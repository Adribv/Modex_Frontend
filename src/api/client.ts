import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  profile?: string;
  createdAt: string;
}

export interface Slot {
  _id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  availableSeats: number;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface Booking {
  _id: string;
  slotId: string;
  doctorId: string;
  patient: {
    name: string;
    email?: string;
    phone?: string;
    patientId?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export const api = {
  // Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors');
    return response.data;
  },

  // Slots
  getDoctorSlots: async (doctorId: string): Promise<Slot[]> => {
    const response = await apiClient.get(`/doctors/${doctorId}/slots`);
    return response.data;
  },

  getSlot: async (slotId: string): Promise<Slot> => {
    const response = await apiClient.get(`/slots/${slotId}`);
    return response.data;
  },

  // Bookings
  createBooking: async (data: {
    slotId: string;
    patient: { name: string; email?: string; phone?: string };
  }): Promise<Booking> => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  getBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Admin - Doctors
  createDoctor: async (data: {
    name: string;
    specialty: string;
    profile?: string;
  }): Promise<Doctor> => {
    const response = await apiClient.post('/admin/doctors', data);
    return response.data;
  },

  getAdminDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/admin/doctors');
    return response.data;
  },

  // Admin - Slots
  createSlot: async (data: {
    doctorId: string;
    startTime: string;
    endTime: string;
    totalSeats: number;
  }): Promise<Slot> => {
    const response = await apiClient.post('/admin/slots', data);
    return response.data;
  },

  getAdminSlots: async (params?: {
    doctorId?: string;
    limit?: number;
    page?: number;
  }): Promise<{ slots: Slot[]; total: number }> => {
    const response = await apiClient.get('/admin/slots', { params });
    return response.data;
  },
};

export default apiClient;

