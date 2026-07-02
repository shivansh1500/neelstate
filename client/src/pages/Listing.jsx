import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Contact from "../components/Contact";
import Map from "../components/Map";

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Get API URL from environment variable
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const listingUrl = apiUrl ? `${apiUrl}/api/listing/get/${params.listingId}` : `/api/listing/get/${params.listingId}`;
        
        const res = await fetch(listingUrl);
        const data = await res.json();
        
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  const handleBuy = async () => {
    try {
      setBuying(true);
      setBuyError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetchWrapper(`${apiUrl}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: listing.userRef,
          content: `Hi, I am interested in ${listing.type === 'rent' ? 'renting' : 'buying'} this property.`,
          listingId: listing._id
        })
      });
      const data = await res.json();
      if (data.success === false) {
        setBuyError(data.message);
        setBuying(false);
        return;
      }
      setBuying(false);
      navigate('/messages');
    } catch (error) {
      setBuyError("Failed to process transaction.");
      setBuying(false);
    }
  };

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ₹{" "}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-IN")
                : listing.regularPrice.toLocaleString("en-IN")}
              {listing.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ₹{+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
              {listing.isSold && (
                <p className="bg-gray-900 w-full max-w-[200px] text-white text-center p-1 rounded-md flex items-center justify-center gap-1">
                  <FaCheckCircle />
                  Sold
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {(listing.bedrooms || 0) > 1
                  ? `${listing.bedrooms || 0} beds `
                  : `${listing.bedrooms || 0} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {(listing.bathrooms || 0) > 1
                  ? `${listing.bathrooms || 0} baths `
                  : `${listing.bathrooms || 0} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
            
            {currentUser && listing.userRef !== currentUser._id && !listing.isSold && (
              <div className="flex flex-col gap-2">
                {listing.purchaseRequests?.includes(currentUser._id) ? (
                  <button
                    disabled
                    className="bg-yellow-600 text-white rounded-lg uppercase p-3 opacity-80"
                  >
                    Request Pending
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="bg-green-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
                  >
                    {buying ? "Processing..." : listing.type === "rent" ? "Request to Rent" : "Request to Buy"}
                  </button>
                )}
                {buyError && <p className="text-red-500 text-sm">{buyError}</p>}
                
                <button
                  onClick={() => setContactExpanded(!contactExpanded)}
                  className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
                >
                  {contactExpanded ? 'Hide Contact' : 'Contact Seller'}
                </button>
              </div>
            )}
            
            {currentUser && listing.userRef !== currentUser._id && listing.isSold && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600 text-center">
                  This property has been sold.
                </p>
              </div>
            )}
            
            {currentUser && listing.userRef === currentUser._id && listing.isSold && (
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-green-800 text-center font-semibold">
                  Congratulations! This property has been sold.
                </p>
              </div>
            )}
            
            {!currentUser && !listing.isSold && (
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-blue-800 text-center">
                  Please sign in to purchase this property.
                </p>
              </div>
            )}
            
            {contactExpanded && (
              <Contact 
                listing={listing} 
                isExpanded={contactExpanded}
                onToggle={() => setContactExpanded(!contactExpanded)}
              />
            )}
            
            {listing.latitude && listing.longitude && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <Map 
                  latitude={listing.latitude} 
                  longitude={listing.longitude} 
                  address={listing.address}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      
    </main>
  );
}
