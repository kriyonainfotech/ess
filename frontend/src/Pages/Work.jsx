// import React, { useEffect, useState, useCallback } from 'react';
// import AdminNavbar from '../admincomponents/AdminNavbar';
// import UserSideBar from '../components/UserSideBar';
// import Recievedrequest from '../components/Recievedrequest';
// import Senedrequest from '../components/Senedrequest';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import ProfileSidebar from '../components/ProfileSidebar';
// import Footer from '../components/Footer';

// const backend_API = import.meta.env.VITE_API_URL;

// const Work = () => {
//   const token = JSON.parse(localStorage.getItem('token'));
//   const [recievedRequest, setRecievedRequest] = useState([]);
//   const [sendedRequest, setSendedRequest] = useState([]);
//   const [currentRequest, setCurrentRequest] = useState('Sended Request'); // Default view
//   const [isReceiverAvailable, setIsReceiverAvailable] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const requests = [
//     { id: 1, name: 'Sended Request' },
//     { id: 2, name: 'Received Request' },
//   ];

//   // Fetch requests
//   const fetchUserRequests = useCallback(async () => {

//     try {
//       const response = await axios.get(`${backend_API}/request/getUserRequests`, {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         const { receivedRequests, sendedRequests } = response.data;

//         // Filter the received and sent requests based on the date
//         // Sort receivedRequests by date (descending: most recent first)
//         const sortedReceivedRequests = (receivedRequests || []).sort((a, b) => {
//           return new Date(b.date) - new Date(a.date); // Descending order
//         });

//         // Sort sendedRequests by date (descending: most recent first)
//         const sortedSendedRequests = (sendedRequests || []).sort((a, b) => {
//           return new Date(b.date) - new Date(a.date); // Descending order
//         });

//         // Update the state with sorted requests
//         setRecievedRequest(sortedReceivedRequests);
//         setSendedRequest(sortedSendedRequests);
//       } else {
//         console.error('Failed to fetch requests:', response.data.message);
//         toast(response?.data?.message)
//       }
//     } catch (error) {
//       console.error('Error fetching user requests:', error);
//       toast(error?.response?.data?.message)
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchUserRequests();
//   }, [fetchUserRequests]);

//   return (
//     <>
//       {/* Admin Navbar and Sidebar */}
//       <AdminNavbar />
//       <UserSideBar />
//       <ProfileSidebar />

//       <div className="my-32">
//         {/* Request Tabs */}
//         <section className=''>
//           <div className="container">
//             <div className="row">
//               <div className="col-12 d-flex gap-3">
//                 {requests.map((req) => (
//                   <div key={req.id} className="receivReqBtn">
//                     <Link
//                       className={`btn rounded-0 text-white ${currentRequest === req.name ? 'btn-success' : 'bg-green-100'}`}
//                       onClick={() => setCurrentRequest(req.name)}
//                     >
//                       {req.name}
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Request Content */}
//         <div className="mt-4">
//           {currentRequest === 'Received Request' ? (
//             <Recievedrequest
//               recievedRequest={recievedRequest}
//               setRecievedRequest={setRecievedRequest}
//             />
//           ) : (
//             <Senedrequest
//               sendedRequest={sendedRequest}
//               setSendedRequest={setSendedRequest}
//               isReceiverAvailable={isReceiverAvailable}
//             />
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default Work;
import React, { useEffect, useState, useCallback } from "react";
import AdminNavbar from "../admincomponents/AdminNavbar";
import UserSideBar from "../components/UserSideBar";
import Recievedrequest from "../components/Recievedrequest";
import Senedrequest from "../components/Senedrequest";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileSidebar from "../components/ProfileSidebar";
import Footer from "../components/Footer";
import { TailSpin } from "react-loader-spinner"; // Loading spinner
import toast from "react-hot-toast"; // Ensure toast is imported

const backend_API = import.meta.env.VITE_API_URL;

const Work = () => {
  const token = JSON.parse(localStorage.getItem("token")) || null; // Avoid errors if token is null
  const [recievedRequest, setRecievedRequest] = useState([]);
  const [sendedRequest, setSendedRequest] = useState([]);
  const [currentRequest, setCurrentRequest] = useState("Sended Request");
  const [isReceiverAvailable, setIsReceiverAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const requests = [
    { id: 1, name: "Sended Request" },
    { id: 2, name: "Received Request" },
  ];

  // Fetch requests
  const fetchUserRequests = useCallback(async () => {
    if (!token) {
      console.warn("⚠️ No authentication token found.");
      toast.error("Authentication required!");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${backend_API}/request/getUserRequests`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[INFO] API Response:", response);

      if (response.status === 200 && response.data) {
        const { receivedRequests = [], sendedRequests = [] } = response.data;

        // Sort requests by date (if `date` field exists)
        const sortedReceivedRequests = receivedRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedSendedRequests = sendedRequests.sort((a, b) => new Date(b.date) - new Date(a.date));

        setRecievedRequest(sortedReceivedRequests);
        setSendedRequest(sortedSendedRequests);
      } else {
        console.error("Failed to fetch requests:", response.data?.message);
        toast.error(response?.data?.message || "Error fetching requests");
      }
    } catch (error) {
      console.error("Error fetching user requests:", error);
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      setLoading(false); // Ensure loading state is updated
    }
  }, [token]);

  useEffect(() => {
    fetchUserRequests();
  }, [fetchUserRequests]);

  return (
    <>
      {/* Admin Navbar and Sidebar */}
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />

      <div className="my-32">
        {/* Request Tabs */}
        <section>
          <div className="container">
            <div className="row">
              <div className="col-12 d-flex gap-3">
                {requests.map((req) => (
                  <div key={req.id} className="receivReqBtn">
                    <Link
                      className={`btn rounded-lg ${currentRequest === req.name ? "btn-success text-white" : "bg-none border-black text-black"
                        }`}
                      onClick={() => setCurrentRequest(req.name)}
                    >
                      {req.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Request Content */}
        <div className="mt-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
              <TailSpin color="#00BFFF" height={50} width={50} />
            </div>
          ) : currentRequest === "Received Request" ? (
            <Recievedrequest recievedRequest={recievedRequest} setRecievedRequest={setRecievedRequest} />
          ) : (
            <Senedrequest sendedRequest={sendedRequest} setSendedRequest={setSendedRequest} isReceiverAvailable={isReceiverAvailable} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Work;

