import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Flame, Loader2, Search, X, Sparkles, Zap, ExternalLink, LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarketOverview = ({ user, onLogout }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gainers');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(`${API}/market/overview`);
        setMarketData(response.data);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        toast.error('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${API}/crypto/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCryptoClick = async (crypto) => {
    try {
      const response = await axios.get(`${API}/crypto/details/${crypto.id}`);
      setSelectedCrypto(response.data);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to fetch crypto details:', error);
      toast.error('Failed to load cryptocurrency details');
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const renderCoinCard = (coin, index, type) => {
    if (!coin) return null;

    return (
      <motion.div
        key={coin.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => handleCryptoClick(coin)}
        className="glass-card p-4 hover:border-[#FF9F1C]/50 transition-all cursor-pointer group"
        data-testid={`${type}-coin-${index}`}
      >
        <div className="flex items-center gap-4">
          <div className="text-white/40 font-mono text-xs w-6">#{index + 1}</div>
          {coin.image && (
            <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white truncate group-hover:text-[#FF9F1C] transition-colors">{coin.name}</div>
            <div className="text-xs text-white/60 font-mono uppercase">{coin.symbol}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-white text-sm">
              ${coin.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}
            </div>
            <div className={`flex items-center justify-end gap-1 text-xs font-mono ${
              coin.change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
            }`}>
              {coin.change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs font-mono uppercase text-white/60">MCap</div>
            <div className="font-mono text-xs text-white">
              ${coin.market_cap ? (coin.market_cap / 1000000).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-[#FF9F1C] transition-colors" />
        </div>
      </motion.div>
    );
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
            <Link to="/market" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Markets</Link>
            <Link to="/search" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Search</Link>
            <a href="https://fitcoinminers.github.io/" target="_blank" rel="noopener noreferrer" className="text-[#00F090] hover:text-[#00F090]/80 transition-colors font-bold uppercase tracking-wider text-sm">⛏️ Mine FTC</a>
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

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-6">
              <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Trade</Link>
              <Link to="/market" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">Markets</Link>
              <Link to="/search" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Search</Link>
              <a href="https://fitcoinminers.github.io/" target="_blank" rel="noopener noreferrer" className="text-[#00F090] hover:text-[#00F090]/80 transition-colors font-bold uppercase">⛏️ Mine FTC</a>
              <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button onClick={handleLogout} className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-6" data-testid="market-overview-page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-10 w-10 text-[#FF9F1C]" />
            <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                MARKET OVERVIEW
              </span>
            </h1>
          </div>
          <p className="text-white/70 font-medium">Real-time cryptocurrency market data powered by AI</p>
        </motion.div>

        {/* AI-Powered Search Bar */}
        <div className="glass-card p-6 mb-6 relative">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-5 w-5 text-[#FF9F1C]" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">AI-Powered Crypto Search</span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coins, tokens, meme coins, or paste contract address..."
              className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 rounded-none h-14 pl-12 pr-12 outline-none transition-colors font-medium"
              data-testid="market-search-input"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9F1C] animate-spin" />}
            {searchQuery && !isSearching && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-6 right-6 mt-2 bg-[#0F1115] border border-white/10 max-h-96 overflow-y-auto z-50"
              >
                {searchResults.map((crypto, index) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleCryptoClick(crypto)}
                    className="w-full p-4 hover:bg-white/5 transition-colors flex items-center gap-4 border-b border-white/5 last:border-b-0"
                    data-testid={`market-search-result-${index}`}
                  >
                    {crypto.thumb && <img src={crypto.thumb} alt={crypto.name} className="h-8 w-8 rounded-full" />}
                    <div className="flex-1 text-left">
                      <div className="font-bold text-white">{crypto.name}</div>
                      <div className="text-sm text-white/60 font-mono uppercase">{crypto.symbol}</div>
                    </div>
                    {crypto.market_cap_rank && (
                      <div className="text-xs font-mono text-white/40">#{crypto.market_cap_rank}</div>
                    )}
                    <ExternalLink className="h-4 w-4 text-[#FF9F1C]" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Crypto Details */}
        {selectedCrypto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 mb-6 border-2 border-[#FF9F1C]/30"
            data-testid="selected-crypto-details"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedCrypto.image && <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-16 w-16 rounded-full" />}
                <div>
                  <h3 className="text-3xl font-black font-unbounded">{selectedCrypto.name}</h3>
                  <div className="text-lg font-mono uppercase text-white/60">{selectedCrypto.symbol}</div>
                </div>
              </div>
              <button onClick={() => setSelectedCrypto(null)} className="text-white/60 hover:text-white transition-colors">
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">Price</div>
                <div className="text-2xl font-black font-mono text-[#FF9F1C]">
                  ${selectedCrypto.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">24h Change</div>
                <div className={`text-2xl font-black font-mono ${selectedCrypto.price_change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                  {selectedCrypto.price_change_24h >= 0 ? '+' : ''}{selectedCrypto.price_change_24h?.toFixed(2)}%
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">Market Cap</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${(selectedCrypto.market_cap / 1000000000).toFixed(2)}B
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">24h Volume</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${(selectedCrypto.volume_24h / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/trade')}
              className="w-full rounded-sm px-8 py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Trade {selectedCrypto.symbol} Now →
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#FF9F1C] animate-spin" />
            <p className="text-white/60 font-mono">Loading real-time market data...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('gainers')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'gainers'
                    ? 'bg-[#00F090] text-black shadow-[0_0_15px_rgba(0,240,144,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="gainers-tab"
              >
                <TrendingUp className="h-4 w-4" />
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab('losers')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'losers'
                    ? 'bg-[#FF2E50] text-white shadow-[0_0_15px_rgba(255,46,80,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="losers-tab"
              >
                <TrendingDown className="h-4 w-4" />
                Top Losers
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'trending'
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black shadow-[0_0_15px_rgba(255,159,28,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="trending-tab"
              >
                <Flame className="h-4 w-4" />
                Trending
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  {activeTab === 'gainers' && marketData?.top_gainers?.map((coin, i) => renderCoinCard(coin, i, 'gainer'))}
                  {activeTab === 'losers' && marketData?.top_losers?.map((coin, i) => renderCoinCard(coin, i, 'loser'))}
                  {activeTab === 'trending' && marketData?.trending?.map((coin, i) => renderCoinCard(coin, i, 'trending'))}
                </div>
              </motion.div>
            </AnimatePresence>

            {marketData?.last_updated && (
              <div className="text-center mt-8 text-sm text-white/40 font-mono">
                Live data • Last updated: {new Date(marketData.last_updated).toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketOverview;
