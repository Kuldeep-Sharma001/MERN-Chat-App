import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

//create message controller
export const createNewMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    const uploadedFiles = req.files || [];
   
    if (!receiverId || (!message && uploadedFiles.length === 0) || !senderId) {
      return res.status(400).json({
        success: false,
        message: "Receiver, message, or files missing.",
      });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    const filePaths = uploadedFiles.map((file) =>
      file.path.replace(/\\/g, "/"),
    );

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      files: filePaths,
    });

    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", newMessage);
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage
    });
  } catch (error) {
    console.error("Something went wrong:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    if (!receiverId || !senderId) {
      return res.status(400).json({
        success: false, // Fixed typo 'fasle'
        message: "Sender or Receiver ID missing",
      });
    }

    const receiver = await User.findById(receiverId).select("-password");

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    })
      .populate({
        path: "messages",
        populate: [
          { path: "sender", select: "fullname profilePicture" }, 
          { path: "receiver", select: "fullname" },
        ],
      })
      .populate("members", "-password");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: "Start a new conversation",
        messages: [],
        receiver,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      messages: conversation.messages,
      receiver,
    });
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};