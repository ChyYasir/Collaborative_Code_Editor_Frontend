import React, { useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/Logout";

const Home = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState([]);
  //   const [response, setResponse] = useState("");
  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setUserId(user._id);
      setRooms(user.roomIds);
    }
  }, []);

  //   const addRoomToUser = async () => {
  //     try {
  //       const res = await axios.post(
  //         `${process.env.REACT_APP_BACKEND_URL}/api/user/add-room`,
  //         {
  //           userId,
  //           roomId,
  //         }
  //       );
  //       console.log({ res });
  //       setResponse(res);
  //     } catch (error) {
  //       console.error("Failed to add room to user:", error);
  //       // Handle error (e.g., show toast notification)
  //     }
  //   };
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
  };
  const saveCode = async () => {
    try {
      const code = "Start Coding";
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/room/save-code`,
        {
          roomId,
          code,
        }
      );
      toast.success("Code saved successfully");
    } catch (error) {
      console.error("Failed to save code:", error);
      toast.error("Failed to save code");
    }
  };
  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/user/add-room`,
      {
        userId,
        roomId,
      }
    );
    console.log({ response });
    if (response.data.new) {
      saveCode();
    }
    if (response.data.success) {
      toast.success(`${response.data.message}`);
      navigate(`/editor/${roomId}`, {
        state: {
          username,
        },
      });
    } else {
      toast.error(`${response.data.error}`);
    }
    // Redirect
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const { _id: userId } = JSON.parse(storedUser);
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user/${userId}`
          );
          console.log(response);
          const userData = response.data.user;
          setRooms(userData.roomIds); // Assuming roomIds now contains room names and IDs
          setUsername(userData.username); // Set the username if not already set
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div className="homePageWrapper">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <h2> Hi, {username}</h2>
          </div>
          <h3>Your Room List</h3>
          {rooms.map((room) => (
            <div key={room.roomId}>
              <h3>Room Name: {room.roomName || "Unnamed Room"}</h3>
              <h4>Room ID: {room.roomId}</h4>
            </div>
          ))}
        </div>

        <Logout />
      </div>
      <div className="formWrapper">
        <img
          className="homePageLogo"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>Built with 💛 &nbsp; by &nbsp; CUET</h4>
      </footer>
    </div>
  );
};

export default Home;
