import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    navigate("/login");
  };

  return (
    <div className="logout-container">
      <button onClick={handleLogout} className="btn leaveBtn">
        Logout
      </button>
    </div>
  );
};

export default Logout;
