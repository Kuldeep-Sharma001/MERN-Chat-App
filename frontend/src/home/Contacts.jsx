import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch, IoLogOutOutline } from "react-icons/io5";
import { ImSad } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { logout } from "../app/slice/auth";
// LOADING SKELETON COMPONENT
const ContactSkeleton = () => (
  <div className="flex gap-3 items-center p-3 animate-pulse">
    <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
    <div className="flex flex-col gap-2 w-full">
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
    </div>
  </div>
);

function Contacts({ setReceiverId, receiverId }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const token = useSelector((state) => state.auth.token);
  const user = userData?.userData;
  const dispatch = useDispatch();

  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const onlineUsers = useSelector(state => state.socket.onlineUsers);


  const api = "http://localhost:5000/allusers";

  //  FETCH USERS
  
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(api, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch contacts");
        }

        if (result.success) {
          setAllContacts(result.users || []);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (token) getUsers();
  }, [token]);

  //  LOGOUT LOGIC
  function logOut() {
    localStorage.removeItem("tokenc");
    localStorage.removeItem("userc");
    toast.success("Logged out successfully");
    dispatch(logout());
    setTimeout(() => {
      navigate("/login");
    }, 500);
  }

  const filteredContacts = allContacts.filter((contact) =>
    contact.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col bg-green-100 border-r border-slate-200 max-w-sm">
      <Toaster position="top-center" />

      <div className="px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-violet-600 to-indigo-600 tracking-tight">
            Haal Chaal
          </h1>
          <p className="text-xs text-slate-400 font-medium">Stay connected</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <input
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            type="text"
            className="w-full bg-slate-100 text-slate-700 text-sm rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
            placeholder="Search friends..."
          />
          <IoSearch className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* --- CONTACTS LIST --- */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          // Show Skeletons
          Array(6)
            .fill(0)
            .map((_, i) => <ContactSkeleton key={i} />)
        ) : filteredContacts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in zoom-in duration-300">
            <ImSad className="size-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">No contact found</p>
          </div>
        ) : (
          // List
          filteredContacts.map((contact) => {
            const isActive = contact._id === receiverId;
            return (
              <div
                key={contact._id}
                onClick={() => setReceiverId(contact._id)}
                className={`
                  group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 shadow-md shadow-blue-200 transform scale-[1.02]"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    className={`h-12 w-12 rounded-full object-cover border-2 ${isActive ? "border-white/30" : "border-white shadow-sm"}`}
                    src={contact?.profilePicture}
                    alt={contact.fullname}
                  />
                  {/* Online Dot */}
                  {onlineUsers.includes(contact?._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-slate-700"}`}
                  >
                    {contact.fullname}
                  </h3>
                  <p
                    className={`text-xs truncate ${isActive ? "text-blue-100" : "text-slate-500 group-hover:text-slate-600"}`}
                  >
                    Tap to chat
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- CURRENT USER FOOTER --- */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              className="h-10 w-10 rounded-full object-cover border border-slate-200"
              src={user?.profilePicture}
              alt="Me"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-700 truncate">
                {user?.fullname || "My Profile"}
              </span>
              <span className="text-[10px] text-green-600 font-medium uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>

          <button
            onClick={logOut}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <IoLogOutOutline className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
