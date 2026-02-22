import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Flame, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarketOverview = ({ user }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gainers');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(`${API}/market/overview`);
        setMarketData(response.data);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const renderCoinList = (coins, type) => {
    if (!coins || coins.length === 0) {
      return (
        <div className="text-center py-12 text-white/60">
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {coins.map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-4 hover:border-[#FF9F1C]/30 transition-all cursor-pointer"
            data-testid={`${type}-coin-${index}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-white/40 font-mono text-sm w-8">#{index + 1}</div>
              {coin.image && (
                <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
              )}
              <div className="flex-1">
                <div className="font-bold text-white">{coin.name}</div>
                <div className="text-sm text-white/60 font-mono uppercase">{coin.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-white">
                  ${coin.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}
                </div>
                <div className={`flex items-center justify-end gap-1 text-sm font-mono ${
                  coin.change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                }`}>
                  {coin.change_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono uppercase text-white/60">Market Cap</div>
                <div className="font-mono text-sm text-white">
                  ${(coin.market_cap / 1000000000).toFixed(2)}B
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
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

          <div className="flex items-center gap-8">
            <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/market" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Markets</Link>
            <Link to="/search" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Search</Link>
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
      <div className="max-w-7xl mx-auto p-6" data-testid="market-overview-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              MARKET OVERVIEW
            </span>
          </h1>
          <p className="text-white/70 font-medium">Real-time cryptocurrency market data</p>
        </motion.div>

        {loading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#FF9F1C] animate-spin" />
            <p className="text-white/60 font-mono">Loading market data...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('gainers')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'gainers'
                    ? 'bg-[#00F090] text-black shadow-[0_0_15px_rgba(0,240,144,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="gainers-tab"
              >
                <TrendingUp className="inline h-4 w-4 mr-2" />
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab('losers')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'losers'
                    ? 'bg-[#FF2E50] text-white shadow-[0_0_15px_rgba(255,46,80,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="losers-tab"
              >
                <TrendingDown className="inline h-4 w-4 mr-2" />
                Top Losers
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-6 py-3 font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'trending'
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black shadow-[0_0_15px_rgba(255,159,28,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="trending-tab"
              >
                <Flame className="inline h-4 w-4 mr-2" />
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
                {activeTab === 'gainers' && renderCoinList(marketData?.top_gainers, 'gainer')}
                {activeTab === 'losers' && renderCoinList(marketData?.top_losers, 'loser')}
                {activeTab === 'trending' && renderCoinList(marketData?.trending, 'trending')}
              </motion.div>
            </AnimatePresence>

            {marketData?.last_updated && (
              <div className="text-center mt-8 text-sm text-white/40 font-mono">
                Last updated: {new Date(marketData.last_updated).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketOverview;