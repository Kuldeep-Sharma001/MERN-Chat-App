import { GiEmptyHourglass } from "react-icons/gi";
import { BiSolidMessageRounded } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { getSocket } from "../components/socket.js";

function Messages({ receiverId }) {
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user);
  const currentUserId = user.userData._id;
  const token = localStorage.getItem("tokenc");
  const onlineUsers = useSelector((state) => state.socket.onlineUsers);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages(result?.messages?.messages || []);
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

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/message/create-new-message`,
        {
          method: "POST",
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId,
            message: inputText,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send");

      const fetchResponse = await fetch(
        `http://localhost:5000/message/get-messages/${receiverId}`,
        {
          headers: { authorization: token },
        },
      );
      const fetchResult = await fetchResponse.json();
      setMessages(fetchResult?.messages?.messages || []);

      setInputText("");
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
    socket?.on("new-message", (newMessage) => {
      if (newMessage.sender == receiverId) {
        setMessages([...messages, newMessage]);
      }
    });
    return () => {
      socket.off("new-message");
    };
  }, [receiverId]);

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

      <div className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-10">
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
          {onlineUsers.includes(receiverId) ? (
            <p className="text-xs text-green-500 font-medium">Online</p>
          ) : (
            <p className="text-xs text-gray-500 font-medium">Offline</p>
          )}
        </div>
      </div>

      {/* --- MESSAGES --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <span className="loading loading-spinner text-gray-400">
              Loading chat...
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === currentUserId;

            return (
              <div
                key={msg._id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.message}
                  <div
                    className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {dayjs(msg?.createdAt).format("hh:mm A")}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Message --- */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all duration-200">
          <input
            autoFocus
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition-transform shadow-md disabled:opacity-50"
            disabled={!inputText.trim()}
          >
            <IoSend className="size-4 pl-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
