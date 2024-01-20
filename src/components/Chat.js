// Chat.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ACTIONS from "../Actions"; // Import actions

const Chat = ({ socketRef, roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  console.log({ socketRef, roomId });
  // Effect for fetching initial chat messages
  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/room/get-chat-messages/${roomId}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        toast.error("Failed to fetch chat messages");
      }
    };

    if (roomId) {
      fetchChatMessages();
    }
  }, [roomId]);

  // Effect for setting up real-time chat listener
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    if (socketRef.current) {
      socketRef.current.on(ACTIONS.RECEIVE_MESSAGE, handleNewMessage);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.RECEIVE_MESSAGE, handleNewMessage);
      }
    };
  }, [socketRef.current]);

  const sendMessage = () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
    const messageData = {
      username,
      message: newMessage,
    };
    socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
      roomId,
      message: newMessage,
      username,
    });
    // setMessages([...messages, messageData]); // Optimistic UI update
    setNewMessage(""); // Clear input field
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
