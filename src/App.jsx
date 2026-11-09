import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Practice from "./pages/Practice";
import ExamRoom from "./pages/ExamRoom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Graduate from "./pages/Graduate";
import CipmLevels from "./pages/CipmLevels";
import ModeSelection from "./pages/ModeSelection";
import Landing from "./pages/Landing";
import "./styles/App.css";

function Nav({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(session?.user?.user_metadata?.full_name || "");
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleUpdateName(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const { error } = await supabase.auth.updateUser({ data: { full_name: newName } });
    if (!error) setIsEditing(false);
  }

  const initial = session?.user?.user_metadata?.full_name?.charAt(0).toUpperCase() || "G";
  const firstName = session?.user?.user_metadata?.full_name?.split(" ")[0] || "Guest";

  return (
    <nav className="nav">
      <div className="nav__left">
        <div className="nav__profile">
          <button className="nav__profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="nav__avatar">{initial}</div>
            <span className="nav__welcome">Welcome, {firstName}</span>
          </button>

          {menuOpen && (
            <div className="nav__dropdown">
              {session && !isEditing ? (
                <>
                  <div className="nav__user-info">
                    <strong>{session.user.user_metadata.full_name || "User"}</strong>
                    <span>{session.user.email}</span>
                  </div>
                  <hr />
                  <button onClick={() => setIsEditing(true)}>Change Name</button>
                  <button onClick={handleLogout} className="nav__logout">Log Out</button>
                </>
              ) : !session ? (
                <>
                   <div className="nav__user-info">
                    <strong>Guest User</strong>
                    <span>You are in Demo Mode</span>
                  </div>
                  <hr />
                  <button onClick={() => navigate("/auth")} style={{ color: "var(--accent)" }}>Create Free Account</button>
                </>
              ) : (
                <form onSubmit={handleUpdateName} className="nav__edit-form">
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New name" autoFocus />
                  <div className="nav__edit-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <button className="nav__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        ☰
      </button>

      <div className={`nav__links ${mobileMenuOpen ? "is-open" : ""}`}>
        <NavLink to="/home" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/practice" onClick={() => setMobileMenuOpen(false)}>Practice</NavLink>
        <NavLink to="/exam" onClick={() => setMobileMenuOpen(false)}>Exam Room</NavLink>
      </div>
    </nav>
  );
}

function PublicRoute({ session }) {
  if (session) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="practice__spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute session={session} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
        </Route>

        <Route path="/home" element={<><Nav session={session} /><Home /></>} />
        <Route path="/graduate" element={<><Nav session={session} /><Graduate /></>} />
        <Route path="/cipm-levels" element={<><Nav session={session} /><CipmLevels /></>} />
        <Route path="/mode" element={<><Nav session={session} /><ModeSelection /></>} />
        <Route path="/practice" element={<><Nav session={session} /><Practice /></>} />
        <Route path="/exam" element={<><Nav session={session} /><ExamRoom /></>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}