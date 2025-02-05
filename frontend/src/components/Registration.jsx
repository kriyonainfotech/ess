import React, { useContext, useEffect, useState } from 'react'
import logo from "../../public/ees-logo.png"
import { Link, Navigate, useNavigate } from 'react-router-dom';
import "react-country-state-city/dist/react-country-state-city.css";
import { UserContext } from '../UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Font Awesome icons for show/hide

function Registration() {
  const { user } = useContext(UserContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [phone, setPhone] = useState('');
  // for address
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [address, setAddress] = useState([])

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({});
  const [referralCode, setReferralCode] = useState(null); // For referral code
  const [showPassword, setShowPassword] = useState(false);

  const isAuthenticated = localStorage.getItem("token");
  const navigete = useNavigate();
  if (user) {
    // Redirect to a protected page if already logged in
    return <Navigate to="/" />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    // Extract referral code from URL
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("referralCode");
    if (code) setReferralCode(code);

    // Fetch categories
  }, []);
  const validateInputs = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = 'Name is required.';
    }

    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!email.endsWith('@gmail.com')) {
      newErrors.email = 'Please use your @gmail.com.com email.';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long.';
    }

    if (password !== confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match.';
    }

    if (!area) {
      newErrors.area = 'Area is required.';
    }
    if (!city) {
      newErrors.city = 'City is required.';
    }
    if (!state) {
      newErrors.state = 'State is required.';
    }
    if (!country) {
      newErrors.country = 'Country is required.';
    }
    if (!pincode) {
      newErrors.pincode = 'Pincode is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const fetchLocationDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      console.log(data);


      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0]; // Get the first result
        setArea(postOffice.Name || ''); // Set Area (e.g., Kamrej)
        setCity(postOffice.District || ''); // Set City (e.g., Surat)
        setState(postOffice.State || ''); // Set State (e.g., Gujarat)
        setCountry(postOffice.Country || ''); // Set Country (e.g., India)
        setError('');
      } else {
        setError('Invalid Pincode! Please enter a valid one.');
        setArea('');
        setCity('');
        setState('');
        setCountry('');
      }
    } catch (err) {
      setError('Failed to fetch location details. Try again later.');
    }
  };

  // Handle pincode input change
  const handlePincodeChange = (e) => {
    const inputPincode = e.target.value.trim();
    setPincode(inputPincode);

    if (inputPincode.length === 6) {
      fetchLocationDetails(inputPincode);
    } else {
      setArea('');
      setCity('');
      setState('');
      setCountry('');
      setError('');
    }
  };

  const handleSubmits = async (e) => {
    setLoading(true)
    e.preventDefault();


    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    let newadd = {
      area,
      city,
      state,
      country,
      pincode
    }
    setAddress(newadd)
    console.log(address, "address");

    navigete("/registernext", { state: { name: name, email: email, password: password, confirmpassword: password, phone: phone, address: newadd, referralCode } })

  };


  return (
    <>

      <div className="container py-24">
        <div className="row mx-auto ">
          <div className="registerpage shadow bg-white p-0">
            <div className="col-12 d-flex flex-wrap">

              <div className="col-12 col-lg-6 p-2 d-flex justify-content-center align-items-center">
                <div className='d-flex justify-content-center align-items-center'>
                  <div className="">
                    <div className='mb-12 d-flex justify-content-center align-items-center'>
                      <img src={logo} width={100} />
                    </div>
                    {/* <button className="w-full px-2 max-w-xs font-bold shadow-sm rounded-lg py-3 bg-green-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline">
                      <div className="bg-white p-2 rounded-full">
                        <svg className="w-4" viewBox="0 0 533.5 544.3">
                          <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
                          <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
                          <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
                          <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
                        </svg>
                      </div>
                      <span className="ml-4">
                        Sign In with Google
                      </span>
                    </button> */}
                  </div>
                </div>

              </div>
              <div className="col-12 col-lg-6 ">
                <div className=' bg-green-100 text-center hidden lg:flex  flex justify-center align-center'>
                  <div className="m-16 bg-cover bg-center bg-no-repeat " >
                    <img src="https://readymadeui.com/signin-image.webp" width={300} alt="" />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className=" border-b text-center">
              <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">

              </div>
            </div> */}

            <form action="" onSubmit={handleSubmits} className='py-5'>
              <div className='px-16'>
                {
                  referralCode ? (
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" placeholder="Name" />
                    // {errors.name && <span className="error text-orange text-orange text-sm">{errors.name}</span>}

                  ) : (
                    <></>
                  )
                }

              </div>
              <div className="col-12 d-flex flex-wrap justify-content-center p-5">

                <div className="col-12 col-lg-6 p-1">
                  <div className='px-2'>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" placeholder="Name" />
                    {errors.name && <span className="error text-orange text-sm">{errors.name}</span>}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3" placeholder="Email" />
                    {errors.email ? (<span className="error text-orange text-sm">{errors.email}</span>) : (<span className='  text-gray text-sm'>Email must end with @gmail.com.</span>)}
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-11"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>{errors.password ? (<span className="error text-orange text-sm">{errors.password}</span>) : (<span className='  text-gray text-sm'>Password must be at least 4 characters.</span>)}
                    <input
                      value={confirmpassword}
                      onChange={(e) => setConfirmpassword(e.target.value)}
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3" type="password" placeholder="Confirm Password" />
                    {errors.confirmpassword && <span className="error text-orange text-sm">{errors.confirmPassword}</span>}
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className='px-2 w-full'>
                    <div className='col-12 p-1'>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2 " type="text" placeholder="Phone" />
                      {errors.phone ? (<span className="error text-orange text-sm">{errors.phone}</span>) : (<span className=' text-gray text-sm'>Phone number must be at least 10 digits.</span>)}
                    </div>
                    <div className="col-12 d-flex flex-wrap justify-content-between">
                      <div className="col-12 col-lg-6 p-1 ">
                        <input
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" type="text" placeholder="Area" />
                        {errors.area && <span className="error text-orange text-orange text-sm">{errors.area}</span>}
                      </div>
                      <div className="col-12 col-lg-6 p-1">
                        <input

                          value={pincode}
                          onChange={handlePincodeChange}
                          maxLength="6"
                          // onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" type="text" placeholder="Pincode" />
                        {errors.pincode && <span className="error text-orange text-orange text-sm">{errors.pincode}</span>}
                      </div>
                      <div className="col-12 col-lg-6 p-1 ">
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" type="text" placeholder="City" />
                        {errors.city && <span className="error text-orange text-orange text-sm">{errors.city}</span>}
                      </div>
                      <div className="col-12 col-lg-6 p-1">
                        <input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" type="text" placeholder="State" />

                        {errors.state && <span className="error text-orange text-orange text-sm">{errors.state}</span>}
                      </div>
                      <div className="col-12 col-lg-6 p-1 ">
                        <input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2" type="text" placeholder="Country" />
                        {errors.country && <span className="error text-orange text-orange text-sm">{errors.country}</span>}
                      </div>

                    </div>

                  </div>
                </div>


              </div>

              <div className='d-flex justify-content-center'>
                <button type='submit' className="mt-3 tracking-wide font-semibold bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                  <svg className="w-6 h-6 -ml-1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy={7} r={4} />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-4">
                    Sign Up Next
                  </span>
                </button>
              </div>
              <p className="mt-4 text-sm text-center text-gray-600">
                Allready have an account? <Link to={'/login'} className="text-success text-bold hover:underline">login </Link>
              </p>
            </form>

          </div>

        </div>
      </div>
    </>
  )
}

export default Registration