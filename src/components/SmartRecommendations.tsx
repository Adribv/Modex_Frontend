import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Slot, Doctor } from '../api/client';

interface Recommendation {
  slot: Slot;
  doctor: Doctor;
  score: number;
  reason: string;
}

function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const [doctors, allSlots] = await Promise.all([
        api.getDoctors(),
        Promise.all(doctors.map(d => api.getDoctorSlots(d._id).catch(() => []))).then(
          arrays => arrays.flat()
        ),
      ]);

      // Smart recommendation algorithm
      const now = new Date();
      const recommendations: Recommendation[] = [];

      allSlots.forEach(slot => {
        const slotDate = new Date(slot.startTime);
        const doctor = doctors.find(d => d._id === slot.doctorId);
        
        if (!doctor || slot.availableSeats === 0) return;

        let score = 0;
        const reasons: string[] = [];

        // Factor 1: Availability (more seats = better)
        const availabilityScore = (slot.availableSeats / slot.totalSeats) * 30;
        score += availabilityScore;
        if (slot.availableSeats === slot.totalSeats) {
          reasons.push('Fully available');
        }

        // Factor 2: Time proximity (sooner = better, but not too soon)
        const hoursUntil = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntil >= 24 && hoursUntil <= 72) {
          score += 25;
          reasons.push('Optimal timing');
        } else if (hoursUntil >= 2 && hoursUntil < 24) {
          score += 15;
          reasons.push('Available soon');
        }

        // Factor 3: Day of week (weekdays preferred)
        const dayOfWeek = slotDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          score += 20;
          reasons.push('Weekday slot');
        }

        // Factor 4: Time of day (morning/afternoon preferred)
        const hour = slotDate.getHours();
        if (hour >= 9 && hour <= 17) {
          score += 15;
          reasons.push('Business hours');
        }

        // Factor 5: Doctor specialty diversity (if multiple specialties)
        const specialtyCount = new Set(doctors.map(d => d.specialty)).size;
        if (specialtyCount > 1) {
          score += 10;
        }

        if (score > 0) {
          recommendations.push({
            slot,
            doctor,
            score,
            reason: reasons.join(' • '),
          });
        }
      });

      // Sort by score and take top 3
      recommendations.sort((a, b) => b.score - a.score);
      setRecommendations(recommendations.slice(0, 3));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Finding best slots...</div>;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <span className="recommendations-icon">✨</span>
        <h3>Smart Recommendations</h3>
        <span className="recommendations-subtitle">Best slots for you</span>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div
            key={rec.slot._id}
            className="recommendation-card"
            onClick={() => navigate(`/booking/${rec.slot._id}`)}
          >
            <div className="recommendation-badge">
              #{index + 1} Choice
            </div>
            <div className="recommendation-score">
              <span className="score-value">{Math.round(rec.score)}</span>
              <span className="score-label">Match Score</span>
            </div>
            <div className="recommendation-content">
              <div className="recommendation-doctor">{rec.doctor.name}</div>
              <div className="recommendation-specialty">{rec.doctor.specialty}</div>
              <div className="recommendation-time">
                {new Date(rec.slot.startTime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="recommendation-reason">{rec.reason}</div>
              <div className="recommendation-seats">
                <span className={`seat-badge ${rec.slot.availableSeats > 0 ? 'available' : 'full'}`}>
                  {rec.slot.availableSeats} seats available
                </span>
              </div>
            </div>
            <button className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }}>
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartRecommendations;

