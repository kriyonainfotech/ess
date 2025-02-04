// import React, { useContext, useEffect, useState, useMemo } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import AdminNavbar from '../admincomponents/AdminNavbar';
// import UserSideBar from '../components/UserSideBar';
// import SearchResult from '../components/SearchResult';
// import { UserContext } from '../UserContext';
// import ProfileSidebar from '../components/ProfileSidebar';
// import Footer from '../components/Footer';

// const backend_API = import.meta.env.VITE_API_URL;

// const ServiceDetail = () => {
//   const { user } = useContext(UserContext);
//   const token = useMemo(() => JSON.parse(localStorage.getItem('token')), []);
//   const location = useLocation();

//   // State for category, services, and logged-in user
//   const [category, setCategory] = useState(() => localStorage.getItem('selectedCategory') || null);
//   const [service, setService] = useState([]);
//   const [loggedInUser, setLoggedInUser] = useState(() =>
//     user || JSON.parse(localStorage.getItem('loggedInUser')) || null
//   );

//   // Fetch data based on category and city
//   const fetchData = async (cat, loggedInUserCity) => {

//     try {
//       const response = await axios.get(`${backend_API}/auth/getAllUser`, {
//         headers: { 'Content-Type': 'application/json' },
//         withCredentials: true,
//       });

//       const filtereavailable = response.data.user.filter(
//         (user) =>
//           user.businessCategory?.some((category) => category.toLowerCase() === cat?.toLowerCase()) &&
//           user.address?.city?.toLowerCase() === loggedInUserCity?.toLowerCase() &&
//           user._id !== loggedInUser._id &&
//           user.isAdminApproved === true &&
//           user.userstatus === "available"

//       )
//         .sort((a, b) => b.averageRating - a.averageRating); // Sorting in descending order
//       // console.log(filteredData);
//       const filteredunavailable = response.data.user.filter(
//         (user) =>
//           user.businessCategory?.some((category) => category.toLowerCase() === cat?.toLowerCase()) &&
//           user.address?.city?.toLowerCase() === loggedInUserCity?.toLowerCase() &&
//           user._id !== loggedInUser._id &&
//           user.isAdminApproved === true &&
//           user.userstatus === "unavailable"

//       )
//         .sort((a, b) => b.averageRating - a.averageRating); // Sorting in descending order
//       const filteredData = [...filtereavailable, ...filteredunavailable]
//       console.log(filteredData);
//       console.log(filteredData, "filter");

//       setService(filteredData);
//     } catch (error) {
//       console.error('Error fetching data:', error.message || error);
//     }
//   };

//   // Update category state from location or localStorage
//   useEffect(() => {
//     if (location.state) {
//       setCategory(location.state);
//       localStorage.setItem('selectedCategory', location.state);
//     }
//   }, [location.state]);

//   // Fetch data when category and city are available
//   useEffect(() => {
//     if (category && loggedInUser?.address?.city) {
//       fetchData(category, loggedInUser.address.city);
//     }
//   }, [category, loggedInUser?.address?.city]);

//   // Persist logged-in user to localStorage
//   useEffect(() => {
//     if (user) {
//       setLoggedInUser(user);
//       localStorage.setItem('loggedInUser', JSON.stringify(user));
//     }
//   }, [user]);

//   return (
//     <>
//       <AdminNavbar />
//       <UserSideBar />
//       <ProfileSidebar />
//       <section className="my-24">
//         <div className="container">
//           <div className="row">
//             <div className="d-flex">
//               <h3 className="pt-4 px-3 text-capitalize">{location.state}</h3>
//             </div>

//             <div className="col-12 d-flex flex-wrap">
//               {service.length > 0 ? (
//                 service.map((Usersdata, i) => (
//                   <SearchResult key={i} Usersdata={Usersdata} token={token} />
//                 ))
//               ) : (
//                 <h6 className='pt-3  px-3 '>No Provider Found For this Category</h6>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//       <Footer />
//     </>
//   );
// };

// export default ServiceDetail;
// import React, { useContext, useEffect, useState, useMemo } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import AdminNavbar from '../admincomponents/AdminNavbar';
// import UserSideBar from '../components/UserSideBar';
// import SearchResult from '../components/SearchResult';
// import { UserContext } from '../UserContext';
// import ProfileSidebar from '../components/ProfileSidebar';
// import Footer from '../components/Footer';

// const backend_API = import.meta.env.VITE_API_URL;

// const ServiceDetail = () => {
//   const { user } = useContext(UserContext);
//   const token = useMemo(() => JSON.parse(localStorage.getItem('token')), []);
//   const location = useLocation();

//   // State for category, services, and logged-in user
//   const [category, setCategory] = useState(() => localStorage.getItem('selectedCategory') || null);
//   const [service, setService] = useState([]);
//   const [loggedInUser, setLoggedInUser] = useState(() =>
//     user || JSON.parse(localStorage.getItem('loggedInUser')) || null
//   );

//   // Fetch data based on category and city
//   const fetchData = async (cat, loggedInUserCity) => {

//     try {
//       const response = await axios.get(`${backend_API}/auth/getAllUser`, {
//         headers: { 'Content-Type': 'application/json' },
//         withCredentials: true,
//       });

