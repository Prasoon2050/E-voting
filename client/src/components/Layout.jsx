import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

  const filteredNav = navItems.filter((item) => item.roles.includes(role ?? "guest"));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="main-shell">
      <aside className="navbar">
        <div>
          <h1>E-Vote HQ</h1>
          <p style={{ color: "#94a3b8", margin: "0.25rem 0 0" }}>
            Face-matched ballot pilot
          </p>
        </div>

        <nav className="nav-links">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                ["nav-link", isActive ? "active" : ""].filter(Boolean).join(" ")
              }
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
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Login as admin to register voters or as voter to cast ballots.
          </p>
        )}
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
