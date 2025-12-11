import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Slot } from '../api/client';
import LiveBookingQueue from '../components/LiveBookingQueue';

function Booking() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();

  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (slotId) {
      loadSlot();
    }
  }, [slotId]);

  const loadSlot = async () => {
    try {
      setLoading(true);
      const data = await api.getSlot(slotId!);
      setSlot(data);
      if (data.availableSeats === 0) {
        setError('This slot is fully booked');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load slot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) return;

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const booking = await api.createBooking({
        slotId,
        patient: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
      });
      setSuccess(true);
      setBookingId(booking._id);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading slot details...</div>;
  }

  if (!slot) {
    return <div className="error">Slot not found</div>;
  }

  if (success && bookingId) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1' }}>✓</div>
        <h2 style={{ marginBottom: '1rem' }}>Booking Confirmed!</h2>
        <div className="success" style={{ marginTop: '2rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>
            Your appointment has been successfully booked!
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            <strong>Booking ID:</strong> <code style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--accent)', fontFamily: 'monospace' }}>{bookingId}</code>
          </p>
        </div>
        <button className="btn btn-success" onClick={() => navigate('/')} style={{ marginTop: '2rem', width: '100%' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Book Appointment</h2>
        
        {slotId && <LiveBookingQueue slotId={slotId} />}
        
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Appointment Details
          </p>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            <strong>Date & Time:</strong> {formatDate(slot.startTime)} -{' '}
            {new Date(slot.endTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Seats Available:</strong>{' '}
            <span
              className={`badge ${
                slot.availableSeats > 0 ? 'badge-success' : 'badge-danger'
              }`}
            >
              {slot.availableSeats} / {slot.totalSeats}
            </span>
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        {slot.availableSeats > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Patient Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Enter patient full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="patient@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1234567890"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
              style={{ width: '100%', padding: '1rem' }}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        ) : (
          <div className="error">This slot is fully booked.</div>
        )}
      </div>
    </div>
  );
}

export default Booking;

