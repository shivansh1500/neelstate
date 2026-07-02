import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { errorHandler } from "../utils/error.js";
import { sendNotification } from "../utils/sendNotification.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, listingId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return next(errorHandler(400, "Receiver ID and content are required"));
    }

    // Find if a conversation exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content,
      listingId: listingId || null,
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Send notification to the receiver
    await sendNotification(
      req,
      receiverId,
      "message",
      "You have a new message.",
      `/messages`
    );

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username avatar email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: otherUserId } = req.params;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, otherUserId] },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .populate("listingId", "name imageUrls offer discountPrice regularPrice type userRef isSold")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
