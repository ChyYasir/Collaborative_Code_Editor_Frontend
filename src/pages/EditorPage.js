import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import Chat from "../components/Chat";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const username = location.state?.username;
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/room/get-code/${roomId}`
        );
        const { code, roomName } = response.data;
        setRoomName(roomName); // Set the fetched room name
      } catch (error) {
        console.error("Failed to fetch room details:", error);
        toast.error("Failed to fetch room details");
      }
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  const updateRoomName = async () => {
    if (!newRoomName) {
      toast.error("Please enter a new room name");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/room/save-code`,
        {
          roomId,
          roomName: newRoomName,
          code: codeRef.current, // Send the current code along with the new name
        }
      );
      setRoomName(newRoomName);
      toast.success("Room name updated successfully");
    } catch (error) {
      console.error("Failed to update room name:", error);
      toast.error("Failed to update room name");
    }
  };

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside2">
        <div className="asideInner">
          <div className="logo">
            <img
              className="logoImage"
              src="../../public/code-sync.png"
              alt="logo"
            />
          </div>
          <h3>{roomName || "Unnamed Room"}</h3>
          <div className="inputGoup">
            <input
              type="text"
              className="inputBox custom"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter new room name"
            />
          </div>
          <button className="btn leaveBtn" onClick={updateRoomName}>
            Update
          </button>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <Chat socketRef={socketRef} roomId={roomId} username={username} />
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
