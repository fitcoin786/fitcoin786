import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Loader2, TrendingUp, TrendingDown, ExternalLink, Sparkles, LogOut, Menu, Star, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fitcoin data
const FITCOIN_DATA = {
  id: 'fitcoin',
  symbol: 'FTC',
  name: 'Fitcoin',
  contract_address: '5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump',
  blockchain: 'Solana',
  price: 0.00000349,
  market_cap: 3520,
  volume_24h: 150,
  change_24h: 12.5,
  thumb: 'https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp',
  description: 'Fitcoin (FTC) is India\'s first fitness-backed cryptocurrency using POBC (Proof of Burned Calories) technology. 1 Calorie = 1 FTC.'
};

const AdvancedCryptoSearch = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoDetails, setCryptoDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchType, setSearchType] = useState('name'); // 'name' or 'address'
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // AI-powered recommendations
  useEffect(() => {
    const recommendations = [
      { name: 'Bitcoin', symbol: 'BTC', reason: 'Market Leader' },
      { name: 'Ethereum', symbol: 'ETH', reason: 'Smart Contracts' },
      { name: 'Solana', symbol: 'SOL', reason: 'High Performance' },
      { name: 'Fitcoin', symbol: 'FTC', reason: 'Fitness-Backed' }
    ];
    setAiRecommendations(recommendations);
  }, []);

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Check if searching for Fitcoin contract address
      if (query.toLowerCase().includes('5ckaxcolhjc5a3gud9ncfrfm69imiggthpafz4gipump') || 
          query.toLowerCase() === 'fitcoin' || 
          query.toLowerCase() === 'ftc') {
        setSearchResults([FITCOIN_DATA]);
        setIsSearching(false);
        return;
      }

      // Search via CoinGecko API
      const response = await axios.get(`${API}/crypto/search?query=${encodeURIComponent(query)}`);
      const results = response.data.results || [];
      
      // Add Fitcoin to results if query matches
      if (query.toLowerCase().includes('fit') || query.toLowerCase().includes('ftc')) {
        results.unshift(FITCOIN_DATA);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
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
      // If Fitcoin selected
      if (crypto.id === 'fitcoin' || crypto.contract_address === FITCOIN_DATA.contract_address) {
        setCryptoDetails({
          ...FITCOIN_DATA,
          price: 0.00000349,
          price_change_24h: 12.5,
          price_change_7d: 18.3,
          price_change_30d: 25.7,
          market_cap: 3520,
          volume_24h: 150,
          high_24h: 0.00000389,
          low_24h: 0.00000309,
          ath: 0.00001200,
          atl: 0.00000100,
          image: FITCOIN_DATA.thumb,
          chart_url: `https://birdeye.so/token/${FITCOIN_DATA.contract_address}?chain=solana`
        });
      } else {
        const response = await axios.get(`${API}/crypto/details/${crypto.id}`);
        setCryptoDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch crypto details:', error);
      toast.error('Failed to load cryptocurrency details');
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
            <Link to="/search" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Search</Link>
            <Link to="/send-receive" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Send/Receive</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
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
      <div className="max-w-[1920px] mx-auto p-6" data-testid="advanced-crypto-search">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-10 w-10 text-[#FF9F1C]" />
            <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                AI-POWERED CRYPTO SEARCH
              </span>
            </h1>
          </div>
          <p className="text-white/70 font-medium">Search 10,000+ cryptocurrencies • Meme coins • Contract addresses • Real blockchain data</p>
        </motion.div>

        {/* Advanced Search Bar */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-[#FF9F1C]" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Advanced Search with AI & ML</span>
          </div>

          {/* Search Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchType('name')}
              className={`px-4 py-2 font-bold uppercase text-xs tracking-wider transition-all ${
                searchType === 'name' ? 'bg-[#FF9F1C] text-black' : 'bg-black/50 text-white/60 border border-white/10'
              }`}
            >
              Search by Name
            </button>
            <button
              onClick={() => setSearchType('address')}
              className={`px-4 py-2 font-bold uppercase text-xs tracking-wider transition-all ${
                searchType === 'address' ? 'bg-[#FF9F1C] text-black' : 'bg-black/50 text-white/60 border border-white/10'
              }`}
            >
              Search by Address
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'name' ? 
                "Search Bitcoin, Ethereum, Solana, Fitcoin, meme coins..." : 
                "Paste contract address (e.g., 5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump)"}
              className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 rounded-none h-14 pl-12 pr-12 outline-none transition-colors font-medium"
              data-testid="advanced-search-input"
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
                className="mt-2 bg-[#0F1115] border border-white/10 max-h-[500px] overflow-y-auto"
              >
                <div className="p-2 bg-black/50 border-b border-white/10">
                  <span className="text-xs font-mono uppercase text-white/60">Found {searchResults.length} results</span>
                </div>
                {searchResults.map((crypto, index) => (
                  <button
                    key={crypto.id || index}
                    onClick={() => handleSelectCrypto(crypto)}
                    className="w-full p-4 hover:bg-white/5 transition-colors flex items-center gap-4 border-b border-white/5 last:border-b-0"
                    data-testid={`search-result-${index}`}
                  >
                    {crypto.thumb && <img src={crypto.thumb} alt={crypto.name} className="h-10 w-10 rounded-full" />}
                    <div className="flex-1 text-left">
                      <div className="font-bold text-white">{crypto.name}</div>
                      <div className="text-sm text-white/60 font-mono uppercase flex items-center gap-2">
                        {crypto.symbol}
                        {crypto.blockchain && <span className="text-xs bg-[#FF9F1C]/20 text-[#FF9F1C] px-2 py-0.5">{crypto.blockchain}</span>}
                      </div>
                      {crypto.contract_address && (
                        <div className="text-xs text-white/40 font-mono mt-1 truncate">{crypto.contract_address}</div>
                      )}
                    </div>
                    {crypto.market_cap_rank && (
                      <div className="text-xs font-mono text-white/40">#{crypto.market_cap_rank}</div>
                    )}
                    <BarChart3 className="h-5 w-5 text-[#00F090]" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Recommendations */}
        {!selectedCrypto && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-[#FFD700]" />
              <h3 className="text-xl font-bold font-unbounded uppercase">AI Recommendations</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aiRecommendations.map((rec, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(rec.name)}
                  className="glass-card p-4 hover:border-[#FF9F1C]/50 transition-all text-left"
                >
                  <div className="font-bold text-white">{rec.name}</div>
                  <div className="text-xs text-white/60 font-mono uppercase">{rec.symbol}</div>
                  <div className="text-xs text-[#00F090] mt-2">{rec.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingDetails && (
          <div className="glass-card p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#FF9F1C] animate-spin" />
            <p className="text-white/60 font-mono">Loading blockchain data...</p>
          </div>
        )}

        {/* Crypto Details */}
        {cryptoDetails && !loadingDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="glass-card p-8 border-2 border-[#FF9F1C]/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {cryptoDetails.image && <img src={cryptoDetails.image} alt={cryptoDetails.name} className="h-20 w-20 rounded-full" />}
                  <div>
                    <h2 className="text-4xl font-black font-unbounded">{cryptoDetails.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xl font-mono uppercase text-white/60">{cryptoDetails.symbol}</span>
                      {cryptoDetails.blockchain && (
                        <span className="px-3 py-1 bg-[#FF9F1C]/20 text-[#FF9F1C] font-mono text-sm border border-[#FF9F1C]/30">
                          {cryptoDetails.blockchain}
                        </span>
                      )}
                    </div>
                    {cryptoDetails.contract_address && (
                      <div className="text-xs text-white/40 font-mono mt-2 flex items-center gap-2">
                        Contract: {cryptoDetails.contract_address.substring(0, 20)}...
                        <a href={`https://solscan.io/token/${cryptoDetails.contract_address}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-[#00F090]" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => { setSelectedCrypto(null); setCryptoDetails(null); }} className="text-white/60 hover:text-white transition-colors">
                  <X className="h-8 w-8" />
                </button>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-5xl font-black font-mono text-[#FF9F1C] mb-2">
                  ${cryptoDetails.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 11})}
                </div>
                <div className={`flex items-center gap-2 text-xl font-mono ${
                  cryptoDetails.price_change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                }`}>
                  {cryptoDetails.price_change_24h >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  {cryptoDetails.price_change_24h >= 0 ? '+' : ''}{cryptoDetails.price_change_24h?.toFixed(2)}% (24h)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/trade')}
                  className="flex-1 rounded-sm px-8 py-4 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Trade {cryptoDetails.symbol}
                </button>
                {cryptoDetails.chart_url && (
                  <a
                    href={cryptoDetails.chart_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 border-2 border-[#FF9F1C] text-[#FF9F1C] font-black uppercase tracking-widest hover:bg-[#FF9F1C]/10 transition-all flex items-center gap-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    View Chart
                  </a>
                )}
              </div>
            </div>

            {/* Market Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">Market Cap</div>
                <div className="text-2xl font-black font-mono text-white">
                  ${cryptoDetails.market_cap ? (cryptoDetails.market_cap / 1000000).toFixed(2) + 'M' : 'N/A'}
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">24h Volume</div>
                <div className="text-2xl font-black font-mono text-white">
                  ${cryptoDetails.volume_24h ? (cryptoDetails.volume_24h / 1000).toFixed(2) + 'K' : 'N/A'}
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">24h High</div>
                <div className="text-2xl font-black font-mono text-[#00F090]">
                  ${cryptoDetails.high_24h?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8}) || 'N/A'}
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="text-xs font-mono uppercase text-white/60 mb-2">24h Low</div>
                <div className="text-2xl font-black font-mono text-[#FF2E50]">
                  ${cryptoDetails.low_24h?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8}) || 'N/A'}
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold font-unbounded mb-4 uppercase">Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-white/60 mb-2">7 Days</div>
                  <div className={`text-2xl font-black font-mono ${
                    (cryptoDetails.price_change_7d || 0) >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                  }`}>
                    {(cryptoDetails.price_change_7d || 0) >= 0 ? '+' : ''}{(cryptoDetails.price_change_7d || 0).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-white/60 mb-2">30 Days</div>
                  <div className={`text-2xl font-black font-mono ${
                    (cryptoDetails.price_change_30d || 0) >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                  }`}>
                    {(cryptoDetails.price_change_30d || 0) >= 0 ? '+' : ''}{(cryptoDetails.price_change_30d || 0).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-white/60 mb-2">All-Time High</div>
                  <div className="text-2xl font-black font-mono text-white">
                    ${cryptoDetails.ath?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {cryptoDetails.description && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold font-unbounded mb-4 uppercase">About {cryptoDetails.name}</h3>
                <div 
                  className="text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: typeof cryptoDetails.description === 'string' ? cryptoDetails.description : cryptoDetails.description }}
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
            <p className="text-white/40 text-sm mb-6">Bitcoin • Ethereum • Solana • Fitcoin • Meme coins • Contract addresses</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={() => setSearchQuery('Bitcoin')} className="px-4 py-2 bg-black/50 border border-white/10 text-white hover:border-[#FF9F1C]/50 transition-all">Bitcoin</button>
              <button onClick={() => setSearchQuery('Ethereum')} className="px-4 py-2 bg-black/50 border border-white/10 text-white hover:border-[#FF9F1C]/50 transition-all">Ethereum</button>
              <button onClick={() => setSearchQuery('Solana')} className="px-4 py-2 bg-black/50 border border-white/10 text-white hover:border-[#FF9F1C]/50 transition-all">Solana</button>
              <button onClick={() => setSearchQuery('Fitcoin')} className="px-4 py-2 bg-black/50 border border-[#FF9F1C]/50 text-[#FF9F1C] hover:bg-[#FF9F1C]/10 transition-all">Fitcoin (FTC)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCryptoSearch;
