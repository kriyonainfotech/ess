import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { toast } from 'react-toastify';
const backend_API = import.meta.env.VITE_API_URL;

const EditUser = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [businessCategory, setBusinessCategory] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessDetaile, setBusinessDetaile] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);  // New loading state
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch Categories only once when the component mounts
  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${backend_API}/category/getAllCategory`);
      const sortedCategories = response.data.category.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategory();
    if (location?.state) {
      setName(location.state.name || '');
      setEmail(location.state.email || '');
      setPhone(location.state.phone || '');
      setArea(location.state.address?.area || '');
      setCity(location.state.address?.city || '');
      setState(location.state.address?.state || '');
      setCountry(location.state.address?.country || '');
      setPincode(location.state.address?.pincode || '');
      setBusinessCategory(location.state.businessCategory || []);
      setBusinessName(location.state.businessName || '');
      setBusinessAddress(location.state.businessAddress || '');
      setBusinessDetaile(location.state.businessDetaile || '');
    }
  }, [location]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const selectCategory = (category) => {
    setBusinessCategory(category);
    setIsDropdownOpen(false);
  };

  const fetchLocationDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setArea(postOffice.Name || '');
        setCity(postOffice.District || '');
        setState(postOffice.State || '');
        setCountry(postOffice.Country || '');
        setError('');
      } else {
        setError('Invalid Pincode! Please enter a valid one.');
        resetLocationFields();
      }
    } catch (err) {
      setError('Failed to fetch location details. Try again later.');
      resetLocationFields();
    }
  };

  const resetLocationFields = () => {
    setArea('');
    setCity('');
    setState('');
    setCountry('');
  };

  const handlePincodeChange = (e) => {
    const inputPincode = e.target.value.trim();
    setPincode(inputPincode);
    if (inputPincode.length === 6) {
      fetchLocationDetails(inputPincode);
    } else {
      resetLocationFields();
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAddress = { area, city, state, country, pincode };
    const fullData = { userId: location.state._id, name, email, phone, address: newAddress, businessCategory, businessName, businessAddress, businessDetaile };

    setLoading(true);  // Show loading spinner or disable the button

    try {
      const response = await axios.put(`${backend_API}/auth/UpdateUser`, fullData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        toast(response.data.message)
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      setError(error?.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  return (
    <>
      <AdminHeader />
      <AdminSidebar />
      <div className="bg-gray-200 pt-15 flex items-center mt-24 justify-center">
        <div className="w-[600px] bg-white rounded-lg overflow-hidden shadow-md mt-5 mx-2">
          <div className="py-3 px-6 grid grid-cols-1 gap-6">

            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-semibold text-red-500 pt-3">Edit User</h3>
            </div>
            <form onSubmit={handleSubmit} method='post' className="space-y-4 dark:text-white">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div className="w-full mt-10">
                <label className="block text-sm font-medium">Select Business Categories:</label>
                <div className="mt-3 w-full">
                  <div
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    onClick={toggleDropdown}
                  >
                    {businessCategory.length > 0 ? (
                      <span className="inline-block text-black py-1">{businessCategory}</span>
                    ) : (
                      <span className="py-1">Select a category</span>
                    )}
                  </div>
                  {isDropdownOpen && (
                    <ul className="z-10 border border-gray-300 bg-white w-full mt-2 rounded-md max-h-40 overflow-y-auto">
                      {categories.map((category, i) => (
                        <li
                          key={i}
                          className={`cursor-pointer px-4 py-2 hover:bg-green-200 ${businessCategory === category.categoryName ? 'bg-green-200' : ''}`}
                          onClick={() => selectCategory(category.categoryName)}
                        >
                          {category.categoryName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Business Address</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Business Detaile</label>
                <input
                  type="text"
                  value={businessDetaile}
                  onChange={(e) => setBusinessDetaile(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 rounded-md ${loading ? 'bg-gray-500' : 'bg-red-600'} text-white font-bold`}
                disabled={loading} // Disable button when loading
              >
                {loading ? 'Updating...' : 'Edit User'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUser;
