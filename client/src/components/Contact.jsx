import { fetchWrapper } from '../utils/fetchWrapper.js';
import { useEffect, useState } from "react";
import { FaEnvelope, FaCopy, FaCheck, FaUser, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Contact({ listing, isExpanded, onToggle }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Get API URL from environment variable
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const userUrl = apiUrl ? `${apiUrl}/api/user/${listing.userRef}` : `/api/user/${listing.userRef}`;
        
        const res = await fetchWrapper(userUrl);
        const data = await res.json();
        
        if (res.ok) {
          setLandlord(data);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const handleSendEmail = () => {
    const subject = `Regarding ${listing.name}`;
    const body = message || `Hi ${landlord.username}, I'm interested in your property "${listing.name}".`;
    const mailtoLink = `mailto:${landlord.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      window.open(mailtoLink);
    } catch (error) {
      console.log('Failed to open email client:', error);
      handleCopyEmail();
    }
  };

  const handleSendMessageInternal = async () => {
    try {
      if (!message.trim()) return;
      setSendingMessage(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetchWrapper(`${apiUrl}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: landlord._id,
          content: message,
          listingId: listing._id
        }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setMessageSuccess(true);
        setMessage("");
      }
    } catch (error) {
      console.log('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(landlord.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Failed to copy email:', error);
    }
  };

  const handleCopyContactInfo = async () => {
    const contactInfo = `Landlord: ${landlord.username}\nEmail: ${landlord.email}\nProperty: ${listing.name}`;
    try {
      await navigator.clipboard.writeText(contactInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Failed to copy contact info:', error);
    }
  };

  return (
    <>
      {landlord && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
          {/* Collapsed State - Contact Button */}
          {!isExpanded && (
            <button
              onClick={onToggle}
              className="w-full bg-slate-700 text-white p-4 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FaUser />
              Contact Landlord
              <FaChevronDown className="ml-auto" />
            </button>
          )}

          {/* Expanded State - Full Contact Form */}
          {isExpanded && (
            <div className="p-6">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-600 text-xl" />
                  <h3 className="text-xl font-bold text-gray-800">Contact Landlord</h3>
                </div>
                <button
                  onClick={onToggle}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">
                Get in touch about <span className="font-semibold">{listing.name}</span>
              </p>

              {/* Landlord Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{landlord.username}</h4>
                    <p className="text-sm text-gray-600">Property Owner</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <FaEnvelope className="text-gray-500" />
                  <span className="text-sm">{landlord.email}</span>
                </div>
              </div>

              {/* Message Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message (Optional)
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={message}
                  onChange={onChange}
                  placeholder="Write a message to include in your email..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {messageSuccess ? (
                  <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                    Message sent successfully! You can view it in your Messages page.
                  </div>
                ) : (
                  <button
                    onClick={handleSendMessageInternal}
                    disabled={sendingMessage || !message.trim()}
                    className="w-full bg-slate-700 text-white py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    <FaEnvelope />
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyEmail}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copied!' : 'Copy Email'}
                  </button>
                  
                  <button
                    onClick={handleCopyContactInfo}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
              </div>

              {/* Helpful Tip */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  💡 If email doesn't open, use the copy buttons to get contact information
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
