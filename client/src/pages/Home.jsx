import { fetchWrapper } from '../utils/fetchWrapper.js';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Get API URL from environment variable
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        setLoading(true);
        const offerUrl = apiUrl ? `${apiUrl}/api/listing/get?offer=true&limit=4` : '/api/listing/get?offer=true&limit=4';
        const res = await fetchWrapper(offerUrl);
        const data = await res.json();
        setOfferListings(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    const fetchRentListings = async () => {
      try {
        const rentUrl = apiUrl ? `${apiUrl}/api/listing/get?type=rent&limit=4` : '/api/listing/get?type=rent&limit=4';
        const res = await fetchWrapper(rentUrl);
        const data = await res.json();
        setRentListings(data);
      } catch (error) {
        setError(true);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const saleUrl = apiUrl ? `${apiUrl}/api/listing/get?type=sale&limit=4` : '/api/listing/get?type=sale&limit=4';
        const res = await fetchWrapper(saleUrl);
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        setError(true);
      }
    };

    fetchOfferListings();
    fetchRentListings();
    fetchSaleListings();
  }, [apiUrl]);

  if (loading) {
    return <p className="text-center my-7 text-2xl">Loading...</p>;
  }

  if (error) {
    return <p className="text-center my-7 text-2xl">Something went wrong!</p>;
  }

  return (
    <div>
      {/* top */}
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-slate-500">perfect</span>
          <br />
          place with ease
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          NeelState will help you find your home fast, easy and comfortable.
          <br />
          Our expert support are always available.
        </div>
        <Link
          to={"/search"}
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
        >
          Let's get started...
        </Link>
      </div>

      {/* listing results for offer, sale and rent */}

      {offerListings && offerListings.length > 0 && (
        <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-600">Recent offers</h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?offer=true"}
            >
              Show more offers
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {offerListings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {rentListings && rentListings.length > 0 && (
        <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-600">Recent places for rent</h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?type=rent"}
            >
              Show more places for rent
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rentListings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {saleListings && saleListings.length > 0 && (
        <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
            <Link
              className="text-sm text-blue-800 hover:underline"
              to={"/search?type=sale"}
            >
              Show more places for sale
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {saleListings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
