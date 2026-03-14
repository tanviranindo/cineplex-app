import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Film, User, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PasswordInput from "../components/PasswordInput";
import { useAuthStore } from "../stores/authStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { loginSchema, signupSchema, forgotPasswordSchema } from "../lib/schemas";
import { getTrendingMovies, posterUrl } from "../services/tmdb";

export default function Login() {
  usePageTitle("Sign In");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInFlight = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrendingMovies,
    staleTime: 1000 * 60 * 30,
  });

  const schema = isForgotPassword
    ? forgotPasswordSchema
    : isSignUp
    ? signupSchema
    : loginSchema;

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Must be after all hooks
  if (authReady && user) return <Navigate to="/search" replace />;

  const pwd = watch("password") ?? "";
  const strength = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  const colors = [
    "bg-destructive",
    "bg-orange-500",
    "bg-amber-500",
    "bg-green-500",
  ];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    let result;
    if (isForgotPassword) {
      result = await sendPasswordReset(data.email);
      setLoading(false);
      if (result.ok) {
        setForgotSuccess(true);
      } else {
        setError(result.error);
      }
      return;
    }

    if (isSignUp) {
      result = await signup(data.name, data.email, data.password);
    } else {
      result = await login(data.email, data.password);
    }

    setLoading(false);
    if (result.ok) {
      toast.success(isSignUp ? "Account created!" : "Welcome back!");
      navigate("/search");
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleInFlight.current) return;
    googleInFlight.current = true;
    setGoogleLoading(true);
    setError("");
    const result = await loginWithGoogle();
    googleInFlight.current = false;
    setGoogleLoading(false);
    if (result.ok) {
      navigate("/search");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex">
      {/* Left panel – movie collage (desktop only) */}
      <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative overflow-hidden shrink-0">
        {trending && trending.length >= 9 ? (
          <div className="absolute inset-0 grid grid-cols-3 gap-0">
            {trending.slice(0, 9).map((movie) => (
              <div key={movie.id} className="relative overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={posterUrl(movie.poster_path)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900" />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
        {/* Branding text */}
        <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Cineplex</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Cinema, Your Way</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Discover, save, and curate your perfect movie collection — all in one place.
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 relative">
        {/* Ambient orbs */}
        <div className="ambient-orb w-96 h-96 bg-violet-500/15 -top-20 -right-20 animate-float" />
        <div className="ambient-orb w-72 h-72 bg-cyan-500/10 bottom-10 -left-20 animate-float-slow" />

      <motion.div
        key={isForgotPassword ? "forgot" : isSignUp ? "signup" : "login"}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="glass rounded-2xl p-8 card-glow">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: reducedMotion ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 20, delay: 0.1 }
              }
              className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/25"
            >
              <Film className="h-8 w-8 text-white" />
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {isForgotPassword
              ? "Reset Password"
              : isSignUp
              ? "Create Account"
              : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {isForgotPassword
              ? "Enter your email and we'll send you a reset link."
              : isSignUp
              ? "Sign up to start building your watchlist"
              : "Sign in to access your watchlist"}
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
                    setError("");
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
                      {...register("email")}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email.message}
                    </p>
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isSubmitting}
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError("");
                    reset();
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Full name"
                            {...register("name")}
                            className="pl-10"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-destructive text-xs mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...register("email")}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <PasswordInput {...register("password")} className="pl-10" placeholder="Password" />
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                  {isSignUp && pwd.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength
                                ? colors[strength - 1]
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {labels[strength - 1] ?? ""}
                      </p>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <PasswordInput {...register("confirmPassword")} className="pl-10" placeholder="Confirm password" />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                )}

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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isSubmitting}
                >
                  {loading
                    ? "Please wait..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>
              </form>

              {!isForgotPassword && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? "Signing in..." : "Continue with Google"}
                  </Button>
                </>
              )}

              <div className="mt-6 text-center flex flex-col items-center gap-1">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    reset();
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>

                {!isSignUp && !isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      reset();
                    }}
                    className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors mt-1"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
}
