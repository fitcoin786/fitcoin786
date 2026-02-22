import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, ArrowDownRight, LogOut, Menu, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradeHistory = ({ user, onLogout }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get(`${API}/trade/history`, axiosConfig);
        setTrades(response.data);
      } catch (error) {
        console.error('Failed to fetch trade history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

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
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
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
              <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button onClick={handleLogout} className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6" data-testid="history-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              TRADE HISTORY
            </span>
          </h1>
          <p className="text-white/70 font-medium">View all your trading activity</p>
        </motion.div>

        {/* Trade List */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/60 font-mono">Loading trades...</div>
          ) : trades.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-mono mb-6">No trades yet. Start trading to see your history here.</p>
              <button
                onClick={() => navigate('/trade')}
                className="rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300"
                data-testid="start-trading-btn"
              >
                Start Trading
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Type</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Amount</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Price</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Total</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Date</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      data-testid={`trade-row-${index}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {trade.order_type === 'buy' ? (
                            <>
                              <ArrowUpRight className="h-5 w-5 text-[#00F090]" />
                              <span className="font-bold uppercase text-[#00F090]">Buy</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-5 w-5 text-[#FF2E50]" />
                              <span className="font-bold uppercase text-[#FF2E50]">Sell</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">{trade.amount.toFixed(6)} FTC</td>
                      <td className="px-6 py-4 font-mono text-white">${trade.price.toFixed(6)}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[#FF9F1C]">${trade.total.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-white/70">
                        {format(new Date(trade.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/30">
                          {trade.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;