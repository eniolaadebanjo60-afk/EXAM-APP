import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Practice from "./pages/Practice";
import ExamRoom from "./pages/ExamRoom";
import "./styles/App.css";

function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/practice">Practice</NavLink>
      <NavLink to="/exam">Exam Room</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/practice"
          element={
            <>
              <Nav />
              <Practice />
            </>
          }
        />
        <Route
          path="/exam"
          element={
            <>
              <Nav />
              <ExamRoom />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/practice" replace />} />
      </Routes>
    </BrowserRouter>
  );
}