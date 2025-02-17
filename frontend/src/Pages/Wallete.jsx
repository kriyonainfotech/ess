// import React, { memo, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import AdminNavbar from '../admincomponents/AdminNavbar';
// import UserSideBar from '../components/UserSideBar';
// import TotalWallete from '../components/Wallete/TotalWallete';
// import ProfileSidebar from '../components/ProfileSidebar';
// import ReferredBy from '../components/Team/ReferredBy';
// import { UserContext } from '../UserContext';
// import Footer from '../components/Footer';

// const backend_API = import.meta.env.VITE_API_URL;

// const Wallete = () => {
//   const { user } = useContext(UserContext);
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [earningsHistory, setEarningsHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     // Fetch user's wallet balance and earnings history
//     const fetchWalletData = async () => {
//       if (!user?._id) {
//         setError('User is not authenticated');
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(`${backend_API}/referal/getUserWalletBalance/${user._id}`);
//         console.log(response.data, "wallete");

//         setWalletBalance(response.data.walletBalance);
//         // setEarningsHistory(response.data.earningsHistory);
//         setLoading(false);
//       } catch (error) {
//         setError(error?.response?.data?.message || 'Error fetching wallet balance');

//       } finally {
//         setLoading(false);
//       }

//     };

//     fetchWalletData();
//   }, [user?._id]);

//   return (
//     <>
//       {/* Navigation */}
//       <AdminNavbar />
//       <UserSideBar />
//       <ProfileSidebar />

//       {/* Main Section */}
//       <div className="my-32">
//         <section>
//           <div className="container">
//             <div className="row">
//               <div className="wallete text-white">

//                 {/* Wallet Overview */}
//                 <div className="col-12 d-flex flex-wrap p-4 rounded-1 bg-blue align-items-center">
//                   {loading ? (
//                     <div>
//                       <div className="spinner-border text-light" role="status">
//                         <span className="sr-only">Loading...</span>
//                       </div>

//                     </div>
//                   ) : error ? (
//                     <div className="alert alert-danger">{error}</div>
//                   ) : (
//                     <TotalWallete walletBalance={walletBalance} />
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default memo(Wallete);
import React, { memo, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../admincomponents/AdminNavbar';
import UserSideBar from '../components/UserSideBar';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { UserContext } from '../UserContext';
import { toast } from "react-toastify";

const backend_API = import.meta.env.VITE_API_URL;

const Wallete = () => {
  const { user } = useContext(UserContext);
  const [walletBalance, setWalletBalance] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?._id) {
        setError('User is not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backend_API}/referal/getUserWalletBalance/${user._id}`);
        console.log(response.data, 'wallete');
        setWalletBalance(response.data.walletBalance);
        setEarningsHistory(response.data.earningsHistory || []);
      } catch (error) {
        setError(error?.response?.data?.message || 'Error fetching wallet balance');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user?._id]);

  // Handle withdraw logic
  const handleWithdraw = async () => {
    console.log(walletBalance, "walletBalance");
    if (walletBalance < 120) {
      toast.warning("Minimum withdrawal amount is ₹120");
      return;
    }

    try {
      // Add your withdrawal API call here
      toast.info("Withdrawal request submitted");
    } catch (error) {
      console.error("[ERROR] Withdrawal failed:", error);
      toast.error("Failed to process withdrawal");
    }
  };


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchEarnings = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${backend_API}/referal/earnings/${user._id}`,
          { signal: controller.signal }
        );

        if (isMounted && response.status === 200) {
          setEarnings(response.data.earnings);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[ERROR] Failed to fetch earnings:", err);
          if (!axios.isCancel(err)) {
            setError(err.response?.data?.message || "Failed to fetch earnings");
            toast.error("Error loading earnings data.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEarnings();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?._id]);

  return (
    <>
      {/* Navigation */}
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />

      {/* Main Section */}
      <div className="mt-40">
        <div className="container">
          <section className="">
            <div className="row">
              <div className="wallete px-0">

                {/* Wallet Overview */}
                <div className="w-full flex flex-col items-center justify-center p-6 my-5 bg-red-100 rounded-lg shadow-md">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-border text-danger" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="w-full text-center p-3 bg-red-200 text-red-800 rounded-lg">
                      {error}
                    </div>
                  ) : (
                    <>
                      {/* Withdraw Button */}
                      <div className="w-full flex justify-end mb-4">
                        <button
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400"
                          onClick={handleWithdraw}
                          // disabled={walletBalance < 120 || loading}
                          disabled
                        >
                          {loading ? "Loading..." : `Withdraw ₹${walletBalance >= 120 ? walletBalance : 0}`}
                        </button>
                      </div>

                      {/* Wallet Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {/* Wallet Balance Card */}
                        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                          <span className="text-lg font-medium">Total Wallet Balance</span>
                          {loading ? (
                            <div className="animate-spin h-6 w-6 border-t-4 border-blue-500 rounded-full mt-2"></div>
                          ) : (
                            <h3 className="text-3xl font-bold text-blue-600">₹{walletBalance || 0}</h3>
                          )}
                        </div>

                        {/* Total Earnings Card */}
                        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                          <span className="text-lg font-medium">Total Earnings</span>
                          {loading ? (
                            <div className="animate-spin h-6 w-6 border-t-4 border-green-500 rounded-full mt-2"></div>
                          ) : (
                            <h3 className="text-3xl font-bold text-green-600">₹{earnings || 0}</h3>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>

            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default memo(Wallete);
