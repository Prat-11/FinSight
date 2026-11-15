import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your investment portfolio and market insights"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember terminal</span>
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:text-blue-300">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111827] px-2 text-gray-400 font-mono">Or Instant Access</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
          onClick={handleDemoLogin}
          leftIcon={<Sparkles className="w-4 h-4 text-blue-400" />}
        >
          Explore Live Demo (1-Click)
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-400">
        Don&apos;t have an institutional account?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
