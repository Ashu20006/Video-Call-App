function CallScreen({ endCall }) {
  return (
    <div className="call-screen">
      <video id="remoteVideo" autoPlay className="remote" />
      <video id="localVideo" autoPlay muted className="local" />
      
      <button className="btn end" onClick={endCall}>
        End Call
      </button>
    </div>
  );
}

export default CallScreen;
