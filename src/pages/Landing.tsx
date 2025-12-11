import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Doctor } from '../api/client';

function Landing() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState({ totalDoctors: 0, totalSlots: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [doctorsData] = await Promise.all([
        api.getDoctors(),
      ]);
      setDoctors(doctorsData);
      setStats({
        totalDoctors: doctorsData.length,
        totalSlots: 0, // Can be enhanced
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">Book Your</span>
              <span className="title-line highlight">TeleMed Appointment</span>
              <span className="title-line">In Seconds</span>
            </h1>
            <p className="hero-subtitle">
              Connect with expert healthcare professionals from the comfort of your home.
              Fast, secure, and convenient telemedicine appointments.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/calendar')}>
                View Calendar
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => navigate('/doctors')}>
                Browse Doctors
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">👨‍⚕️</div>
              <div className="card-text">Expert Doctors</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">📅</div>
              <div className="card-text">Easy Booking</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">⚡</div>
              <div className="card-text">Instant Confirmation</div>
            </div>
            <div className="hero-circle"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-number">{stats.totalDoctors}+</div>
            <div className="stat-label">Expert Doctors</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-number">100+</div>
            <div className="stat-label">Available Slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">&lt;2min</div>
            <div className="stat-label">Average Booking Time</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose TeleMed?</h2>
          <p className="section-subtitle">Experience healthcare reimagined</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your medical data is encrypted and protected with industry-standard security measures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Book appointments in seconds with our optimized booking system and real-time availability.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Concurrency Safe</h3>
            <p>Advanced transaction system ensures no double-booking, even under high traffic.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Access your appointments from any device - desktop, tablet, or mobile.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Auto Expiry</h3>
            <p>Pending bookings automatically expire, releasing seats for other patients.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>EHR Integration</h3>
            <p>Built-in Electronic Health Records for seamless patient history management.</p>
          </div>
        </div>
      </section>

      {/* Popular Doctors Section */}
      {!loading && doctors.length > 0 && (
        <section className="doctors-preview-section">
          <div className="section-header">
            <h2>Our Expert Doctors</h2>
            <p className="section-subtitle">Meet our team of healthcare professionals</p>
          </div>
          <div className="doctors-preview-grid">
            {doctors.slice(0, 3).map((doctor) => (
              <div key={doctor._id} className="doctor-preview-card">
                <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                <h3>{doctor.name}</h3>
                <span className="specialty-badge">{doctor.specialty}</span>
                {doctor.profile && (
                  <p className="doctor-preview-profile">{doctor.profile.substring(0, 100)}...</p>
                )}
                <button
                  className="btn btn-outline"
                  onClick={() => navigate('/doctors')}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/doctors')}>
              View All Doctors
            </button>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients who trust TeleMed for their healthcare needs</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/doctors')}>
            Book Your Appointment Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;

