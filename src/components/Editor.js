import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import axios from "axios";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/room/get-code/${roomId}`
        );
        const fetchedCode = response.data.code;
        if (editorRef.current) {
          editorRef.current.setValue(fetchedCode);
        }
      } catch (error) {
        console.error("Failed to fetch code:", error);
        toast.error("Failed to fetch code");
      }
    };

    if (roomId) {
      fetchCode();
    }
  }, [roomId]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  const saveCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/room/save-code`,
          { roomId, code }
        );
        toast.success("Code saved successfully");
      } catch (error) {
        console.error("Failed to save code:", error);
        toast.error("Failed to save code");
      }
    }
  };
  //   console.log(editorRef.current.getTextArea());
  return (
    <>
      <button onClick={saveCode} className="btn joinBtn margin">
        Save Code
      </button>
      <textarea id="realtimeEditor"></textarea>
    </>
  );
};

export default Editor;
