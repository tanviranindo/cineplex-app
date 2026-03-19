import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Film, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import GoogleIcon from './GoogleIcon';
import { useAuthStore } from '../stores/authStore';
import { useLoginModalStore } from '../stores/loginModalStore';
import { useWatchlistStore } from '../stores/watchlistStore';
import { loginSchema, signupSchema } from '../lib/schemas';

export default function LoginModal() {
  const { isOpen, pendingMovie, close } = useLoginModalStore();
  const signup = useAuthStore((s) => s.signup);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const add = useWatchlistStore((s) => s.add);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInFlight = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
  });

  const afterLogin = async (userId) => {
    if (pendingMovie) {
      try {
        await add(pendingMovie, userId);
        toast.success(`"${pendingMovie.title}" added to watchlist!`);
      } catch {
        toast.error('Failed to add to watchlist');
      }
    } else {
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!');
    }
    close();
    reset();
  };

  const onSubmit = async (data) => {
    setError('');
    let result;
    if (isSignUp) {
      result = await signup(data.name, data.email, data.password);
    } else {
      result = await login(data.email, data.password);
    }
    if (result.ok) {
      const { auth } = await import('../services/firebase');
      await afterLogin(auth.currentUser?.uid);
    } else {
      setError(result.error);
    }
  };

  const handleGoogle = async () => {
    if (googleInFlight.current) return;
    googleInFlight.current = true;
    setGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle();
    googleInFlight.current = false;
    setGoogleLoading(false);
    if (result.ok) {
      const { auth } = await import('../services/firebase');
      await afterLogin(auth.currentUser?.uid);
    } else {
      setError(result.error);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      close();
      reset();
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Film className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            {pendingMovie
              ? `Sign in to add "${pendingMovie.title}" to your watchlist`
              : 'Sign in to access your watchlist'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
          {isSignUp && (
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full name" {...register('name')} className="pl-10" />
              </div>
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
          )}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" {...register('email')} className="pl-10" />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
                className="pl-10"
              />
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          {isSignUp && (
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  {...register('confirmPassword')}
                  className="pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-background px-2">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          <GoogleIcon />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              reset();
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
