import Notification from "../models/notification.model.js";

export const sendNotification = async (req, recipientId, type, content, link = "") => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user?.id, // Optional depending on context
      type,
      content,
      link,
    });

    const io = req.io;
    const connectedUsers = req.connectedUsers;
    
    if (io && connectedUsers) {
      const socketId = connectedUsers.get(recipientId.toString());
      if (socketId) {
        io.to(socketId).emit("new_notification", notification);
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification", error);
  }
};
