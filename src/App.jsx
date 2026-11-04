import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Practice from "./pages/Practice";
import ExamRoom from "./pages/ExamRoom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import "./styles/App.css";

function Nav() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setNewName(session.user.user_metadata.full_name || "");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) setNewName(session.user.user_metadata.full_name || "");
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  async function handleUpdateName(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: newName }
    });

    if (!error && data.user) {
      setUser(data.user);
      setIsEditing(false);
    }
  }

  const initial = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || "U";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "User";

  return (
    <nav className="nav">
      <button 
        className="nav__mobile-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        ☰
      </button>

      <div className={`nav__links ${mobileMenuOpen ? "is-open" : ""}`}>
        <NavLink to="/home" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/practice" onClick={() => setMobileMenuOpen(false)}>Practice</NavLink>
        <NavLink to="/exam" onClick={() => setMobileMenuOpen(false)}>Exam Room</NavLink>
      </div>

      {user && (
        <div className="nav__profile">
          <button 
            className="nav__profile-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="nav__avatar">{initial}</div>
            <span className="nav__welcome">
              Welcome, {firstName}
            </span>
          </button>

          {menuOpen && (
            <div className="nav__dropdown">
              {isEditing ? (
                <form onSubmit={handleUpdateName} className="nav__edit-form">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="New name"
                    autoFocus
                  />
                  <div className="nav__edit-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="nav__user-info">
                    <strong>{user.user_metadata.full_name || "User"}</strong>
                    <span>{user.email}</span>
                  </div>
                  <hr />
                  <button onClick={() => setIsEditing(true)}>Change Name</button>
                  <button onClick={handleLogout} className="nav__logout">Log Out</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<><Nav /><Home /></>} />
        <Route path="/practice" element={<><Nav /><Practice /></>} />
        <Route path="/exam" element={<><Nav /><ExamRoom /></>} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}