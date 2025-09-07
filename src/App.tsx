import React, { Suspense, useEffect, useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";

// Runtime loader for remote module. This normalizes possible export shapes
// (some federation setups return the component as `module.default`, others
// may return the component directly). It also surfaces loading/errors.
function RemoteLoader({ role }: { role: "admin" | "user" }) {
  const [Comp, setComp] = useState<React.ComponentType<{
    role: string;
  }> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setErr(null);
    setComp(null);
    import("music_library/MusicLibrary")
      .then((mod) => {
        const resolved = (mod && (mod.default ?? mod)) as React.ComponentType<{
          role: string;
        }>;
        if (!resolved)
          throw new Error("Remote module did not return a component");
        if (mounted) setComp(() => resolved);
      })
      .catch((e: unknown) => {
        if (mounted) setErr(String(e instanceof Error ? e.message : e));
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (err)
    return (
      <div style={{ color: "salmon", padding: 12 }}>
        <strong>Remote load error:</strong>
        <div style={{ marginTop: 6 }}>{err}</div>
      </div>
    );

  if (!Comp) return <div>Loading remote Music Library...</div>;

  // Render remote inside an error boundary to catch render-time faults
  return (
    <ErrorBoundary>
      <Comp role={role} />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err: unknown) {
    return { error: String(err instanceof Error ? err.message : err) };
  }
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("Remote render error", err, info);
  }
  render() {
    if (this.state.error)
      return (
        <div style={{ color: "salmon" }}>
          <strong>Remote render error:</strong>
          <div>{this.state.error}</div>
        </div>
      );
    return this.props.children;
  }
}

function InnerApp() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: user ? "space-between" : "center",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Music MFE Shell</h1>
        {user && (
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <span style={{ fontSize: 14 }}>
              User: <strong>{user.username}</strong> ({user.role})
            </span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      {!user && <LoginFallback />}
      {user && (
        <Suspense fallback={<div>Loading remote Music Library...</div>}>
          <RemoteLoader role={user.role} />
        </Suspense>
      )}
      <footer style={{ marginTop: "2rem", fontSize: 12, opacity: 0.6 }}>
        Remote loaded via Vite Module Federation (music_library).
      </footer>
    </div>
  );
}

function LoginFallback() {
  const LoginForm = React.lazy(() => import("./components/LoginForm"));
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

export default App;
