import { useState } from "react";
function Login({ onLogin,goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="card">
      <h2>Login</h2>
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
      <button className="btn" onClick={() => onLogin(email, password)}>
        Login
      </button>
      <p style={{ marginTop: "10px" }}>
  Don’t have an account?{" "}
  <span
    style={{ color: "#4caf50", cursor: "pointer" }}
    onClick={goToSignup}
  >
    Sign up
  </span>
</p>

    </div>
  );
}

export default Login;
