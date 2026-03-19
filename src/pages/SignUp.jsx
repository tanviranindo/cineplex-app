import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Film, User, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PasswordInput from "../components/PasswordInput";
import GoogleIcon from "../components/GoogleIcon";
import AuthLayout from "../components/AuthLayout";
import { useAuthStore } from "../stores/authStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { signupSchema } from "../lib/schemas";

export default function SignUp() {
  usePageTitle("Create Account");
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInFlight = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const pwd = watch("password") ?? "";
  const strength = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  const colors = ["bg-destructive", "bg-orange-500", "bg-amber-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    const result = await signup(data.name, data.email, data.password);
    setLoading(false);
    if (result.ok) {
      toast.success("Account created!");
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
    <AuthLayout posterSide="right">
      <motion.div
        initial={{ opacity: 0, x: reducedMotion ? 0 : 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
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

          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign up to start building your watchlist
          </p>

          <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full name" {...register("name")} className="pl-10" />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email address" {...register("email")} className="pl-10" />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <PasswordInput {...register("password")} className="pl-10" placeholder="Password" />
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              {pwd.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? colors[strength - 1] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{labels[strength - 1] ?? ""}</p>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <PasswordInput {...register("confirmPassword")} className="pl-10" placeholder="Confirm password" />
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
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
              {loading ? "Please wait..." : "Create Account"}
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

          <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
            <GoogleIcon />
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="mt-6 text-center">
            <Link
              to="/auth/signin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
