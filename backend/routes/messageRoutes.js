import express from 'express';
import { createNewMessage, getMessages } from '../controllers/messageController.js';
import upload from '../middlewares/multer.js';

const messageRouter = express.Router();

messageRouter.get("/get-messages/:receiverId", getMessages);
messageRouter.post('/create-new-message',upload.array('files', 5), createNewMessage);

export default messageRouter;