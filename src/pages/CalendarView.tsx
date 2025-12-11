import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Doctor, Slot } from '../api/client';

interface CalendarSlot extends Slot {
  doctor?: Doctor;
  hour: number;
  day: number;
}

function CalendarView() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allSlots, setAllSlots] = useState<CalendarSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // Refresh slots every 10 seconds for real-time updates
    const interval = setInterval(loadSlots, 10000);
    return () => clearInterval(interval);
  }, [selectedDate, selectedDoctor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const doctorsData = await api.getDoctors();
      setDoctors(doctorsData);
      await loadSlots();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      let slots: Slot[] = [];
      
      if (selectedDoctor === 'all') {
        // Load slots for all doctors
        const allSlotsPromises = doctors.map(doctor => 
          api.getDoctorSlots(doctor._id).catch(() => [])
        );
        const allSlotsArrays = await Promise.all(allSlotsPromises);
        slots = allSlotsArrays.flat();
      } else {
        slots = await api.getDoctorSlots(selectedDoctor);
      }

      // Filter slots for selected week/month
      const startOfPeriod = new Date(selectedDate);
      if (viewMode === 'week') {
        startOfPeriod.setDate(startOfPeriod.getDate() - startOfPeriod.getDay());
      } else {
        startOfPeriod.setDate(1);
      }

      const endOfPeriod = new Date(startOfPeriod);
      if (viewMode === 'week') {
        endOfPeriod.setDate(endOfPeriod.getDate() + 7);
      } else {
        endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
      }

      const filteredSlots = slots
        .filter(slot => {
          const slotDate = new Date(slot.startTime);
          return slotDate >= startOfPeriod && slotDate < endOfPeriod;
        })
        .map(slot => {
          const slotDate = new Date(slot.startTime);
          const doctor = doctors.find(d => d._id === slot.doctorId);
          return {
            ...slot,
            doctor,
            hour: slotDate.getHours(),
            day: viewMode === 'week' ? slotDate.getDay() : slotDate.getDate(),
          };
        });

      setAllSlots(filteredSlots);
    } catch (error) {
      console.error('Failed to load slots:', error);
    }
  };

  const getDaysArray = () => {
    const days = [];
    const start = new Date(selectedDate);
    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    } else {
      start.setDate(1);
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(start);
        day.setDate(i);
        days.push(day);
      }
    }
    return days;
  };

  const getSlotsForDay = (day: Date) => {
    const dayNum = viewMode === 'week' ? day.getDay() : day.getDate();
    return allSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      if (viewMode === 'week') {
        return slot.day === dayNum && 
               slotDate.toDateString() === day.toDateString();
      } else {
        return slot.day === dayNum;
      }
    });
  };

  const getHourSlots = (hour: number, day: Date) => {
    return getSlotsForDay(day).filter(slot => slot.hour === hour);
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button className="btn btn-secondary" onClick={() => navigateDate('prev')}>
            ← Previous
          </button>
          <h2 className="calendar-title">
            {viewMode === 'week' 
              ? `Week of ${formatDate(getDaysArray()[0])}`
              : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
          </h2>
          <button className="btn btn-secondary" onClick={() => navigateDate('next')}>
            Next →
          </button>
        </div>
        
        <div className="calendar-filters">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
          
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-grid-container">
        <div className="calendar-grid">
          {/* Time column */}
          <div className="time-column">
            <div className="time-header">Time</div>
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {getDaysArray().map((day, dayIndex) => (
            <div key={dayIndex} className="day-column">
              <div className="day-header">
                <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="day-date">{day.getDate()}</div>
                <div className="day-slots-count">
                  {getSlotsForDay(day).length} slots
                </div>
              </div>
              
              {hours.map(hour => {
                const hourSlots = getHourSlots(hour, day);
                return (
                  <div key={hour} className="hour-cell">
                    {hourSlots.map(slot => (
                      <div
                        key={slot._id}
                        className={`calendar-slot ${slot.availableSeats > 0 ? 'available' : 'full'}`}
                        onClick={() => slot.availableSeats > 0 && navigate(`/booking/${slot._id}`)}
                        title={`${slot.doctor?.name || 'Unknown'} - ${new Date(slot.startTime).toLocaleTimeString()}`}
                      >
                        <div className="slot-time">
                          {new Date(slot.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="slot-doctor">
                          {slot.doctor?.name || 'Unknown'}
                        </div>
                        <div className="slot-seats">
                          <span className={`seat-indicator ${slot.availableSeats > 0 ? 'available' : 'full'}`}>
                            {slot.availableSeats} / {slot.totalSeats}
                          </span>
                        </div>
                        {slot.availableSeats > 0 && (
                          <div className="slot-badge">Book</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color full"></div>
          <span>Fully Booked</span>
        </div>
        <div className="legend-item">
          <span className="live-indicator"></span>
          <span>Live Updates</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;

