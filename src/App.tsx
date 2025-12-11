import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import CalendarView from './pages/CalendarView';

function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  return (
    <div>
      {!isLanding && (
        <header className="header">
          <div className="header-content">
            <div>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>TeleMed</h1>
              </Link>
              <p className="header-subtitle">Book your appointment with ease</p>
            </div>
            <nav className="nav">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
              <Link to="/doctors" className={location.pathname === '/doctors' ? 'active' : ''}>
                Doctors
              </Link>
              <Link to="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>
                Calendar
              </Link>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                Admin
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main className={isLanding ? '' : 'container'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/doctors" element={<Home />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/booking/:slotId" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

