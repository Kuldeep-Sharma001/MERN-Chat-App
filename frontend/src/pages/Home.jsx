import { useState } from "react";
import Contacts from "../home/Contacts";
import Messages from "../home/Messages";

function Home() {
  const [receiverId, setReceiverId] = useState(null);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
       <div className="w-1/4 min-w-60 max-w-80 h-full shrink-0">
          <Contacts setReceiverId={setReceiverId} receiverId={receiverId} />
       </div>

       <div className="flex-1 h-full">
          <Messages receiverId={receiverId} />
       </div>
    </div>
  )
}

export default Home;
