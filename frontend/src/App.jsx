import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setOnlineUsers } from "./app/slice/socket";
import { getSocket, initSocket } from "./components/socket";

function App() {
  const token = useSelector((state) => state.auth.token);
  const userData = useSelector(state => state.user.userData);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userData) return;
    initSocket(userData?._id);
    const socket = getSocket();
    socket.on('connect', () => {
      console.log('User connected ', socket.id);
    })
    socket.on("send-online-users", (data) => {
      dispatch(setOnlineUsers(data));
    });
    return (() => {
       socket.on("send-online-users", (data) => {
         dispatch(setOnlineUsers(data));
       });
      socket.off("send-online-users");
      socket.disconnect();
    })

  },[token])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Signin />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
