import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      const { token, user } = response.data;

      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLogin(token, user);
      navigate('/trade');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="spiritual-aura absolute inset-0 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <img 
            src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
            alt="Fitcoin Spirit" 
            className="h-24 w-24 mx-auto mb-6 object-contain"
            data-testid="auth-logo"
          />
          <h1 className="text-4xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              {isLogin ? 'WELCOME BACK' : 'JOIN FITCOIN'}
            </span>
          </h1>
          <p className="text-white/70 font-medium">
            {isLogin ? 'Sign in to continue trading' : 'Create your trading account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                  placeholder="Enter your full name"
                  required={!isLogin}
                  data-testid="auth-fullname-input"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                placeholder="your@email.com"
                required
                data-testid="auth-email-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                placeholder="Enter password"
                required
                data-testid="auth-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.4)] hover:shadow-[0_0_25px_rgba(255,159,28,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="auth-submit-btn"
            >
              {loading ? 'LOADING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/60 hover:text-[#FF9F1C] transition-colors font-medium"
              data-testid="auth-toggle-btn"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;