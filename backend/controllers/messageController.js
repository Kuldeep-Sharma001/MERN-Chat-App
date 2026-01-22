import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

//create message controller
export const createNewMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;
        if (!receiverId || !message || !senderId) {
            return res.status(400).json({
                success: false,
                message: "Something went wrong, try after sometime"
            })
        }
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });
        if (!conversation) {
            conversation = await Conversation.create({ members: [senderId, receiverId] });
        }
        
        const newMessage = new Message({
           sender: senderId,
           receiver: receiverId,
            message
        })

        conversation.messages.push(newMessage);
        console.log("hi");
        await Promise.all([conversation.save(), newMessage.save()]);

        return res.status(200).json({
            success: true,
            message: 'message sent'
        })
    } catch (error) {
        console.log("Something went wrong:", error.message);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, error:' + error.message
        })
    }
}

//get messages
export const getMessages = async (req, res)=>{
    try {
        const senderId = req.user.id;
        const receiverId = req.params.receiverId;

        if (!receiverId || !senderId) {
            res.status(500).json({
                success: fasle,
                message: "Something went wrong during fetching messages"
            })
        }
        const receiver = await User.findById(receiverId);
        let messages = await Conversation.findOne({
          members: { $all: [senderId, receiverId] },
        })
            .populate({
                path: "messages",
                populate:[
                {path: "sender", select: "fullname"},
                { path: "receiver", select: "fullname" }
                ]
          })
            .populate("members","-password");
        
        if (!messages) {
            console.log('not found');
          res.status(200).json({
            success: true,
            message:
                  `No Messages Found
                  Start Conversation`,
            messages:[],
            receiver
          });
        }
        
        else {
            console.log('found')
          res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages: messages.messages.length > 0 ? messages : [],
            receiver,
          });
        }
       

    } catch (error) {
        console.log("Something went wrong, error:", error.message);
        res.status(500).json({
            success: false,
            message: `Internal Server Error!!!
            Error: ${error.message}`
        })
    }
}
