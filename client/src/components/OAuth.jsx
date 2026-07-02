import { fetchWrapper } from '../utils/fetchWrapper.js';
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogle = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
  };

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const googleAuthUrl = apiUrl
        ? `${apiUrl}/api/auth/google`
        : "/api/auth/google";

      // Securely send the raw cryptographically signed token to our backend
      const res = await fetchWrapper(googleAuthUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      
      if (data.success === false) {
        console.log("Could not sign in with Google", data.message);
        setIsLoading(false);
        return;
      }
      
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      console.log("Could not sign in with Google", error);
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!window.google) return;
    setIsLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment()
      ) {
        // Fallback: show Google's official UI if popup was blocked
        setShowFallback(true);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    if (showFallback && window.google && buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 400, // Approximate width, renderButton doesn't accept "100%" cleanly sometimes, but it respects parent
      });
    }
  }, [showFallback]);

  return (
    <>
      {!showFallback ? (
        <button
          onClick={handleGoogleClick}
          disabled={isLoading}
          type="button"
          className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 w-full"
        >
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>
      ) : (
        <div className="w-full flex justify-center h-[52px]" ref={buttonRef}></div>
      )}
    </>
  );
}
