import { fetchWrapper } from '../utils/fetchWrapper.js';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData(
      {
        ...formData,
        [e.target.id]: e.target.value,
      }
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); //use to prevent refresh of page
    try { 
      setLoading(true);
      setError(null);
      
      // Use the full API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const signupUrl = apiUrl ? `${apiUrl}/api/auth/signup` : '/api/auth/signup';
      
      const res = await fetchWrapper(signupUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
          },
          credentials: 'include',
          body:JSON.stringify(formData),
        }
      );
      
      // Check if response is ok before parsing JSON
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Sign up failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      // Try to parse JSON response
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setError('Invalid response from server');
        setLoading(false);
        return;
      }
      
      console.log(data);
      if (data.success === false) {
        setError(data.message || 'Sign up failed');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      navigate('/sign-in');
    } catch(error){
      console.error('Sign up error:', error);
      setError(error.message || 'Something went wrong');
      setLoading(false);
    }
  }
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading?'Loading...':'Sign Up'}
        </button>
      <OAuth/>
      </form>
      <div className=" flex gap-2 mt-5">
              <p>Have an account ?</p>
              <Link to={"/sign-in"}>
                  <span className='text-blue-700'>Sign In</span>
              </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}

export default SignUp;