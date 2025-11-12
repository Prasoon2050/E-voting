import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Overview", roles: ["guest", "admin", "voter"] },
  { to: "/admin/login", label: "Admin Login", roles: ["guest"] },
  { to: "/admin/register", label: "Register Voter", roles: ["admin"] },
  { to: "/voter/login", label: "Voter Login", roles: ["guest"] },
  { to: "/voter/vote", label: "Cast Vote", roles: ["voter"] },
  { to: "/voter/results", label: "Results", roles: ["voter"] },
];

export default function Layout() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const filteredNav = navItems.filter((item) => item.roles.includes(role ?? "guest"));

  const handleLogout = () => {
    logout();
    setNavOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, role]);

  const toggleNav = () => setNavOpen((prev) => !prev);
  const closeNav = () => setNavOpen(false);

  return (
    <div className="main-shell">
      <aside className={`navbar${navOpen ? " open" : ""}`}>
        <div>
          <h1>E-Vote HQ</h1>
          <p className="tagline">Face-matched ballot pilot</p>
        </div>

        <nav className="nav-links">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                ["nav-link", isActive ? "active" : ""].filter(Boolean).join(" ")
              }
              onClick={closeNav}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {role ? (
          <div>
            <div className="badge">
              <span>{role.toUpperCase()}</span>
              <span>{user?.name || user?.email || user?.fullName || ""}</span>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button className="primary-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <p className="tagline" style={{ fontSize: "0.9rem" }}>
            Login as admin to register voters or as voter to cast ballots.
          </p>
        )}
      </aside>

      <div className={`nav-backdrop${navOpen ? " show" : ""}`} onClick={closeNav} />

      <main className="content-area">
        <header className="mobile-header">
          <button
            type="button"
            className={`nav-toggle${navOpen ? " open" : ""}`}
            onClick={toggleNav}
            aria-expanded={navOpen}
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="nav-toggle-bars" />
          </button>
          <div>
            <p className="mobile-greeting">Secure E-Voting Portal</p>
            <p className="mobile-subtext">
              {role
                ? `Signed in as ${user?.name || user?.fullName || user?.email || "voter"}`
                : "Authenticate to enrol or cast a ballot"}
            </p>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
