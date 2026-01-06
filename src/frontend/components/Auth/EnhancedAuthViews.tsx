/**
 * Enhanced Auth Views with OTP and OAuth Support
 */

import React, { useState } from 'react';
import { Loader2, Mail, Lock, User as UserIcon, CheckCircle2, ArrowRight, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
    {/* Animated Background */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] theme-gradient-bg opacity-10 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] theme-gradient-bg opacity-10 rounded-full blur-[100px] animate-pulse duration-[8s] delay-1000"></div>
    </div>

    <div className="w-full max-w-[440px] z-10 animate-fade-in relative">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl -z-10"></div>
      
      <div className="p-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 theme-gradient-bg rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg ring-1 ring-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Streamify</h1>
          <p className="text-zinc-400 font-medium">Sonic Excellence</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-zinc-400 text-sm">{subtitle}</p>
        </div>
        
        {children}
        
        <div className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-white/5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Music Engine v2.0
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ===== SIGNUP VIEW WITH OTP =====
export const SignupView: React.FC = () => {
  const { register } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.requestRegistrationOTP(email);
      if (response.success) {
        setOtpSent(true);
        setStep('otp');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep('details');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await register(email, username, password, firstName, lastName, otp);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.resendOTP(email, 'registration');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Streamify for unlimited music">
      {step === 'email' && (
        <form onSubmit={handleRequestOTP} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (
              <>Continue <ArrowRight size={18} className="ml-2" /></>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-4 text-zinc-500 font-bold tracking-wider">Or</span>
            </div>
          </div>

          <button 
            type="button"
            className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3.5 rounded-2xl transition-all hover:bg-white/10 flex items-center justify-center gap-3"
            onClick={() => {/* TODO: Implement Google OAuth */}}
          >
            <Chrome size={20} />
            Sign up with Google
          </button>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Already have an account? <a href="#/login" className="theme-text-accent hover:underline font-medium">Log in</a>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-500" />
            </div>
            <p className="text-sm text-zinc-400">
              We've sent a 6-digit code to <br />
              <span className="text-white font-semibold">{email}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Verification Code</label>
            <input 
              type="text" 
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={otp.length !== 6}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            Verify Code
          </button>

          <button 
            type="button"
            onClick={handleResendOTP}
            disabled={isSubmitting}
            className="w-full text-zinc-400 hover:text-white text-sm py-2 transition-colors"
          >
            Didn't receive code? Resend
          </button>

          <button 
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-zinc-500 hover:text-zinc-400 text-sm py-2 transition-colors"
          >
            ← Change email
          </button>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <p className="text-sm text-green-500 font-semibold">Email verified!</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">First Name</label>
              <input 
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Last Name</label>
              <input 
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                minLength={8}
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-zinc-500 ml-2">Min. 8 characters with uppercase, lowercase & number</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

// ===== LOGIN VIEW WITH PASSWORD AND OTP OPTIONS =====
export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.requestLoginOTP(email);
      if (response.success) {
        setStep('otp');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.loginWithOTP(email, otp);
      // Manually set auth state since we're not using the context method
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your account to continue">
      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
          </button>

          <button 
            type="button"
            onClick={() => setMode('otp')}
            className="w-full text-sm text-zinc-400 hover:text-white transition-colors py-2"
          >
            Login with email code instead
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-4 text-zinc-500 font-bold tracking-wider">Or</span>
            </div>
          </div>

          <button 
            type="button"
            className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3.5 rounded-2xl transition-all hover:bg-white/10 flex items-center justify-center gap-3"
            onClick={() => {/* TODO: Implement Google OAuth */}}
          >
            <Chrome size={20} />
            Continue with Google
          </button>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account? <a href="#/signup" className="theme-text-accent hover:underline font-medium">Sign up</a>
          </div>
        </form>
      )}

      {mode === 'otp' && step === 'credentials' && (
        <form onSubmit={handleRequestOTP} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all placeholder:text-zinc-700 hover:bg-black/30"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Send Code'}
          </button>

          <button 
            type="button"
            onClick={() => setMode('password')}
            className="w-full text-sm text-zinc-400 hover:text-white transition-colors py-2"
          >
            ← Back to password login
          </button>
        </form>
      )}

      {mode === 'otp' && step === 'otp' && (
        <form onSubmit={handleOTPLogin} className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-500" />
            </div>
            <p className="text-sm text-zinc-400">
              Enter the code sent to <br />
              <span className="text-white font-semibold">{email}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-2">Verification Code</label>
            <input 
              type="text" 
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-white/20 theme-border-active transition-all"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={otp.length !== 6 || isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Login'}
          </button>

          <button 
            type="button"
            onClick={() => setStep('credentials')}
            className="w-full text-zinc-500 hover:text-zinc-400 text-sm py-2 transition-colors"
          >
            ← Change email
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
