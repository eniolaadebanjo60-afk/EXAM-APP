import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  function switchMode(login) {
    setIsLogin(login);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
    }

    if (result.error) {
      setError(result.error.message);
    } else if (!isLogin && !result.data.session) {
      setNotice("Check your email for the confirmation link!");
    } else {
      navigate("/home");
    }
    setLoading(false);
  }

  return (
    <div className="auth">
      <div className="auth__shell">
        <button className="back-btn auth__back" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="auth__card">
          <div className="auth__brand">
            <span className="auth__mark">S</span>
            <span>Satoru Exam Prep</span>
          </div>

          <div className="auth__tabs" role="tablist" data-mode={isLogin ? "login" : "signup"}>
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={isLogin ? "is-active" : ""}
              onClick={() => switchMode(true)}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={!isLogin ? "is-active" : ""}
              onClick={() => switchMode(false)}
            >
              Sign up
            </button>
          </div>

          <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
          <p className="auth__sub">
            {isLogin ? "Log in to continue your streak." : "Sign up to start mastering your exams."}
          </p>

          {error && <div className="auth__error" role="alert">{error}</div>}
          {notice && <div className="auth__notice" role="status">{notice}</div>}

          <form onSubmit={handleSubmit} className="auth__form">
            {!isLogin && (
              <div className="auth__field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth__field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth__field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth__password">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth__eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          <button type="button" className="auth__demo" onClick={() => navigate("/home")}>
            Or try the demo without an account
          </button>
        </div>
      </div>
    </div>
  );
}