import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Signup from "./components/Signup";
import { io } from "socket.io-client";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import VideoCall from "./components/VideoCall";
import CallScreen from "./components/CallScreen";

import "./App.css";

// STUN + TURN configuration for WebRTC
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

function App() {

  // Auth screen control
const [showSignup, setShowSignup] = useState(false);

  // Logged in user
  const [user, setUser] = useState(null);

  // Incoming call data
  const [incomingCall, setIncomingCall] = useState(null);

  // User ID to call
  const [callTo, setCallTo] = useState("");

  // List of online users
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Socket reference
  const socketRef = useRef(null);
  

  // WebRTC peer connection reference
  const peerRef = useRef(null);

  // Call state
  const [inCall, setInCall] = useState(false);

  // 🔴 VERY IMPORTANT
  // This always stores the connected user's id
  // Without this, End Call cannot work on both sides
  const [peerId, setPeerId] = useState(null);

  // ---------------- LOGIN ----------------
  // const handleLogin = async (email, password) => {
  //   const res = await axios.post(
  //     `http://${window.location.hostname}:5000/api/auth/login`,
  //     { email, password }
  //   );
  //   setUser(res.data.user);
  // };
  const handleLogin = async (email, password) => {
    const BACKEND_URL = "https://video-call-app-3jh8.onrender.com/";
    const res = await axios.post(
      `http://${BACKEND_URL}:5000/api/auth/login`,
      { email, password }
    );
    setUser(res.data.user);
  };

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    if (user) {
      socketRef.current = io(`${window.location.hostname}:5000`);

      // Tell server this user is online
      socketRef.current.emit("join", user.id);

      // Receive incoming call
      socketRef.current.on("incoming-call", ({ from, offer }) => {
        setIncomingCall({ from, offer });
      });

      // Receive answer
      socketRef.current.on("call-answered", async ({ answer }) => {
        await peerRef.current.setRemoteDescription(answer);
      });

      // Receive ICE candidate
      socketRef.current.on("ice-candidate", async ({ candidate }) => {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(candidate);
        }
      });

      // Receive online users list
      socketRef.current.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      // 🔴 When other user ends the call
      socketRef.current.on("call-ended", () => {
        cleanupCall(); // auto end on this side
      });
    }
  }, [user]);

  // ---------------- START CAMERA + MIC ----------------
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Show local video
    document.getElementById("localVideo").srcObject = stream;

    // Important for mobile/safari
    document.getElementById("remoteVideo").playsInline = true;

    // Send tracks to peer
    stream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, stream);
    });
  };

  // ---------------- CALL USER ----------------
  const callUser = async () => {
    peerRef.current = new RTCPeerConnection(config);

    setInCall(true); 
    setPeerId(callTo); // 🔴 store who you are calling

    // ICE state log
    peerRef.current.oniceconnectionstatechange = () => {
      console.log("ICE state:", peerRef.current.iceConnectionState);
    };

    await startMedia();

    peerRef.current.ontrack = (e) => {
      document.getElementById("remoteVideo").srcObject = e.streams[0];
    };

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: callTo,
          candidate: e.candidate,
        });
      }
    };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socketRef.current.emit("call-user", {
      from: user.id,
      to: callTo,
      offer,
    });
  };

  // ---------------- ACCEPT CALL ----------------
  const acceptCall = async () => {
    peerRef.current = new RTCPeerConnection(config);

    setInCall(true);
    setPeerId(incomingCall.from); // 🔴 store who called you

    // ICE state log
    peerRef.current.oniceconnectionstatechange = () => {
      console.log("ICE state:", peerRef.current.iceConnectionState);
    };

    await startMedia();

    peerRef.current.ontrack = (event) => {
      document.getElementById("remoteVideo").srcObject = event.streams[0];
    };

    // Send ICE candidates from callee to caller
    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: incomingCall.from,
          candidate: e.candidate,
        });
      }
    };

    await peerRef.current.setRemoteDescription(incomingCall.offer);

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socketRef.current.emit("answer-call", {
      to: incomingCall.from,
      answer,
    });

    setIncomingCall(null);
  };

  // ---------------- CLEANUP CALL ----------------
  // This function is used by BOTH:
  // - when I click End
  // - when other user clicks End
  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");

    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
    }

    if (remoteVideo.srcObject) {
      remoteVideo.srcObject = null;
    }

    setInCall(false);
    setPeerId(null);
  };

  // ---------------- END CALL ----------------
  const endCall = () => {
    // 🔴 Notify the EXACT connected peer
    socketRef.current.emit("end-call", {
      to: peerId
    });

    cleanupCall(); // end locally
  };

// ---------------- UI ----------------
if (!user) {
  if (showSignup) {
    return <Signup goToLogin={() => setShowSignup(false)} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      goToSignup={() => setShowSignup(true)}
    />
  );
}


// 🔴 THIS IS THE LINE YOU ASKED ABOUT
// When a call is active, show full screen Call UI
if (inCall) {
  return <CallScreen endCall={endCall} />;
}

  return (
    <div className="container">
      <Dashboard
        user={user}
        callTo={callTo}
        setCallTo={setCallTo}
        callUser={callUser}
        onlineUsers={onlineUsers}
      />

      {incomingCall && (
        <div className="incoming">
          <p>Incoming call...</p>
          <button className="btn accept" onClick={acceptCall}>
            Accept
          </button>
          
        </div>
        
      )}
      
      

      {/* End Call button */}
      {inCall && (
        
        <button className="btn end" onClick={endCall}>
          End Call
        </button>
      )}

      <VideoCall />
    </div>
  );
}

export default App;
