import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    console.log(req.body.message)
    const { id: receiverId } = req.params; //jisko msg bhejna hai uski id hum request se nikal rahe
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    //if no conversation between two users then create it
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }
    //storing the message in our message model
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);//conversation me messages naam ka array hai usme hum newMessage ki _id push kar rahe hain
    }
    // await conversation.save()
    // await newMessage.save();
    await Promise.all([conversation.save(), newMessage.save()]); // run parallel
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  }
   catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
 

//now to fetch msgs from the database
export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;//receiver
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({ 
      //This query condition uses the "all" operator to ensure that both IDs are present in the members array of the conversation.
      members:{$all: [senderId,chatUser] },}).populate("messages");
    if (!conversation) {
      return res.status(201).json([]);
    }
    const messages = conversation.messages;
    res.status(201).json(messages);
  } 
  catch (error) {
    console.log("Error in getMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