//       const filtereavailable = response.data.user.filter(
//         (user) =>
//           user.businessCategory?.some((category) => category.toLowerCase() === cat?.toLowerCase()) &&
//           user.address?.city?.toLowerCase() === loggedInUserCity?.toLowerCase() &&
//           user._id !== loggedInUser._id &&
//           user.isAdminApproved === true &&
//           user.userstatus === "available"

//       )
//         .sort((a, b) => b.averageRating - a.averageRating);
//       const filteredunavailable = response.data.user.filter(
//         (user) =>
//           user.businessCategory?.some((category) => category.toLowerCase() === cat?.toLowerCase()) &&
//           user.address?.city?.toLowerCase() === loggedInUserCity?.toLowerCase() &&
//           user._id !== loggedInUser._id &&
//           user.isAdminApproved === true &&
//           user.userstatus === "unavailable"

//       )
//         .sort((a, b) => b.averageRating - a.averageRating); // Sorting in descending order
//       const filteredData = [...filtereavailable, ...filteredunavailable]
//       console.log(filteredData);
//       console.log(filteredData, "filter");

//       setService(filteredData);
//     } catch (error) {
//       console.error('Error fetching data:', error.message || error);
//     }
//   };

//   // Update category state from location or localStorage
//   useEffect(() => {
//     if (location.state) {
//       setCategory(location.state);
//       localStorage.setItem('selectedCategory', location.state);
//     }
//   }, [location.state]);

//   // Fetch data when category and city are available
//   useEffect(() => {
//     if (category && loggedInUser?.address?.city) {
//       fetchData(category, loggedInUser.address.city);
//     }
//   }, [category, loggedInUser?.address?.city]);

//   // Persist logged-in user to localStorage
//   useEffect(() => {
//     if (user) {
//       setLoggedInUser(user);
//       localStorage.setItem('loggedInUser', JSON.stringify(user));
//     }
//   }, [user]);

//   return (
//     <>
//       <AdminNavbar />
//       <UserSideBar />
//       <ProfileSidebar />
//       <section className="my-24">
//         <div className="container">
//           <div className="row">
//             <div className="d-flex">
//               <h3 className="pt-4 px-3 text-capitalize">{location.state}</h3>
//             </div>

//             <div className="col-12 d-flex flex-wrap">
//               {service.length > 0 ? (
//                 service.map((Usersdata, i) => (
//                   <SearchResult key={i} Usersdata={Usersdata} token={token} />
//                 ))
//               ) : (
//                 <h6 className='pt-3  px-3 '>No Provider Found For this Category</h6>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//       <Footer />
//     </>
//   );
// };

// export default ServiceDetail;
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../admincomponents/AdminNavbar';
import UserSideBar from '../components/UserSideBar';
import SearchResult from '../components/SearchResult';
import { UserContext } from '../UserContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { TailSpin } from 'react-loader-spinner';

const backend_API = import.meta.env.VITE_API_URL;

const ServiceDetail = () => {
  const { user } = useContext(UserContext);
  const token = useMemo(() => JSON.parse(localStorage.getItem('token')), []);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // Add this line
  // State for category, services, and logged-in user
  const [category, setCategory] = useState(() => localStorage.getItem('selectedCategory') || null);
  const [service, setService] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(() =>
    user || JSON.parse(localStorage.getItem('loggedInUser')) || null
  );
  const [apiMessage, setApiMessage] = useState("");

  const fetchData = async (cat, loggedInUserCity) => {
    setIsLoading(true); // ✅ Start loading before API call

    try {
      const response = await axios.post(
        `${backend_API}/auth/getUsersByBCategory`,
        {
          category: cat,
          city: loggedInUserCity,
          status: 'available',
          isAdminApproved: true,
          sortByRating: 'desc',
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      console.log(response, 'categoies')
      if (response.data.success) {
        setService(response.data.users);
        setApiMessage(response.data.message); // ✅ Store API message
      } else {
        console.error("Error fetching data:", response.data.message);
        setService([]);
        setApiMessage(response.data.message); // ✅ Store API error message
      }
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
      setService([]);
      setApiMessage("Failed to fetch providers. Please try again."); // ✅ Default error message
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update category state from location or localStorage
  useEffect(() => {
    if (location.state) {
      setCategory(location.state);
      localStorage.setItem('selectedCategory', location.state);
    }
  }, [location.state]);

  // Fetch data when category and city are available
  useEffect(() => {
    if (category && loggedInUser?.address?.city) {
      fetchData(category, loggedInUser.address.city);
    }
  }, [category, loggedInUser?.address?.city]);

  // Persist logged-in user to localStorage
  useEffect(() => {
    if (user) {
      setLoggedInUser(user);
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
  }, [user]);

  return (
    <>
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />
      <section className="mt-40">
        <div className="container">
          <div className="row">
            <div className="d-flex">
              <h3 className="pt-4 px-3 text-capitalize">{location.state}</h3>
            </div>

            <div className="col-12 d-flex flex-wrap">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh", width: "100vw" }}>
                  <TailSpin color="#00BFFF" height={50} width={50} />
                </div>
              ) : (
                service.length > 0 ? (
                  service.map((Usersdata, i) => <SearchResult key={i} Usersdata={Usersdata} token={token} />)
                ) : (
                  <h6 className="pt-3 px-3">{apiMessage}</h6> // ✅ Display API response message dynamically
                )
              )}
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ServiceDetail;
