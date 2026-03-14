import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Film, User, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuthStore } from "../stores/authStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { loginSchema, signupSchema, forgotPasswordSchema } from "../lib/schemas";

export default function Login() {
  usePageTitle("Sign In");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

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
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.ok) {
      toast.success("Signed in with Google!");
      navigate("/search");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Ambient orbs */}
      <div className="ambient-orb w-96 h-96 bg-violet-500/15 -top-20 -right-20 animate-float" />
      <div className="ambient-orb w-72 h-72 bg-cyan-500/10 bottom-10 -left-20 animate-float-slow" />

      <motion.div
        key={isForgotPassword ? "forgot" : isSignUp ? "signup" : "login"}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className="w-full max-w-md"
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      {...register("password")}
                      className="pl-10"
                    />
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
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...register("confirmPassword")}
                        className="pl-10"
                      />
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
                    <img
                      src="https://www.google.com/favicon.ico"
                      className="h-4 w-4"
                      alt=""
                    />
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
  );
}
