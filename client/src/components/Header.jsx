import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Notifications from "./Notifications";

function Header() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  // Sync state with URL manually (e.g. if arriving from a link)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    } else {
      setSearchTerm("");
    }
  }, [location.search]);

  // Debouncing logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentUrlTerm = urlParams.get("searchTerm") || "";

    // Only fire the debounced navigation if the value actually differs from the URL
    if (searchTerm !== currentUrlTerm) {
      const delayDebounceFn = setTimeout(() => {
        if (searchTerm) {
          urlParams.set("searchTerm", searchTerm);
        } else {
          urlParams.delete("searchTerm"); // Remove empty search string
        }
        navigate(`/search?${urlParams.toString()}`);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, navigate]);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        <Link to="/">
          <h1 className="font-extrabold text-lg sm:text-xl flex flex-wrap items-center gap-1">
            <span className="text-blue-600">Neel</span>
            <span className="text-slate-800">State</span>
          </h1>
        </Link>
        <form onSubmit={handleSubmit} className="bg-slate-100 p-2 sm:p-3 rounded-full flex items-center shadow-inner border border-slate-200 transition-all focus-within:shadow-md focus-within:bg-white focus-within:border-blue-300">
          <input
            type="text"
            placeholder="Search properties..."
            className="bg-transparent focus:outline-none w-28 sm:w-64 px-2 text-slate-700 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="pr-2 text-slate-500 hover:text-blue-600 transition-colors">
            <FaSearch />
          </button>
        </form>
        <ul className="flex items-center gap-6">
          <li className="hidden md:inline">
            <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
          </li>
          <li className="hidden md:inline">
            <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
          </li>
          {currentUser && (
            <>
              <li className="hidden sm:inline">
                <Link to="/messages" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Notifications />
              </li>
            </>
          )}
          <li>
            <Link to="/profile" className="flex items-center justify-center">
              {loading ? (
                <div className="w-9 h-9 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : currentUser ? (
                <img
                  className="rounded-full h-9 w-9 object-cover border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
                  src={currentUser.avatar}
                  alt="Profile"
                />
              ) : (
                <span className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">
                  Sign in
                </span>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
