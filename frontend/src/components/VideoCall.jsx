function VideoCall() {
  return (
    <div className="video-container">
      <video id="localVideo" autoPlay muted />
      <video id="remoteVideo" autoPlay />
    </div>
  );
}

export default VideoCall;
