import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Discover from "../pages/Discover";
import Opportunities from "../pages/Opportunities";
import Connections from "../pages/Connections";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/connections" element={<Connections />} />
    </Routes>
  );
}

export default AppRoutes;