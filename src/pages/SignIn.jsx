import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Film, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import PasswordInput from '../components/PasswordInput';
import GoogleIcon from '../components/GoogleIcon';
import AuthLayout from '../components/AuthLayout';
import { useAuthStore } from '../stores/authStore';
import { usePageTitle } from '../hooks/usePageTitle';
import { loginSchema, forgotPasswordSchema } from '../lib/schemas';

export default function SignIn() {
  usePageTitle('Sign In');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInFlight = useRef(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginFn = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const schema = isForgotPassword ? forgotPasswordSchema : loginSchema;

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    if (isForgotPassword) {
      const result = await sendPasswordReset(data.email);
      setLoading(false);
      if (result.ok) {
        setForgotSuccess(true);
      } else {
        setError(result.error);
      }
      return;
    }

    const result = await loginFn(data.email, data.password);
    setLoading(false);
    if (result.ok) {
      toast.success('Welcome back!');
      navigate('/search');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleInFlight.current) return;
    googleInFlight.current = true;
    setGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle();
    googleInFlight.current = false;
    setGoogleLoading(false);
    if (result.ok) {
      navigate('/search');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout posterSide="left">
      <motion.div
        key={isForgotPassword ? 'forgot' : 'login'}
        initial={{ opacity: 0, x: reducedMotion ? 0 : -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="glass rounded-2xl p-6 sm:p-8 card-glow">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: reducedMotion ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }
              }
              className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/25"
            >
              <Film className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {isForgotPassword
              ? "Enter your email and we'll send you a reset link."
              : 'Sign in to access your watchlist'}
          </p>

          {isForgotPassword ? (
            forgotSuccess ? (
              <div className="text-center py-4">
                <p className="text-sm text-green-400 mb-4">
                  Password reset email sent. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSuccess(false);
                    setError('');
                    reset();
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...register('email')}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div role="alert">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    reset();
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &larr; Back to sign in
                </button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...register('email')}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <PasswordInput
                      {...register('password')}
                      className="pl-10"
                      placeholder="Password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div role="alert">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                  {loading ? 'Please wait...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <div className="mt-6 text-center flex flex-col items-center gap-1">
                <Link
                  to="/auth/signup"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Don't have an account? Sign up
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    reset();
                  }}
                  className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors mt-1"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AuthLayout>
  );
}
