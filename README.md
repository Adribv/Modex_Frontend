# TeleMed Scheduler Frontend

React + TypeScript frontend for the TeleMed Scheduler application.

## Features

- **Home Page** (`/`): List all doctors and view available appointment slots
- **Booking Page** (`/booking/:slotId`): Book an appointment for a specific slot
- **Admin Page** (`/admin`): Create doctors and manage appointment slots

## Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

For production, set this to your deployed API URL.

### Development

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/          # API client and types
│   ├── pages/        # Page components
│   ├── App.tsx       # Main app component with routing
│   ├── main.tsx      # Entry point
│   └── index.css     # Global styles
├── index.html
└── vite.config.ts    # Vite configuration
```

## Pages

### Home (`/`)
- Displays all available doctors
- Click "View Available Slots" to see slots for a doctor
- Click "Book Now" to book an appointment

### Booking (`/booking/:slotId`)
- Form to enter patient information
- Shows slot details
- Confirms booking on success

### Admin (`/admin`)
- **Doctors Tab**: Create new doctors and view all doctors
- **Slots Tab**: Create new appointment slots and view all slots

## API Integration

The frontend uses the API client in `src/api/client.ts` which connects to the backend API. Make sure the backend is running and accessible at the URL specified in `VITE_API_URL`.

## Deployment

### Deploy to Render/Vercel/Netlify

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Set environment variable:
   ```
   VITE_API_URL=https://your-api-url.onrender.com
   ```

### Deploy with Backend

You can also serve the frontend from the backend Express server by:
1. Building the frontend
2. Serving the `dist` folder as static files from Express
3. Adding a catch-all route to serve `index.html` for client-side routing

