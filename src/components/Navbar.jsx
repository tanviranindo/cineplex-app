import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Search,
  BookmarkCheck,
  Compass,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith("/auth/");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    setMobileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/search",    label: "Search",    icon: Search },
    { to: "/browse",    label: "Browse",    icon: Compass },
    ...(user
      ? [{ to: "/watchlist", label: "Watchlist", icon: BookmarkCheck }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-shadow duration-300">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Cineplex</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button key={link.to} variant="ghost" size="sm" asChild>
                <Link
                  to={link.to}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Animated pill theme toggle */}
            <button
              onClick={toggle}
              className="relative flex items-center w-14 h-7 rounded-full bg-muted border border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle theme"
            >
              <motion.div
                className="absolute w-5 h-5 rounded-full bg-background shadow-sm flex items-center justify-center"
                animate={{ x: theme === "dark" ? 30 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {theme === "dark" ? (
                  <Moon className="h-3 w-3 text-primary" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </motion.div>
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none group">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name ?? ""}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                        <span className="text-[11px] font-bold text-white">{initials}</span>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user.name ?? "No name set"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => { if (theme !== "light") toggle(); }}
                        className={theme === "light" ? "bg-accent" : ""}
                      >
                        <Sun className="h-4 w-4 mr-2" /> Light
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (theme !== "dark") toggle(); }}
                        className={theme === "dark" ? "bg-accent" : ""}
                      >
                        <Moon className="h-4 w-4 mr-2" /> Dark
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !isLoginPage && (
                <Button size="sm" asChild>
                  <Link to="/auth/signin">Sign In</Link>
                </Button>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden glass border-t border-border/50"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}

              {/* Mobile theme toggle */}
              <div className="flex items-center gap-2 px-3 py-2 pt-3">
                <button
                  onClick={() => { if (theme !== "light") toggle(); setMobileOpen(false); }}
                  className={`flex items-center gap-2 text-sm px-2 py-1 rounded-lg ${
                    theme === "light"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  onClick={() => { if (theme !== "dark") toggle(); setMobileOpen(false); }}
                  className={`flex items-center gap-2 text-sm px-2 py-1 rounded-lg ${
                    theme === "dark"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>

              <div className="border-t border-border/50 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name ?? ""}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-white">{initials}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  !isLoginPage && (
                    <Link
                      to="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="block"
                    >
                      <Button className="w-full" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
