import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, TrendingUp, TrendingDown, X, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CryptoSearch = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoDetails, setCryptoDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

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
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCrypto = async (crypto) => {
    setSelectedCrypto(crypto);
    setLoadingDetails(true);
    setSearchQuery('');
    setSearchResults([]);

    try {
      const response = await axios.get(`${API}/crypto/details/${crypto.id}`);
      setCryptoDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch crypto details:', error);
    } finally {
      setLoadingDetails(false);
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

          <div className="flex items-center gap-8">
            <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/market" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Markets</Link>
            <Link to="/search" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Search</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-wider text-white/60">Welcome</div>
            <div className="text-sm font-bold text-white">{user?.full_name}</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6" data-testid="crypto-search-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              SEARCH CRYPTO
            </span>
          </h1>
          <p className="text-white/70 font-medium">Search for any cryptocurrency by name or symbol</p>
        </motion.div>

        {/* Search Bar */}
        <div className="glass-card p-6 mb-6 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Bitcoin, Ethereum, Solana..."
              className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 rounded-none h-14 pl-12 pr-12 outline-none transition-colors font-medium text-lg"
              data-testid="crypto-search-input"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FF9F1C] animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
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
                className="absolute left-0 right-0 mt-2 bg-[#0F1115] border border-white/10 max-h-96 overflow-y-auto z-50"
              >
                {searchResults.map((crypto, index) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    className="w-full p-4 hover:bg-white/5 transition-colors flex items-center gap-4 border-b border-white/5 last:border-b-0"
                    data-testid={`search-result-${index}`}
                  >
                    {crypto.thumb && (
                      <img src={crypto.thumb} alt={crypto.name} className="h-8 w-8 rounded-full" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-bold text-white">{crypto.name}</div>
                      <div className="text-sm text-white/60 font-mono uppercase">{crypto.symbol}</div>
                    </div>
                    {crypto.market_cap_rank && (
                      <div className="text-xs font-mono text-white/40">#{crypto.market_cap_rank}</div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Crypto Details */}
        {loadingDetails && (
          <div className="glass-card p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#FF9F1C] animate-spin" />
            <p className="text-white/60 font-mono">Loading cryptocurrency details...</p>
          </div>
        )}

        {cryptoDetails && !loadingDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8"
            data-testid="crypto-details"
          >
            <div className="flex items-start gap-6 mb-8">
              {cryptoDetails.image && (
                <img src={cryptoDetails.image} alt={cryptoDetails.name} className="h-20 w-20 rounded-full" />
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-black font-unbounded mb-2">{cryptoDetails.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono uppercase text-white/60">{cryptoDetails.symbol}</span>
                  <span className="px-3 py-1 bg-[#FF9F1C]/20 text-[#FF9F1C] font-mono text-sm border border-[#FF9F1C]/30">RANK #{cryptoDetails.market_cap_rank || 'N/A'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black font-mono text-[#FF9F1C] mb-2">
                  ${cryptoDetails.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}
                </div>
                <div className={`flex items-center justify-end gap-2 text-lg font-mono ${
                  cryptoDetails.price_change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                }`}>
                  {cryptoDetails.price_change_24h >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {cryptoDetails.price_change_24h >= 0 ? '+' : ''}{cryptoDetails.price_change_24h?.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">Market Cap</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${(cryptoDetails.market_cap / 1000000000).toFixed(2)}B
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">24h Volume</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${(cryptoDetails.volume_24h / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">24h High</div>
                <div className="text-lg font-bold font-mono text-[#00F090]">
                  ${cryptoDetails.high_24h?.toFixed(2)}
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">24h Low</div>
                <div className="text-lg font-bold font-mono text-[#FF2E50]">
                  ${cryptoDetails.low_24h?.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Price Changes */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">7 Days</div>
                <div className={`text-xl font-bold font-mono ${
                  cryptoDetails.price_change_7d >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                }`}>
                  {cryptoDetails.price_change_7d >= 0 ? '+' : ''}{cryptoDetails.price_change_7d?.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">30 Days</div>
                <div className={`text-xl font-bold font-mono ${
                  cryptoDetails.price_change_30d >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                }`}>
                  {cryptoDetails.price_change_30d >= 0 ? '+' : ''}{cryptoDetails.price_change_30d?.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">All-Time High</div>
                <div className="text-xl font-bold font-mono text-white">
                  ${cryptoDetails.ath?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Description */}
            {cryptoDetails.description && (
              <div>
                <h3 className="text-xl font-bold font-unbounded mb-4 uppercase">About {cryptoDetails.name}</h3>
                <div 
                  className="text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cryptoDetails.description.substring(0, 500) + '...' }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!cryptoDetails && !loadingDetails && searchResults.length === 0 && !searchQuery && (
          <div className="glass-card p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/60 font-mono mb-2">Search for any cryptocurrency</p>
            <p className="text-white/40 text-sm">Try searching for Bitcoin, Ethereum, Solana, or any other crypto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoSearch;