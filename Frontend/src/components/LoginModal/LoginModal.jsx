import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../Button/Button';
import Input from '../Input/Input';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.auth.login(email, password);
      } else {
        data = await api.auth.signup(name, email, password);
      }

      localStorage.setItem('token', data.token);
      onSuccess(data.user);
      onClose();
      // Reset inputs
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Modal card container */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#111827]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        {/* Glow glow background highlights */}
        <div className="absolute -right-20 -top-20 -z-10 size-48 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 -z-10 size-48 rounded-full bg-[#06B6D4]/10 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] text-white mb-3">
            <Sparkles className="size-5" />
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {isLogin ? 'Welcome back to HireHub' : 'Create your student profile'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {isLogin ? 'Enter details to access your AI Career Copilot' : 'Unlock internship matching and automated resume studio tools'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <Input
                type="text"
                placeholder="e.g. Anya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. anya@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Free'}
          </Button>
        </form>

        {/* Switch Login/Signup */}
        <div className="mt-6 border-t border-white/5 pt-4 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account yet?" : "Already registered?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-semibold text-[#A78BFA] hover:text-white transition"
          >
            {isLogin ? 'Create profile' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
