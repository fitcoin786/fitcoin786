import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, ArrowRight, Flame, Activity, Users, Watch, Sparkles, Heart, Award, Gift, ExternalLink } from 'lucide-react';
import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(0.00000349);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newChange = (Math.random() - 0.5) * 4;
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
              alt="Future Trade Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FUTURE TRADE</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://fitcoinminers.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm px-6 py-2 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,144,0.4)] hover:shadow-[0_0_25px_rgba(0,240,144,0.6)] flex items-center gap-2"
            >
              ⛏️ Mine FTC
            </a>
            <button
              onClick={() => navigate('/auth')}
              className="rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.4)] hover:shadow-[0_0_25px_rgba(255,159,28,0.6)]"
              data-testid="nav-get-started-btn"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Price Ticker */}
      <div className="fixed top-24 left-0 right-0 bg-black/80 border-y border-white/5 z-40">
        <Marquee gradient={false} speed={50}>
          <div className="flex items-center gap-12 py-2 px-4">
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">FTC/USD</span>
            <span className="font-mono text-lg font-bold text-[#FF9F1C]">${price.toFixed(11)}</span>
            <span className={`font-mono text-sm ${change >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">Market Cap</span>
            <span className="font-mono text-sm text-white">$3.52K</span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-sm uppercase tracking-wider text-white/60">Supply</span>
            <span className="font-mono text-sm text-white">999.99M FTC</span>
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
                FUTURE OF FITNESS TRADING
              </span>
            </h1>
            <p className="text-base md:text-lg font-medium text-[#EAE0D5] max-w-2xl mx-auto mb-6 leading-relaxed">
              India's First Fitness-Backed Cryptocurrency Trading Platform. Trade Fitcoin (FTC), track your health, 
              and convert calories into digital currency with POBC Technology.
            </p>
            <p className="text-sm text-white/60 mb-12 font-mono">
              Powered by VN1 HEALTHBAZAR OPC Pvt Ltd | www.futurecoin.in
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

      {/* FiTOwlSiRinG Section */}
      <section className="py-24 px-6 bg-[#0F1115] relative overflow-hidden">
        <div className="spiritual-aura absolute inset-0 pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Watch className="h-16 w-16 text-[#FF9F1C] mx-auto mb-4" />
            <h2 className="text-4xl md:text-6xl font-black font-unbounded tracking-tighter uppercase mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                FiTOwlSiRinG
              </span>
            </h2>
            <p className="text-2xl text-white/80 font-bold mb-2">India's First Smart Fitness Ring</p>
            <p className="text-lg text-white/60">🌍 America's First Choice – Now in India 🇮🇳</p>
            <p className="text-sm text-white/50 mt-2 font-mono">Imported from China • Originated by USA</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Left Column - Features */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold font-unbounded mb-6 text-[#FF9F1C] uppercase">What FiTOwlSiRinG Tracks</h3>
              <div className="space-y-3">
                {[
                  'Real-Time Calorie Burn (POBC Verified)',
                  'Heart Rate Monitoring',
                  'Steps, Distance & Motion Tracking',
                  'Sleep Quality Monitoring',
                  'Stress Analysis',
                  'Athlete High-Performance Mode',
                  'Automatic FitCoin Minting',
                  'FitRudrah Cloud Sync'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#00F090] mt-1 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Why Choose */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold font-unbounded mb-6 text-[#FFD700] uppercase">Why Choose FiTOwlSiRinG?</h3>
              <div className="space-y-3">
                {[
                  'US-Origin Technology',
                  "India's First FitCoin-Minting Ring",
                  'Real POBC Validation',
                  'Total Blockchain Security',
                  'AI-Powered Health Insights',
                  'Ultra-Light Titanium Alloy',
                  'Sweatproof & Waterproof',
                  'Long Battery - 24/7 Monitoring'
                ].map((reason, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-[#FFD700] mt-1 flex-shrink-0" />
                    <span className="text-white/80">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* POBC Technology Banner */}
          <div className="glass-card p-8 mb-8 border-2 border-[#FF9F1C]/30">
            <div className="text-center">
              <h3 className="text-3xl font-black font-unbounded mb-4 uppercase text-[#FF9F1C]">POBC Technology</h3>
              <p className="text-xl font-bold mb-3">Proof of Burned Calories</p>
              <p className="text-white/70 mb-4">World's first technology that converts real human calories into blockchain-based currency</p>
              <div className="bg-gradient-to-r from-[#FF9F1C]/20 to-[#FFD700]/20 border border-[#FF9F1C]/50 p-6 inline-block">
                <div className="text-5xl font-black font-mono text-[#FF9F1C] mb-2">1:1</div>
                <div className="text-xl font-bold uppercase tracking-wider">1 Calorie Burned = 1 FitCoin</div>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="https://wa.me/p/24774087932292061/918965000054"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 hover:border-[#00F090]/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-white/60 mb-2">WhatsApp Store</div>
                  <div className="text-xl font-bold text-white group-hover:text-[#00F090] transition-colors">Order FiTOwlSiRinG</div>
                  <div className="text-sm text-white/50 mt-1">Coming Soon</div>
                </div>
                <ExternalLink className="h-8 w-8 text-[#00F090]" />
              </div>
            </a>

            <a
              href="https://www.futurecoin.in"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 hover:border-[#FF9F1C]/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-white/60 mb-2">Official Website</div>
                  <div className="text-xl font-bold text-white group-hover:text-[#FF9F1C] transition-colors">www.futurecoin.in</div>
                  <div className="text-sm text-white/50 mt-1">Visit Now</div>
                </div>
                <ExternalLink className="h-8 w-8 text-[#FF9F1C]" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="spiritual-aura absolute inset-0 pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16 font-unbounded uppercase">
            <span className="text-[#FF9F1C]">Special </span>Offers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Athlete Addition */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 border-2 border-[#FFD700]/30 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <Activity className="h-12 w-12 text-[#FFD700] opacity-20" />
              </div>
              <h3 className="text-3xl font-black font-unbounded mb-4 uppercase text-[#FFD700]">Athlete Addition</h3>
              <div className="text-5xl font-black text-white mb-4">₹999 Only</div>
              <p className="text-white/70 mb-6">Special Launch Price - Coming Soon</p>
              <div className="space-y-2 mb-6">
                {['Verified Athlete Badge', 'Advanced Performance Metrics', 'High-Intensity POBC Mode', 'Athlete Leaderboards', 'FitCoin Boost Days'].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#FFD700]" />
                    <span className="text-sm text-white/80">{perk}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://invite.steps.app/jc7n0aj0SgVVsYck"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center rounded-sm px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF9F1C] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Athlete Verification →
              </a>
            </motion.div>

            {/* 100 Fit Warriors */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 border-2 border-[#00F090]/30 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <Gift className="h-12 w-12 text-[#00F090] opacity-20" />
              </div>
              <h3 className="text-3xl font-black font-unbounded mb-4 uppercase text-[#00F090]">100 Fit Warriors</h3>
              <div className="text-5xl font-black text-white mb-4">FREE</div>
              <p className="text-white/70 mb-6">Integration Offer - First 100 Only!</p>
              <div className="space-y-2 mb-6">
                {['FREE POBC Activation', 'FREE FitCoin Mining Integration', 'FREE FiTOwlSiRinG Sync', 'FREE FitWarrior Premium Badge', 'Lifetime Benefits'].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00F090]" />
                    <span className="text-sm text-white/80">{perk}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://invite.steps.app/hO5dwehI8J67"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center rounded-sm px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Claim Free Offer →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trading Features */}
      <section className="py-24 px-6 bg-[#0F1115]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16 font-unbounded uppercase">
            Trade FitCoin <span className="text-[#FF9F1C]">On Future Trade</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-8 relative overflow-hidden group">
              <Zap className="h-12 w-12 text-[#FF9F1C] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Real-Time Trading</h3>
              <p className="text-white/70">Live FTC prices, instant buy/sell, advanced charts with real market data.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-8 relative overflow-hidden group">
              <TrendingUp className="h-12 w-12 text-[#00F090] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Crypto Search</h3>
              <p className="text-white/70">Search any cryptocurrency with detailed analytics and market insights.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-8 relative overflow-hidden group">
              <Flame className="h-12 w-12 text-[#FFD700] mb-6" />
              <h3 className="text-2xl font-bold mb-4 font-unbounded">Market Overview</h3>
              <p className="text-white/70">Track top gainers, losers, and trending cryptos with live data.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16 font-unbounded uppercase">
            <span className="text-[#FF9F1C]">Frequently </span>Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'What is FiTOwlSiRinG?', a: 'A smart fitness ring that turns your calorie burn into FitCoin using POBC technology.' },
              { q: 'Who created FiTOwlSiRinG?', a: 'VN1 HEALTHBAZAR OPC Pvt Ltd under Fitrudrah\'s FitCoin project.' },
              { q: 'What technology powers FitCoin minting?', a: 'POBC – Proof Of Burned Calories.' },
              { q: 'Is FitCoin a real digital currency?', a: 'Yes, it is a blockchain-based fitness-backed currency.' },
              { q: 'How do I earn FitCoin?', a: 'Burn calories → Ring verifies → FitCoin gets minted automatically.' },
              { q: 'Is FiTOwlSiRinG suitable for athletes?', a: 'Yes, it includes a dedicated Athlete High-Performance Mode.' },
              { q: 'What is the Athlete Integration Price?', a: '₹999 Only (Special Launch Price - Coming Soon)' },
              { q: 'Is FiTOwlSiRinG imported?', a: 'Yes — Imported from China, based on US-origin technology.' },
              { q: 'How can I purchase FiTOwlSiRinG?', a: 'Through WhatsApp Store (Coming Soon): wa.me/p/24774087932292061/918965000054' },
              { q: 'Does it support FitWallet & FutureCoin?', a: 'Yes, it syncs directly with www.futurecoin.in.' },
              { q: 'Is FiTOwlSiRinG FREE for 100 Fit Warriors?', a: 'Yes. First 100 get FREE activation, POBC setup, mining integration, and premium features. (Device itself is not free — only integration is free.)' }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 hover:border-[#FF9F1C]/30 transition-all"
              >
                <h4 className="text-lg font-bold text-[#FF9F1C] mb-3">{i + 1}. {faq.q}</h4>
                <p className="text-white/70">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#0F1115]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 font-unbounded uppercase">
            Ready to <span className="text-[#FF9F1C]">Transform Fitness</span> Into Wealth?
          </h2>
          <p className="text-lg text-white/70 mb-12">
            Join the revolution of fitness-backed cryptocurrency. Trade FitCoin, earn through fitness, and build wealth.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="rounded-sm px-12 py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest text-lg hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,159,28,0.5)] hover:shadow-[0_0_30px_rgba(255,159,28,0.7)]"
            data-testid="cta-join-btn"
          >
            Start Trading Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm">
        <p className="font-mono mb-2">© 2026 Future Trade. Powered by Fitcoin (FTC) & VN1 HEALTHBAZAR OPC Pvt Ltd</p>
        <p className="text-xs text-white/30 font-mono mb-2">Solana Contract: 5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump</p>
        <p className="text-xs text-[#FF9F1C]/60 font-bold mb-2">Live Price: $0.00000349 | Market Cap: $3.52K | Supply: 999.99M FTC</p>
        <p className="text-xs text-white/40">Official Website: www.futurecoin.in</p>
      </footer>
    </div>
  );
};

export default LandingPage;
