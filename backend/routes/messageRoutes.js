import express from 'express';
import { createNewMessage, getMessages } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get("/get-messages/:receiverId", getMessages);
messageRouter.post('/create-new-message', createNewMessage);
// messageRouter.get("/get:receiverId", getMessages);
export default messageRouter;