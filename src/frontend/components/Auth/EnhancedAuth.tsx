/**
 * Enhanced Auth Components
 * Features: Glassmorphism design, smooth animations, modern UI patterns
 */

import React, { useState, useEffect } from 'react';
import { 
  Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, 
  Music, ArrowRight, Chrome, Apple, Github, CheckCircle2,
  AlertCircle, Sparkles, Volume2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';

// Enhanced color palette and animations
const AuthLayout: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showWave?: boolean;
}> = ({ children, title, subtitle, showWave = true }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    </div>

    {/* Sound wave animation */}
    {showWave && (
      <div className="absolute bottom-0 left-0 w-full h-20 overflow-hidden opacity-20">
        <div className="flex items-end justify-center h-full gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-green-400 to-transparent w-1 animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    )}

    {/* Main content */}
    <div className="relative z-10 w-full max-w-md">
      {/* Glass card */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Streamify</h1>
          <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Premium Sound Experience</span>
          </div>
        </div>

        {/* Title section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400">{subtitle}</p>
        </div>

        {children}
      </div>

      {/* Footer branding */}
      <div className="mt-6 text-center">
        <p className="text-slate-500 text-xs">
          Powered by advanced music intelligence
        </p>
      </div>
    </div>

    {/* Custom CSS for animations */}
    <style jsx>{`
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `}</style>
  </div>
);

// Enhanced Input Component
const AuthInput: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
}> = ({ type, placeholder, value, onChange, icon, error, required, showPasswordToggle }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-400 transition-colors">
          {icon}
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full bg-slate-800/50 border ${
            error ? 'border-red-400/50' : 'border-slate-700/50'
          } rounded-2xl pl-10 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400/50 focus:bg-slate-800/80 transition-all duration-200`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm ml-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

// OAuth Button Component
const OAuthButton: React.FC<{
  provider: 'google' | 'apple' | 'github';
  onClick: () => void;
  disabled?: boolean;
}> = ({ provider, onClick, disabled }) => {
  const icons = {
    google: <Chrome size={20} />,
    apple: <Apple size={20} />,
    github: <Github size={20} />
  };

  const labels = {
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    github: 'Continue with GitHub'
  };

  const colors = {
    google: 'hover:bg-slate-700/50',
    apple: 'hover:bg-slate-700/50',
    github: 'hover:bg-slate-700/50'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-slate-800/30 border border-slate-700/50 text-white font-medium py-3.5 rounded-2xl transition-all ${colors[provider]} disabled:opacity-50 flex items-center justify-center gap-3`}
    >
      {icons[provider]}
      {labels[provider]}
    </button>
  );
};

// Enhanced Login Component
export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = (provider: string) => {
    // TODO: Implement OAuth
    console.log(`OAuth login with ${provider}`);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue listening"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          icon={<Mail size={18} />}
          required
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          icon={<Lock size={18} />}
          required
          showPasswordToggle
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 bg-slate-800 border border-slate-600 rounded text-green-400 focus:ring-green-400 focus:ring-1"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-green-400 hover:text-green-300 transition-colors"
            onClick={() => {/* TODO: Implement forgot password */}}
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-800/50 px-4 text-slate-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <OAuthButton
            provider="google"
            onClick={() => handleOAuth('google')}
            disabled={isSubmitting}
          />
        </div>

        {/* Sign up link */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <a href="#/signup" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Sign up for free
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

// Enhanced Signup Component
export const SignupView: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.firstName,
        formData.lastName
      );
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOAuth = (provider: string) => {
    // TODO: Implement OAuth
    console.log(`OAuth signup with ${provider}`);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join millions of music lovers worldwide"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={updateFormData('firstName')}
            icon={<UserIcon size={18} />}
          />
          <AuthInput
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={updateFormData('lastName')}
            icon={<UserIcon size={18} />}
          />
        </div>

        <AuthInput
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={updateFormData('email')}
          icon={<Mail size={18} />}
          error={errors.email}
          required
        />

        <AuthInput
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={updateFormData('username')}
          icon={<UserIcon size={18} />}
          error={errors.username}
          required
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={updateFormData('password')}
          icon={<Lock size={18} />}
          error={errors.password}
          required
          showPasswordToggle
        />

        <AuthInput
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={updateFormData('confirmPassword')}
          icon={<Lock size={18} />}
          error={errors.confirmPassword}
          required
          showPasswordToggle
        />

        {/* Terms checkbox */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 bg-slate-800 border border-slate-600 rounded text-green-400 focus:ring-green-400 focus:ring-1"
            />
            <span>
              I agree to the{' '}
              <a href="/terms" className="text-green-400 hover:text-green-300">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-green-400 hover:text-green-300">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && (
            <div className="text-red-400 text-sm ml-7">{errors.terms}</div>
          )}
        </div>

        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        {/* Signup button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Create Account
              <CheckCircle2 size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-800/50 px-4 text-slate-400 font-medium">
              or sign up with
            </span>
          </div>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <OAuthButton
            provider="google"
            onClick={() => handleOAuth('google')}
            disabled={isSubmitting}
          />
        </div>

        {/* Login link */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <a href="#/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};