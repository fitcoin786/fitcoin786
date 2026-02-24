import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TradingDashboard from './pages/TradingDashboard';
import Portfolio from './pages/Portfolio';
import TradeHistory from './pages/TradeHistory';
import CryptoSearch from './pages/CryptoSearch';
import MarketOverview from './pages/MarketOverview';
import SendReceive from './pages/SendReceive';
import { Toaster } from './components/ui/sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
              <Navigate to="/trade" /> : 
              <AuthPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/trade" 
            element={
              isAuthenticated ? 
              <TradingDashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              isAuthenticated ? 
              <Portfolio user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/history" 
            element={
              isAuthenticated ? 
              <TradeHistory user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/search" 
            element={
              isAuthenticated ? 
              <CryptoSearch user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/market" 
            element={
              isAuthenticated ? 
              <MarketOverview user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;