import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Doctor, Slot } from '../api/client';
import StatsDashboard from '../components/StatsDashboard';
import SmartRecommendations from '../components/SmartRecommendations';

function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (doctorId: string) => {
    try {
      setLoading(true);
      const data = await api.getDoctorSlots(doctorId);
      setSlots(data);
      const doctor = doctors.find((d) => d._id === doctorId);
      setSelectedDoctor(doctor || null);
    } catch (err) {
      setError('Failed to load slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    loadSlots(doctorId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && doctors.length === 0) {
    return <div className="loading">Loading doctors...</div>;
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || doctor.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

  return (
    <div>
      <StatsDashboard />
      
      <SmartRecommendations />
      
      <div className="section-header">
        <h2>Available Doctors</h2>
        <p className="section-subtitle">Select a doctor to view available appointment slots</p>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="filter-select"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {filteredDoctors.length === 0 && !loading && (
        <div className="empty-state">
          <p>No doctors found matching your criteria.</p>
        </div>
      )}

      <div className="grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor._id} className="card doctor-card">
            <h3>{doctor.name}</h3>
            <span className="specialty-badge">{doctor.specialty}</span>
            {doctor.profile && (
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.875rem' }}>
                {doctor.profile}
              </p>
            )}
            <button
              className="btn"
              onClick={() => handleDoctorSelect(doctor._id)}
              style={{ marginTop: '1.25rem', width: '100%' }}
            >
              View Slots
            </button>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="card" style={{ marginTop: '2rem', animation: 'slideIn 0.5s ease' }}>
          <div className="section-header">
            <h2>Available Slots</h2>
            <p className="section-subtitle">Dr. {selectedDoctor.name} - {selectedDoctor.specialty}</p>
          </div>
          {loading ? (
            <div className="loading">Loading slots</div>
          ) : slots.length === 0 ? (
            <div className="empty-state">
              <p>No available slots for this doctor at the moment.</p>
            </div>
          ) : (
            <div className="grid">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className={`card slot-card ${
                    slot.availableSeats > 0 ? 'available' : 'full'
                  }`}
                >
                  <h3>Appointment Slot</h3>
                  <div style={{ marginTop: '1rem', lineHeight: '1.8', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Start:</strong> {formatDate(slot.startTime)}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>End:</strong> {formatDate(slot.endTime)}
                    </p>
                    <p style={{ marginTop: '0.75rem' }}>
                      <strong>Seats:</strong>{' '}
                      <span
                        className={`badge ${
                          slot.availableSeats > 0
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}
                      >
                        {slot.availableSeats} / {slot.totalSeats}
                      </span>
                    </p>
                  </div>
                  {slot.availableSeats > 0 ? (
                    <button
                      className="btn btn-success"
                      onClick={() => navigate(`/booking/${slot._id}`)}
                      style={{ marginTop: '1.25rem', width: '100%' }}
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      className="btn"
                      disabled
                      style={{ marginTop: '1.25rem', width: '100%' }}
                    >
                      Fully Booked
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;

