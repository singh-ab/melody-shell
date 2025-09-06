import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const ok = await login(u.trim(), p.trim());
    if (!ok) setErr("Invalid credentials");
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: 260,
      }}
    >
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={u}
        onChange={(e) => setU(e.target.value)}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={p}
        onChange={(e) => setP(e.target.value)}
        required
      />
      <button type="submit">Sign In</button>
      {err && <div style={{ color: "salmon", fontSize: 12 }}>{err}</div>}
      <p style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.3 }}>
        Demo creds:
        <br /> admin / admin
        <br /> user / user
      </p>
    </form>
  );
};

export default LoginForm;
