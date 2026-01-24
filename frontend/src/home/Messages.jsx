import React, { useEffect, useState, useRef } from "react";
import { GiEmptyHourglass } from "react-icons/gi";
import { BiPlus, BiSolidMessageRounded } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { getSocket } from "../components/socket.js";

function Messages({ receiverId }) {
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user);
  const currentUserId = user?.userData?._id; 
  const token = localStorage.getItem("tokenc");
  const onlineUsers = useSelector((state) => state.socket.onlineUsers);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, previewFiles]);

  // --- FETCH MESSAGES ---
  const getMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/message/get-messages/${receiverId}`,
        {
          method: "GET",
          headers: { authorization: token },
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Error fetching chat");

      setReceiver(result.receiver);
      setMessages(result.messages || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!receiverId) return;
    getMessages();
  }, [receiverId, token]);

  // --- FILE HANDLERS ---
  function handleFile(e) {
    const selectedFiles = Array.from(e.target.files);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviewFiles((prev) => [...prev, ...newPreviews]);
    e.target.value = null;
  }

  const removeFile = (index) => {
    URL.revokeObjectURL(previewFiles[index]); // Free memory
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SEND MESSAGE ---
  const sendMessage = async () => {
    if (!inputText.trim() && files.length === 0) return;
    if (files.length > 5) {
      toast.error(`files limit exceed
        only 5 files allowed`);
      return;
    }
    const formData = new FormData();
    formData.append("message", inputText);
    formData.append("receiverId", receiverId);
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(
        `http://localhost:5000/message/create-new-message`,
        {
          method: "POST",
          headers: { authorization: token },
          body: formData,
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send");

      if (result.newMessage) {
        setMessages((prev) => [...prev, result.newMessage]);
      }

      setInputText("");
      setFiles([]);
      setPreviewFiles([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (newMessage) => {
      const isFromReceiver =
        newMessage.sender === receiverId ||
        newMessage.sender._id === receiverId;
      if (isFromReceiver) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket?.on("new-message", handleNewMessage);
    return () => socket?.off("new-message", handleNewMessage);
  }, [receiverId]);

  // --- DATE FORMATTER ---
  const getFormattedDate = (date) => {
    const now = dayjs();
    const msgDate = dayjs(date);
    if (msgDate.isSame(now, "day")) return "Today";
    if (msgDate.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
    if (msgDate.isSame(now, "year")) return msgDate.format("MMMM D");
    return msgDate.format("MMMM D, YYYY");
  };

  // --- EMPTY STATE ---
  if (!receiverId) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-slate-50 text-slate-300">
        <div className="relative flex items-center justify-center">
          <GiEmptyHourglass className="size-26 animate-pulse absolute text-slate-500 z-10" />
          <BiSolidMessageRounded className="size-55" />
        </div>
        <h2 className="text-2xl font-semibold mt-4 text-slate-600 tracking-tight">
          Select a chat to start messaging
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] relative overflow-hidden">
      <Toaster position="top-center" />

      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="relative">
          <img
            src={
              receiver?.profilePicture || "https://avatar.iran.liara.run/public"
            }
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
          />
          {onlineUsers.includes(receiverId) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight">
            {receiver?.fullname || "Unknown User"}
          </h3>
          <p
            className={`text-xs font-medium ${onlineUsers.includes(receiverId) ? "text-green-500" : "text-gray-500"}`}
          >
            {onlineUsers.includes(receiverId) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* --- MESSAGES  --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <span className="loading loading-spinner text-gray-400">
              Loading chat...
            </span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === currentUserId || msg.sender === currentUserId;

            // Date Logic
            const currentDate = dayjs(msg.createdAt).format("YYYY-MM-DD");
            const prevDate =
              index > 0
                ? dayjs(messages[index - 1].createdAt).format("YYYY-MM-DD")
                : null;
            const showDateSeparator = currentDate !== prevDate;

            return (
              <React.Fragment key={msg._id}>
                {/*  Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center sticky top-0 z-10 my-0">
                    <span className="bg-slate-200/80 backdrop-blur-sm text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg">
                      {getFormattedDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                {/* Message  */}
                <div
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-sm leading-relaxed wrap-break-words ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {/* Images */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="mb-2 grid gap-2">
                        {msg.files.map((file, i) => (
                          <img
                            key={i}
                            src={"http://localhost:5000/" + file}
                            alt="attachment"
                            className="rounded-lg max-h-60 w-full object-cover"
                            onLoad={scrollToBottom} // <--- FIX: Scrolls down when image loads
                          />
                        ))}
                      </div>
                    )}

                    {msg.message && <p>{msg.message}</p>}

                    <div
                      className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {dayjs(msg.createdAt).format("hh:mm A")}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-gray-100 z-20">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-3xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all duration-200 relative">
          {/* File Previews */}
          {previewFiles.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg flex flex-wrap gap-3 max-w-full z-30">
              {previewFiles.map((url, index) => (
                <div key={url} className="relative group w-16 h-16">
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -right-2 -top-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-colors text-xs font-bold z-10"
                  >
                    ✕
                  </button>
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                  />
                </div>
              ))}
            </div>
          )}

          <label
            className={`p-1.5 rounded-full transition-colors ${
              files.length >= 5
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : "hover:bg-gray-200 text-gray-500 cursor-pointer"
            }`}
          >
            <BiPlus size={20} />
            <input
              disabled={files.length >= 5}
              type="file"
              multiple
              onChange={(e) => {
                handleFile(e);
              }}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
          </label>

          <input
            autoFocus
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 min-w-0"
            placeholder="Type your message..."
          />

          <button
            onClick={sendMessage}
            disabled={!inputText.trim() && files.length === 0}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend className="size-4 pl-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
