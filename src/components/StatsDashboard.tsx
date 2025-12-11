import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface DashboardStats {
  totalDoctors: number;
  totalSlots: number;
  availableSlots: number;
  totalBookings: number;
}

function StatsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalSlots: 0,
    availableSlots: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [doctors, adminSlots] = await Promise.all([
        api.getDoctors(),
        api.getAdminSlots(),
      ]);

      const totalSlots = adminSlots.total;
      const availableSlots = adminSlots.slots.reduce(
        (sum, slot) => sum + slot.availableSeats,
        0
      );

      setStats({
        totalDoctors: doctors.length,
        totalSlots,
        availableSlots,
        totalBookings: 0, // Can be enhanced with bookings endpoint
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="stats-dashboard">
      <div className="stat-item">
        <div className="stat-value">{stats.totalDoctors}</div>
        <div className="stat-label">Total Doctors</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalSlots}</div>
        <div className="stat-label">Total Slots</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.availableSlots}</div>
        <div className="stat-label">Available Seats</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalBookings}</div>
        <div className="stat-label">Total Bookings</div>
      </div>
    </div>
  );
}

export default StatsDashboard;

