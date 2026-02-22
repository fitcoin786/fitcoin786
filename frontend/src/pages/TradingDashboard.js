import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Wallet, LogOut, Menu, X } from 'lucide-react';
import TradingChart from '../components/TradingChart';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradingDashboard = ({ user, onLogout }) => {
  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [wallet, setWallet] = useState(null);
  const [orderType, setOrderType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch price data
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`${API}/price/fitcoin`);
        setPriceData(response.data);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`${API}/price/history`);
        setChartData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  // Fetch order book
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get(`${API}/orderbook`);
        setOrderBook(response.data);
      } catch (error) {
        console.error('Failed to fetch order book:', error);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(`${API}/wallet`, axiosConfig);
        setWallet(response.data);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };

    fetchWallet();
  }, []);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!priceData) {
      toast.error('Price data not available');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/trade`, {
        order_type: orderType,
        amount: parseFloat(amount),
        price: priceData.price
      }, axiosConfig);

      toast.success(`${orderType === 'buy' ? 'Bought' : 'Sold'} ${amount} FTC successfully!`);
      setAmount('');

      // Refresh wallet
      const walletResponse = await axios.get(`${API}/wallet`, axiosConfig);
      setWallet(walletResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/trade" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-6">
              <Link to="/trade" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">Trade</Link>
              <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button
                onClick={handleLogout}
                className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-4" data-testid="trading-dashboard">
        {/* Price Header */}
        <div className="glass-card p-6 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black font-unbounded tracking-tighter uppercase">FTC/USD</h1>
                {priceData && (
                  <span className={`flex items-center gap-1 font-mono text-lg ${priceData.change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                    {priceData.change_24h >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {priceData.change_24h >= 0 ? '+' : ''}{priceData.change_24h.toFixed(2)}%
                  </span>
                )}
              </div>
              {priceData && (
                <div className="text-4xl font-black font-mono text-[#FF9F1C]">
                  ${priceData.price.toFixed(6)}
                </div>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-1">24h Volume</div>
                <div className="font-mono text-white">{priceData ? `$${priceData.volume_24h.toLocaleString()}` : '-'}</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Market Cap</div>
                <div className="font-mono text-white">{priceData ? `$${(priceData.market_cap / 1000000).toFixed(2)}M` : '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart - Large */}
          <div className="lg:col-span-8 glass-card p-6">
            <h2 className="text-xl font-bold font-unbounded mb-4 uppercase tracking-tight">Price Chart</h2>
            <TradingChart data={chartData} />
          </div>

          {/* Order Panel */}
          <div className="lg:col-span-4 glass-card p-6">
            <h2 className="text-xl font-bold font-unbounded mb-6 uppercase tracking-tight">Place Order</h2>
            
            {/* Wallet Balance */}
            {wallet && (
              <div className="bg-black/50 border border-white/10 p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">USD Balance</span>
                  <span className="font-mono font-bold text-white">${wallet.usd_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">FTC Balance</span>
                  <span className="font-mono font-bold text-[#FF9F1C]">{wallet.ftc_balance.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Buy/Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setOrderType('buy')}
                className={`py-3 font-black uppercase tracking-wider transition-all ${
                  orderType === 'buy'
                    ? 'bg-[#00F090] text-black shadow-[0_0_15px_rgba(0,240,144,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="buy-tab-btn"
              >
                Buy
              </button>
              <button
                onClick={() => setOrderType('sell')}
                className={`py-3 font-black uppercase tracking-wider transition-all ${
                  orderType === 'sell'
                    ? 'bg-[#FF2E50] text-white shadow-[0_0_15px_rgba(255,46,80,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="sell-tab-btn"
              >
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                Amount (FTC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors font-mono"
                placeholder="0.00"
                step="0.000001"
                data-testid="amount-input"
              />
            </div>

            {/* Price Display */}
            {priceData && amount && (
              <div className="bg-black/50 border border-white/10 p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">Price</span>
                  <span className="font-mono text-white">${priceData.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-white/60 font-mono uppercase">Total</span>
                  <span className="font-mono font-bold text-[#FF9F1C]">${(parseFloat(amount) * priceData.price).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleTrade}
              disabled={loading || !amount}
              className={`w-full py-4 font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                orderType === 'buy'
                  ? 'bg-[#00F090] text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,240,144,0.4)] hover:shadow-[0_0_25px_rgba(0,240,144,0.6)]'
                  : 'bg-[#FF2E50] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,46,80,0.4)] hover:shadow-[0_0_25px_rgba(255,46,80,0.6)]'
              }`}
              data-testid="execute-trade-btn"
            >
              {loading ? 'PROCESSING...' : `${orderType.toUpperCase()} FTC`}
            </button>
          </div>
        </div>

        {/* Order Book */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Bids */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold font-unbounded mb-4 uppercase tracking-tight text-[#00F090]">Buy Orders (Bids)</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-wider text-white/60 pb-2 border-b border-white/10">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.bids.slice(0, 10).map((bid, i) => (
                <div key={i} className="grid grid-cols-3 text-sm font-mono text-white/80 hover:text-white transition-colors" data-testid={`bid-${i}`}>
                  <span className="text-[#00F090]">{bid.price.toFixed(6)}</span>
                  <span className="text-right">{bid.amount.toFixed(2)}</span>
                  <span className="text-right">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold font-unbounded mb-4 uppercase tracking-tight text-[#FF2E50]">Sell Orders (Asks)</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-wider text-white/60 pb-2 border-b border-white/10">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.asks.slice(0, 10).map((ask, i) => (
                <div key={i} className="grid grid-cols-3 text-sm font-mono text-white/80 hover:text-white transition-colors" data-testid={`ask-${i}`}>
                  <span className="text-[#FF2E50]">{ask.price.toFixed(6)}</span>
                  <span className="text-right">{ask.amount.toFixed(2)}</span>
                  <span className="text-right">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;