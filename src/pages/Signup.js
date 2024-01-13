import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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

    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("All fields are required");
      return;
    }
    console.log(formData);
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/api/user/register",
        formData
      );
      console.log({ response });
      if (response.data.success) {
        toast.success("Registration successful");
        navigate("/login");
      } else {
        toast.error("Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to register");
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/codev_final.png" alt="codev-logo" />
        <h2 className="mainLabel">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="inputBox"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="inputBox"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
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
          <div className="inputGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="inputBox"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button className="btn joinBtn" type="submit">
            Sign Up
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <Link className="createNewBtn" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
