import { useEffect, useState } from 'react';
import { api, Doctor, Slot } from '../api/client';
import StatsDashboard from '../components/StatsDashboard';

function Admin() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'slots'>('doctors');

  // Doctor form
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    profile: '',
  });

  // Slot form
  const [slotForm, setSlotForm] = useState({
    doctorId: '',
    startTime: '',
    endTime: '',
    totalSeats: '3',
  });

  useEffect(() => {
    loadDoctors();
    loadSlots();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDoctors();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      const data = await api.getAdminSlots();
      setSlots(data.slots);
    } catch (err) {
      setError('Failed to load slots');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await api.createDoctor(doctorForm);
      setSuccess('Doctor created successfully!');
      setDoctorForm({ name: '', specialty: '', profile: '' });
      loadDoctors();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create doctor');
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Convert local datetime to ISO string
      const startTime = new Date(slotForm.startTime).toISOString();
      const endTime = new Date(slotForm.endTime).toISOString();

      await api.createSlot({
        doctorId: slotForm.doctorId,
        startTime,
        endTime,
        totalSeats: parseInt(slotForm.totalSeats, 10),
      });
      setSuccess('Slot created successfully!');
      setSlotForm({
        doctorId: '',
        startTime: '',
        endTime: '',
        totalSeats: '3',
      });
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create slot');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div>
      <StatsDashboard />

      <div className="section-header">
        <h2>Admin Panel</h2>
        <p className="section-subtitle">Manage doctors and appointment slots</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          Slots
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {activeTab === 'doctors' && (
        <div>
          <div className="card">
            <h3>Create New Doctor</h3>
            <form onSubmit={handleCreateDoctor}>
              <div className="form-group">
                <label htmlFor="doctor-name">Doctor Name *</label>
                <input
                  type="text"
                  id="doctor-name"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  required
                  placeholder="Dr. John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-specialty">Specialty *</label>
                <input
                  type="text"
                  id="doctor-specialty"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  required
                  placeholder="Cardiology, Pediatrics, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-profile">Profile & Experience</label>
                <textarea
                  id="doctor-profile"
                  value={doctorForm.profile}
                  onChange={(e) => setDoctorForm({ ...doctorForm, profile: e.target.value })}
                  rows={4}
                  placeholder="Brief description of doctor's qualifications and experience..."
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                Create Doctor
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>All Doctors ({doctors.length})</h3>
            {loading ? (
              <div className="loading">Loading</div>
            ) : doctors.length === 0 ? (
              <div className="empty-state">
                <p>No doctors created yet. Create your first doctor above!</p>
              </div>
            ) : (
              <div className="grid">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="card doctor-card">
                    <h4>{doctor.name}</h4>
                    <span className="specialty-badge">{doctor.specialty}</span>
                    {doctor.profile && (
                      <p
                        style={{
                          marginTop: '1rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.6',
                        }}
                      >
                        {doctor.profile}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'slots' && (
        <div>
          <div className="card">
            <h3>Create New Slot</h3>
            <form onSubmit={handleCreateSlot}>
              <div className="form-group">
                <label htmlFor="slot-doctor">Doctor *</label>
                <select
                  id="slot-doctor"
                  value={slotForm.doctorId}
                  onChange={(e) => setSlotForm({ ...slotForm, doctorId: e.target.value })}
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="slot-start">Start Time *</label>
                <input
                  type="datetime-local"
                  id="slot-start"
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  required
                  min={getCurrentDateTime()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="slot-end">End Time *</label>
                <input
                  type="datetime-local"
                  id="slot-end"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  required
                  min={slotForm.startTime || getCurrentDateTime()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="slot-seats">Total Seats *</label>
                <input
                  type="number"
                  id="slot-seats"
                  value={slotForm.totalSeats}
                  onChange={(e) => setSlotForm({ ...slotForm, totalSeats: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                Create Slot
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>All Slots ({slots.length})</h3>
            {slots.length === 0 ? (
              <div className="empty-state">
                <p>No slots created yet. Create your first slot above!</p>
              </div>
            ) : (
              <div className="grid">
                {slots.map((slot) => {
                  const doctor = doctors.find((d) => d._id === slot.doctorId);
                  return (
                    <div
                      key={slot._id}
                      className={`card slot-card ${slot.availableSeats > 0 ? 'available' : 'full'}`}
                    >
                      <h4>{doctor?.name || 'Unknown Doctor'}</h4>
                      <span className="specialty-badge">{doctor?.specialty || 'N/A'}</span>
                      <div style={{ marginTop: '1rem', lineHeight: '1.8', fontSize: '0.875rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Start:</strong>{' '}
                          {formatDate(slot.startTime)}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>End:</strong>{' '}
                          {formatDate(slot.endTime)}
                        </p>
                        <p style={{ marginTop: '0.75rem' }}>
                          <strong>Seats:</strong>{' '}
                          <span
                            className={`badge ${
                              slot.availableSeats > 0 ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {slot.availableSeats} / {slot.totalSeats}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
