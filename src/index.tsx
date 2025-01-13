import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SectionCard from './Home';
import Login from './Login';
import './styles/index.css';

// ProtectedRoute Component
const ProtectedRoute: React.FC<{ element: React.ReactNode; isAuthenticated: boolean }> = ({ element, isAuthenticated }) => {
  return isAuthenticated ? (
    <>{element}</>
  ) : (
    <Navigate to="/" replace />
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/sections" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/sections"
          element={
            <ProtectedRoute
              element={<SectionCard />}
              isAuthenticated={isLoggedIn}
            />
          }
        />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
