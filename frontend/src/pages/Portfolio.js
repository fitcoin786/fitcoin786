import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, TrendingUp, DollarSign, LogOut, Menu, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Portfolio = ({ user, onLogout }) => {
  const [wallet, setWallet] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, priceRes] = await Promise.all([
          axios.get(`${API}/wallet`, axiosConfig),
          axios.get(`${API}/price/fitcoin`)
        ]);
        setWallet(walletRes.data);
        setPriceData(priceRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const totalValue = wallet && priceData 
    ? wallet.usd_balance + (wallet.ftc_balance * priceData.price)
    : 0;

  const ftcValue = wallet && priceData
    ? wallet.ftc_balance * priceData.price
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="glass-nav border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FITCOIN</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/portfolio" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-white/60">Welcome</div>
              <div className="text-sm font-bold text-white">{user?.full_name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-sm px-4 py-2 border border-[#FF2E50]/50 text-[#FF2E50] hover:bg-[#FF2E50]/10 font-bold uppercase tracking-wider text-sm transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-6">
              <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Trade</Link>
              <Link to="/portfolio" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button onClick={handleLogout} className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6" data-testid="portfolio-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              YOUR PORTFOLIO
            </span>
          </h1>
          <p className="text-white/70 font-medium">Track your assets and performance</p>
        </motion.div>

        {/* Total Value Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 mb-6 relative overflow-hidden"
        >
          <div className="spiritual-aura absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8 text-[#FF9F1C]" />
              <span className="text-lg font-mono uppercase tracking-wider text-white/60">Total Portfolio Value</span>
            </div>
            <div className="text-5xl md:text-6xl font-black font-mono text-white mb-2">
              ${totalValue.toFixed(2)}
            </div>
            {priceData && (
              <div className={`flex items-center gap-2 text-lg font-mono ${
                priceData.change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
              }`}>
                <TrendingUp className="h-5 w-5" />
                {priceData.change_24h >= 0 ? '+' : ''}{priceData.change_24h.toFixed(2)}% (24h)
              </div>
            )}
          </div>
        </motion.div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USD Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border-l-4 border-[#00F090]"
            data-testid="usd-balance-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-[#00F090]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-white/60">USD Balance</div>
                  <div className="text-2xl font-black font-mono text-white">
                    ${wallet?.usd_balance.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00F090] to-[#00F090]/60"
                style={{ width: `${totalValue > 0 ? (wallet?.usd_balance / totalValue) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs font-mono text-white/50 mt-2">
              {totalValue > 0 ? ((wallet?.usd_balance / totalValue) * 100).toFixed(1) : 0}% of portfolio
            </div>
          </motion.div>

          {/* FTC Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-l-4 border-[#FF9F1C]"
            data-testid="ftc-balance-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
                  alt="FTC" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-white/60">FTC Balance</div>
                  <div className="text-2xl font-black font-mono text-[#FF9F1C]">
                    {wallet?.ftc_balance.toFixed(6) || '0.000000'}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm font-mono text-white/70 mb-2">
              ≈ ${ftcValue.toFixed(2)} USD
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD700]"
                style={{ width: `${totalValue > 0 ? (ftcValue / totalValue) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs font-mono text-white/50 mt-2">
              {totalValue > 0 ? ((ftcValue / totalValue) * 100).toFixed(1) : 0}% of portfolio
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/trade')}
            className="rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.4)] hover:shadow-[0_0_25px_rgba(255,159,28,0.6)]"
            data-testid="trade-now-btn"
          >
            Trade Now
          </button>
          <button
            onClick={() => navigate('/history')}
            className="rounded-sm px-8 py-3 border border-[#FF9F1C]/50 text-[#FF9F1C] hover:bg-[#FF9F1C]/10 font-bold uppercase tracking-widest transition-colors"
            data-testid="view-history-btn"
          >
            View History
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;