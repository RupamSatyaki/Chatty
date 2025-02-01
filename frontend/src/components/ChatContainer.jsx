import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import CallInvitation from "./CallInvitation"; // Import the CallInvitation component
import { io } from 'socket.io-client'; // Import Socket.IO client

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    users, // Access users from the chat store
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser // Add this line to access setSelectedUser
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const socket = useRef(null); // Initialize socket reference
  const [incomingCall, setIncomingCall] = useState(null); // State for incoming call
  const [isRinging, setIsRinging] = useState(false); // State to manage ringing

  useEffect(() => {
    // Check if socket is already initialized
    if (!socket.current) {
      socket.current = io("http://localhost:5001"); // Initialize socket connection
      console.log("Socket connected:", socket.current.id); // Log socket connection
    }

    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      // Listen for incoming call invitations
      socket.current.on("callInvitation", (data) => {
        console.log("Incoming call data:", data); // Log incoming call data
        setIncomingCall(data); // Set incoming call data
        setIsRinging(true); // Show ringing state
      });

      // Handle reconnection logic
      socket.current.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setTimeout(() => {
          socket.current.connect(); // Attempt to reconnect
        }, 1000); // Retry after 1 second
      });

      socket.current.on("disconnect", () => {
        console.log("Disconnected from server. Attempting to reconnect...");
        setTimeout(() => {
          socket.current.connect(); // Attempt to reconnect
        }, 1000); // Retry after 1 second
      });
    }

    return () => {
      unsubscribeFromMessages();
      socket.current.disconnect(); // Disconnect socket on cleanup
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleVideoCall = () => {
    if (!authUser) {
      console.error("User is not authenticated.");
      return; // Prevent starting a call if the user is not authenticated
    }

    if (!selectedUser) {
      toast.error("Please select a user to start a video call.");
      return; // Prevent starting a call if no user is selected
    }

    console.log("Attempting to start video call with user ID:", selectedUser._id); // Log the selected user ID
    window.open(`/video-call/${selectedUser._id}`, "_blank"); // Open video call in a new tab

    socket.current.emit("callInvitation", {
      from: authUser._id,  // Include caller's ID
      to: selectedUser._id
    });
  };

  const handleAcceptCall = () => {
    console.log("Call accepted from:", incomingCall.from); // Log when call is accepted
    setIsRinging(false); // Stop ringing
    window.open(`/video-call/${incomingCall.from}`, "_blank"); // Open video call in a new window
    setIncomingCall(null); // Clear incoming call
  };

  const handleDeclineCall = () => {
    console.log("Call declined from:", incomingCall.from); // Log when call is declined
    setIsRinging(false); // Stop ringing
    setIncomingCall(null); // Clear incoming call
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Define filteredUsers based on selectedUser
  const filteredUsers = users.filter(user => user._id !== selectedUser?._id);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <button onClick={handleVideoCall} className="btn btn-primary">Start Video Call</button> {/* Video call button */}
      {isRinging && <div className="ringing">Ringing... Please answer the call.</div>} {/* Show ringing state */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
      <MessageInput />
      {incomingCall && (
        <CallInvitation
          caller={incomingCall.from}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </div>
  );
};

export default ChatContainer;
