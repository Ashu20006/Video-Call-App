function Dashboard({ user, callTo, setCallTo, callUser, onlineUsers }) {
  return (
    <div className="card">
      <h2>Welcome {user.name}</h2>
      <p className="userid">Your ID: {user.id}</p>

      <input
        className="input"
        placeholder="Enter userId to call"
        value={callTo}
        onChange={(e) => setCallTo(e.target.value)}
      />

      {/* Disable button if no userId */}
      <button
        className="btn call"
        onClick={callUser}
        disabled={!callTo}   // 🔴 DISABLE LOGIC
      >
        Call
      </button>

      <div className="online-users">
        <h4>Online Users</h4>
        {onlineUsers.map((id) => (
          <div key={id} className="user-item">
            {id}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
