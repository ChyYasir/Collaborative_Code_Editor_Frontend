import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }
    console.log(process.env.REACT_APP_BACKEND_URL);
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/api/user/login",
        formData
      );
      if (response.data.success) {
        toast.success("Login successful");
        localStorage.setItem("isAuthenticated", true);
        console.log({ response });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to login");
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <h2 className="mainLabel">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="inputBox"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? Please <Link to="/signup">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
