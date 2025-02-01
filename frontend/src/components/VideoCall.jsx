import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import IncomingCallWindow from './IncomingCallWindow';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const VideoCall = () => {
  const { id } = useParams();
  const { setSelectedUser, selectedUser, users } = useChatStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const { authUser } = useAuthStore();
  const socket = useRef(null);
  const [isCallInvited, setIsCallInvited] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [caller, setCaller] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userFromStore = users.find(user => user._id === id);
        if (userFromStore) {
          setSelectedUser(userFromStore);
          console.log("Selected user from store:", userFromStore); // Log selected user
        } else {
          const response = await axios.get(`/api/users/${id}`);
          if (response.data && typeof response.data === 'object') {
            setSelectedUser(response.data);
            console.log("Fetched user from API:", response.data); // Log fetched user
          } else {
            toast.error("Invalid user data received");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error(error.response?.data?.message || "Failed to load user data");
      }
    };

    fetchUser();
  }, [id, setSelectedUser, users]);

  // WebRTC and Socket.IO setup
  useEffect(() => {
    let localStream;
    const initCall = async () => {
      try {
        if (!authUser?._id) return;

        socket.current = io("http://localhost:5001", {
          withCredentials: true,
          auth: { userId: authUser._id }
        });

        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        peerConnection.current = new RTCPeerConnection();

        localStream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, localStream);
        });

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.current.emit("signal", {
              iceCandidate: event.candidate,
              to: id
            });
          }
        };

        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        socket.current.on("signal", async (data) => {
          if (data.offer) {
            await peerConnection.current.setRemoteDescription(data.offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.current.emit("signal", {
              answer: answer,
              to: data.from
            });
          } else if (data.answer) {
            await peerConnection.current.setRemoteDescription(data.answer);
          } else if (data.iceCandidate) {
            await peerConnection.current.addIceCandidate(data.iceCandidate);
          }
        });

        socket.current.on("callInvitation", (data) => {
          setCaller(data.from);
          setIsCallInvited(true);
          setIsRinging(true);
        });

        socket.current.on("callFailed", (message) => {
          console.error("Call failed:", message);
          setIsRinging(false);
        });

      } catch (error) {
        console.error("Error initializing call:", error);
      }
    };

    initCall();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [authUser?._id, id]);

  const handleStartCall = async () => {
    if (!selectedUser) {
      console.error("No selected user for the call."); // Log error if no user is selected
      return;
    }

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current.emit("callInvitation", {
        to: selectedUser._id,
        offer: peerConnection.current.localDescription
      });

      setIsCallInvited(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleAcceptCall = async () => {
    setIsCallInvited(false);
    setIsRinging(false);

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current.emit("signal", {
        to: caller,
        answer: peerConnection.current.localDescription
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const handleDeclineCall = () => {
    setIsCallInvited(false);
    setIsRinging(false);
    socket.current.emit("callRejected", { to: caller });
  };

  const toggleMute = () => {
    const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !isCameraOn;
    });
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2>Video Call</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: '300px', height: '200px', border: '2px solid #ccc', borderRadius: '8px', margin: '0 10px' }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{ width: '300px', height: '200px', border: '2px solid #ccc', borderRadius: '8px', margin: '0 10px' }}
        />
      </div>

      {isRinging && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px'
        }}>
          <div className="ringing-message">Ringing...</div>
        </div>
      )}

      {isCallInvited && (
        <IncomingCallWindow
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          caller={caller}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={handleStartCall}
          disabled={!selectedUser}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isCallInvited ? 'End Call' : 'Start Call'}
        </button>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={toggleMute}
            style={{
              padding: '10px',
              backgroundColor: isMuted ? '#dc3545' : '#28a745',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={toggleCamera}
            style={{
              padding: '10px',
              backgroundColor: isCameraOn ? '#28a745' : '#dc3545',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
