import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Fetch latest 50 notifications
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }
    if (notification.recipient.toString() !== req.user.id) {
      return next(errorHandler(403, 'You can only update your own notifications'));
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};
