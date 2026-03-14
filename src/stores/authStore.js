import { create } from "zustand";

function getSession() {
  try {
    const raw = localStorage.getItem("cineplex_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    const raw = localStorage.getItem("cineplex_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useAuthStore = create((set) => ({
  user: getSession(),

  signup: (name, email, password) => {
    const users = getUsers();
    const exists = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password,
    };
    users.push(newUser);
    localStorage.setItem("cineplex_users", JSON.stringify(users));
    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem("cineplex_session", JSON.stringify(session));
    set({ user: session });
    return { ok: true };
  },

  login: (email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem("cineplex_session", JSON.stringify(session));
    set({ user: session });
    return { ok: true };
  },

  logout: () => {
    localStorage.removeItem("cineplex_session");
    set({ user: null });
  },
}));
