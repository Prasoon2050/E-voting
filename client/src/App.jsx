import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import RegisterVoter from "./pages/RegisterVoter.jsx";
import VoterLogin from "./pages/VoterLogin.jsx";
import Vote from "./pages/Vote.jsx";
import Results from "./pages/Results.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login" />
            }
          >
            <Route path="/admin/register" element={<RegisterVoter />} />
          </Route>

          <Route path="/voter/login" element={<VoterLogin />} />

            <Route path="/voter/vote" element={<Vote />} />
            <Route path="/voter/results" element={<Results />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
