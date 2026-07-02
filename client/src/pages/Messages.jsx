import { fetchWrapper } from '../utils/fetchWrapper.js';
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Messages() {
  const { currentUser } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await fetchWrapper(`${apiUrl}/api/messages/conversations`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success === false) {
          setError(data.message);
        } else {
          setConversations(data);
        }
      } catch (err) {
        setError("Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const otherUser = selectedConversation.participants.find(
            (p) => p._id !== currentUser._id
          );
          const res = await fetchWrapper(`${apiUrl}/api/messages/${otherUser._id}`, {
            credentials: "include",
          });
          const data = await res.json();
          if (data.success === false) {
            setError(data.message);
          } else {
            setMessages(data);
          }
        } catch (err) {
          setError("Failed to load messages.");
        }
      };
      fetchMessages();
      // Poll every 5 seconds for new messages
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, currentUser._id, apiUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAcceptRequest = async (listingId, buyerId) => {
    try {
      const res = await fetchWrapper(`${apiUrl}/api/listing/accept-buy/${listingId}/${buyerId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success !== false) {
        // Update local messages state to show listing as sold
        setMessages((prev) => 
          prev.map((msg) => 
            msg.listingId && msg.listingId._id === listingId 
              ? { ...msg, listingId: { ...msg.listingId, isSold: true } }
              : msg
          )
        );
      }
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const otherUser = selectedConversation.participants.find(
        (p) => p._id !== currentUser._id
      );
      const res = await fetchWrapper(`${apiUrl}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: otherUser._id,
          content: newMessage,
        }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setMessages([...messages, data]);
        setNewMessage("");
        // Update conversation last message in local state optionally
      }
    } catch (err) {
      setError("Failed to send message.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 flex flex-col md:flex-row gap-4 h-[calc(100vh-100px)]">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        {loading && <p>Loading conversations...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-gray-500">No conversations yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {conversations.map((conv) => {
            const otherUser = conv.participants.find(
              (p) => p._id !== currentUser._id
            );
            return (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-slate-100 ${
                  selectedConversation?._id === conv._id ? "bg-slate-200" : "bg-slate-50"
                }`}
              >
                <img
                  src={otherUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-slate-800">
                    {otherUser?.username || "Unknown User"}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {conv.lastMessage?.content || "No messages yet."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-2/3 bg-white p-4 rounded-lg shadow flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 border-b pb-3 mb-3">
              <h2 className="text-xl font-semibold">
                {
                  selectedConversation.participants.find(
                    (p) => p._id !== currentUser._id
                  )?.username
                }
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-2">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === currentUser._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.senderId === currentUser._id
                        ? "bg-slate-700 text-white rounded-br-none"
                        : "bg-slate-200 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {msg.listingId && (
                      <>
                        <Link to={`/listing/${msg.listingId._id}`} className="block mb-2 border rounded-md p-2 hover:opacity-90 bg-white text-slate-800 shadow-sm transition-opacity">
                          <div className="flex gap-3 items-center">
                            <img src={msg.listingId.imageUrls?.[0] || "https://via.placeholder.com/150"} className="w-16 h-16 object-cover rounded" alt="Property" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm truncate w-32 sm:w-48">{msg.listingId.name}</span>
                              <span className="text-xs text-green-700 font-bold">
                                ₹{msg.listingId.offer ? msg.listingId.discountPrice?.toLocaleString("en-IN") : msg.listingId.regularPrice?.toLocaleString("en-IN")}
                                {msg.listingId.type === 'rent' ? ' / month' : ''}
                              </span>
                            </div>
                          </div>
                        </Link>
                        {currentUser._id === msg.listingId.userRef && !msg.listingId.isSold && msg.senderId !== currentUser._id && (
                          <button
                            onClick={() => handleAcceptRequest(msg.listingId._id, msg.senderId)}
                            className="w-full mb-2 bg-green-700 text-white py-1 rounded text-sm hover:bg-green-800 transition-colors font-semibold"
                          >
                            Accept Request
                          </button>
                        )}
                        {msg.listingId.isSold && (
                          <div className="w-full mb-2 bg-gray-300 text-gray-800 py-1 rounded text-sm text-center font-semibold">
                            Sold
                          </div>
                        )}
                      </>
                    )}
                    <p>{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:opacity-95 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
