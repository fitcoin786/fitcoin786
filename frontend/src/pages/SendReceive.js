import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Download, ArrowLeftRight, Copy, ExternalLink, LogOut, Menu, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const FTC_CONTRACT = "5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump";

const SendReceive = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Send form
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  
  // Exchange form
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeType, setExchangeType] = useState('ftc-to-usd');
  
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Generate unique wallet address for user
  const userWalletAddress = `FTC${user?.id?.substring(0, 8)}...${user?.id?.substring(user?.id?.length - 8)}`;

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API}/wallet`, axiosConfig);
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error('Failed to load wallet');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/trade/history`, axiosConfig);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleSend = async () => {
    if (!sendAddress || !sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('Please enter valid address and amount');
      return;
    }

    if (!wallet || wallet.ftc_balance < parseFloat(sendAmount)) {
      toast.error('Insufficient FTC balance');
      return;
    }

    setLoading(true);
    try {
      // Create send transaction
      await axios.post(`${API}/transaction/send`, {
        to_address: sendAddress,
        amount: parseFloat(sendAmount),
        currency: 'FTC'
      }, axiosConfig);

      toast.success(`Successfully sent ${sendAmount} FTC!`);
      setSendAddress('');
      setSendAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async () => {
    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/transaction/exchange`, {
        exchange_type: exchangeType,
        amount: parseFloat(exchangeAmount)
      }, axiosConfig);

      toast.success('Exchange completed successfully!');
      setExchangeAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userWalletAddress);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
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
              alt="Future Trade" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FUTURE TRADE</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/market" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Markets</Link>
            <Link to="/send-receive" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Send/Receive</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-white/60">Welcome</div>
              <div className="text-sm font-bold text-white">{user?.full_name}</div>
            </div>
            <button onClick={handleLogout} className="hidden md:block rounded-sm px-4 py-2 border border-[#FF2E50]/50 text-[#FF2E50] hover:bg-[#FF2E50]/10 font-bold uppercase tracking-wider text-sm transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6" data-testid="send-receive-page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              SEND & RECEIVE FTC
            </span>
          </h1>
          <p className="text-white/70 font-medium">Blockchain-based transactions on Solana</p>
        </motion.div>

        {/* Wallet Balance */}
        {wallet && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold font-unbounded mb-4 uppercase">Your Wallet</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">FTC Balance</div>
                <div className="text-2xl font-black font-mono text-[#FF9F1C]">{wallet.ftc_balance.toFixed(6)}</div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">USD Balance</div>
                <div className="text-2xl font-black font-mono text-[#00F090]">${wallet.usd_balance.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 font-black uppercase tracking-wider transition-all ${
              activeTab === 'send'
                ? 'bg-[#FF9F1C] text-black shadow-[0_0_15px_rgba(255,159,28,0.4)]'
                : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            <Send className="inline h-4 w-4 mr-2" />
            Send
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-3 font-black uppercase tracking-wider transition-all ${
              activeTab === 'receive'
                ? 'bg-[#00F090] text-black shadow-[0_0_15px_rgba(0,240,144,0.4)]'
                : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            <Download className="inline h-4 w-4 mr-2" />
            Receive
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-3 font-black uppercase tracking-wider transition-all ${
              activeTab === 'exchange'
                ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black shadow-[0_0_15px_rgba(255,159,28,0.4)]'
                : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            <ArrowLeftRight className="inline h-4 w-4 mr-2" />
            Exchange
          </button>
        </div>

        {/* Send Tab */}
        {activeTab === 'send' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <h3 className="text-2xl font-bold font-unbounded mb-6 uppercase">Send FTC</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  placeholder="Enter FTC wallet address"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">Amount (FTC)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors font-mono"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="inline h-5 w-5 animate-spin" /> : 'Send FTC'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Receive Tab */}
        {activeTab === 'receive' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <h3 className="text-2xl font-bold font-unbounded mb-6 uppercase">Receive FTC</h3>
            <div className="text-center">
              <p className="text-white/70 mb-4">Share this address to receive FTC</p>
              <div className="bg-black/50 border border-white/10 p-6 mb-4">
                <div className="text-2xl font-mono text-[#FF9F1C] break-all">{userWalletAddress}</div>
              </div>
              <button
                onClick={copyAddress}
                className="px-8 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-black uppercase tracking-widest hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
              <div className="mt-6">
                <a
                  href={`https://solscan.io/account/${FTC_CONTRACT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#FF9F1C] hover:text-[#FFD700] transition-colors inline-flex items-center gap-2"
                >
                  View on Solscan <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exchange Tab */}
        {activeTab === 'exchange' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <h3 className="text-2xl font-bold font-unbounded mb-6 uppercase">Exchange</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">Exchange Type</label>
                <select
                  value={exchangeType}
                  onChange={(e) => setExchangeType(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white rounded-none h-12 px-4 outline-none transition-colors font-mono"
                >
                  <option value="ftc-to-usd">FTC → USD</option>
                  <option value="usd-to-ftc">USD → FTC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">Amount</label>
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors font-mono"
                />
              </div>
              <button
                onClick={handleExchange}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="inline h-5 w-5 animate-spin" /> : 'Exchange Now'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Transaction History */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-xl font-bold font-unbounded mb-4 uppercase">Blockchain Transaction Log</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/60">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx, i) => (
                <div key={tx.id} className="bg-black/50 border border-white/10 p-4 hover:border-[#FF9F1C]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {tx.order_type === 'buy' ? '↓' : '↑'} {tx.order_type.toUpperCase()} 
                        <span className="text-[#FF9F1C]">{tx.amount} FTC</span>
                      </div>
                      <div className="text-xs text-white/60 font-mono mt-1">
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </div>
                    <a
                      href={`https://solscan.io/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00F090] hover:text-[#00F090]/80 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendReceive;
