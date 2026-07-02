import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchWrapper } from '../utils/fetchWrapper.js';
import { FaBell } from 'react-icons/fa';

export default function Notifications() {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetchWrapper(`${apiUrl}/api/notifications`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();

    // Setup Socket
    const newSocket = io(apiUrl || undefined, {
      withCredentials: true,
    });
    
    newSocket.on('connect', () => {
      newSocket.emit('register', currentUser._id);
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await fetchWrapper(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-blue-600 transition-colors mt-2"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-slate-200">
          <div className="p-3 border-b bg-slate-50 font-semibold text-slate-700 flex justify-between items-center">
            <span>Notifications</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) markAsRead(notification._id);
                  }}
                >
                  <p className="text-sm text-slate-800">{notification.content}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
