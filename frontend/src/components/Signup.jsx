import { useState } from "react";
import axios from "axios";

function Signup({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    await axios.post(
      `http://${window.location.hostname}:5000/api/auth/register`,
      { name, email, password }
    );

    alert("Registered successfully! Please login.");
    goToLogin(); // go back to login page
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>

      <input
        className="input"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn" onClick={handleSignup}>
        Register
      </button>

      <p style={{ marginTop: "10px" }}>
        Already have an account?{" "}
        <span
          style={{ color: "#4caf50", cursor: "pointer" }}
          onClick={goToLogin}
        >
          Login
        </span>
      </p>
    </div>
  );
}

export default Signup;
