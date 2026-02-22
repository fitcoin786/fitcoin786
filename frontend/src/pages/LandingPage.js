import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(0.0042);
  const [change, setChange] = useState(0);

  useEffect(() => {
    // Simulate price updates
    const interval = setInterval(() => {
      const newChange = (Math.random() - 0.5) * 2;
      setChange(newChange);
      setPrice(prev => prev * (1 + newChange/100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Glass Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-nav fixed top-4 left-0 right-0 mx-auto max-w-7xl z-50 rounded-none"
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FITCOIN</span>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.4)] hover:shadow-[0_0_25px_rgba(255,159,28,0.6)]"
            data-testid="nav-get-started-btn"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* Price Ticker */}
      <div className="fixed top-24 left-0 right-0 bg-black/80 border-y border-white/5 z-40">
        <Marquee gradient={false} speed={50}>
          <div className="flex items-center gap-12 py-2 px-4">
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">FTC/USD</span>
            <span className="font-mono text-lg font-bold text-[#FF9F1C]">${price.toFixed(6)}</span>
            <span className={`font-mono text-sm ${change >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">24H Volume</span>
            <span className="font-mono text-sm text-white">$127,459</span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">Market Cap</span>
            <span className="font-mono text-sm text-white">$4.2M</span>
          </div>
        </Marquee>
      </div>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="spiritual-aura absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin Spirit" 
              className="h-32 w-32 mx-auto mb-8 object-contain"
              data-testid="hero-logo"
            />
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                FUTURE OF TRADING
              </span>
            </h1>
            <p className="text-base md:text-lg font-medium text-[#EAE0D5] max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience the next generation of crypto trading with Fitcoin. Lightning-fast execution, 
              advanced charting, and spiritual wealth consciousness in one hyper-active platform.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="rounded-sm px-12 py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest text-lg hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,159,28,0.5)] hover:shadow-[0_0_30px_rgba(255,159,28,0.7)] inline-flex items-center gap-3"
              data-testid="hero-start-trading-btn"
            >
              Start Trading Now
              <ArrowRight className="h-6 w-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#0F1115]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16 font-unbounded uppercase">
            Why Choose <span className="text-[#FF9F1C]">Fitcoin</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 relative overflow-hidden group"
              data-testid="feature-speed-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="h-12 w-12 text-[#FF9F1C] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Lightning Fast</h3>
              <p className="text-white/70">Execute trades in milliseconds with our hyper-optimized trading engine.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 relative overflow-hidden group"
              data-testid="feature-secure-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F090]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="h-12 w-12 text-[#00F090] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Bank-Level Security</h3>
              <p className="text-white/70">Your assets are protected with military-grade encryption and cold storage.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 relative overflow-hidden group"
              data-testid="feature-charts-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="h-12 w-12 text-[#FFD700] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Pro Charts</h3>
              <p className="text-white/70">Advanced technical analysis tools and real-time market data.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 font-unbounded uppercase">
            Ready to <span className="text-[#FF9F1C]">Elevate</span> Your Trading?
          </h2>
          <p className="text-lg text-white/70 mb-12">
            Join thousands of traders experiencing the future of cryptocurrency trading.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="rounded-sm px-12 py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest text-lg hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,159,28,0.5)] hover:shadow-[0_0_30px_rgba(255,159,28,0.7)]"
            data-testid="cta-join-btn"
          >
            Join Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm">
        <p className="font-mono">© 2026 Fitcoin FTC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;