// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { UserContext } from '../../UserContext';
// import { Link } from 'react-router-dom';

// const backend_API = import.meta.env.VITE_API_URL;

// const ReferredBy = () => {
//   const { user } = useContext(UserContext);
//   const [referrals, setReferrals] = useState([]);
//   const [earnings, setEarnings] = useState({ earnings: 20, earningsHistory: [] });
//   const [paymentAmount, setPaymentAmount] = useState(20);
//   const [loadingReferrals, setLoadingReferrals] = useState(true);
//   const [loadingEarnings, setLoadingEarnings] = useState(true);
//   const [error, setError] = useState('');
//   const [activeSection, setActiveSection] = useState('referrals'); // Manage active section

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user?._id) {
//         setError('User is not authenticated');
//         setLoadingReferrals(false);
//         setLoadingEarnings(false);
//         return;
//       }

//       try {
//         const referralResponse = await axios.get(`${backend_API}/referal/getreferrals/${user._id}`);
//         console.log(referralResponse.data,"rrreeeffffree");

//         const sortedReferrals = referralResponse.data.referredUsers.sort((a, b) =>
//           a.name.localeCompare(b.name)
//         );

//         setReferrals(sortedReferrals);
//         console.log(sortedReferrals ,"refrals");

//         setLoadingReferrals(false);

//         const earningsResponse = await axios.get(`${backend_API}/referal/earnings/${user._id}`);
//         setEarnings(earningsResponse.data);
//         console.log(earningsResponse.data);

//         setLoadingEarnings(false);
//       } catch (err) {
//         setError('Error fetching data');
//         setLoadingReferrals(false);
//         setLoadingEarnings(false);
//       }
//     };

//     fetchData();
//   }, [user?._id]);

//   const handleDistributeRewards = async () => {
//     if (!paymentAmount || paymentAmount <= 0) {
//       alert('Please enter a valid payment amount');
//       return;
//     }

//     try {
//       await axios.post(`${backend_API}/referal/distribute-rewards`, {
//         userId: user._id,
//         paymentAmount,
//       });
//       alert('Rewards distributed successfully');
//     } catch (err) {
//       alert('Error distributing rewards');
//     }
//   };

//   return (
//     <>

//       <div className=''>
//       <div className="container mt-2 ">
//       {error && <div className="alert alert-danger">{error}</div>}
//       <div className="row">
//         {/* Referrals Section */}
//         <div className="col-md-6">
//           <h4 className='mb-2'>Your Referrals</h4>
//           {loadingReferrals ? (
//             <div>
//               <div className="spinner-border text-primary" role="status">
//                 <span className="sr-only">Loading...</span>
//               </div>
//               <p>Loading referrals...</p>
//             </div>
//           ) : (
//             <Link to={`tel:${referrals.phone}`}  className="list-group">
//               {referrals.length > 0 ? (
//                 referrals.map((referral, index) => (
//                   <div  className="alert alert-danger" key={index}>
//                     <h5>{referral.name}</h5>
//                     <p>{referral.phone}</p>
//                     <p>Referrals: {
//                       referral.referrals.length 

//                       }</p>
//                   </div>
//                 ))
//               ) : (
//                 <div className="alert alert-warning">No referrals found.</div>
//               )}
//             </Link>
//           )}
//         </div>


//       </div>
//     </div>
//       </div>
//     </>
//   );
// };

// export default ReferredBy;
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { Link } from "react-router-dom";

const backend_API = import.meta.env.VITE_API_URL;

const ReferredBy = () => {
  const { user } = useContext(UserContext);
  const [referrals, setReferrals] = useState([]);
  const [referralCounts, setReferralCounts] = useState({ direct: 0, total: 0 });
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) {
        setError("User is not authenticated");
        setLoadingReferrals(false);
        return;
      }

      try {
        const response = await axios.get(`${backend_API}/referal/getreferrals/${user._id}`);
        console.log(response.data, "Referral Data");

        setReferrals(response.data.referredUsers);
        setReferralCounts(response.data.user.referralCounts); // Get direct & total referral count
        setLoadingReferrals(false);
      } catch (err) {
        setError("Error fetching data");
        setLoadingReferrals(false);
      }
    };

    fetchData();
  }, [user?._id]);

  return (
    <div className="mt-2">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="text-start">
        {/* Referrals Section */}
        <div className="">
          <div className="d-flex justify-content-between">
            <div >
              <h4 className="">Your Referrals</h4>
            </div>
            <div>
              <p><strong>Direct Referrals:</strong> {referralCounts.direct}</p>
              <p><strong>Total Referrals (All Levels):</strong> {referralCounts.total}</p>
            </div>
          </div>

          {loadingReferrals ? (
            <div>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p>Loading referrals...</p>
            </div>
          ) : (
            <div className="list-group">
              {referrals.length > 0 ? (
                referrals.map((referral, index) => (
                  <div className="alert alert-success" key={index}>
                    <h5>{referral.name}</h5>
                    <p>{referral.phone}</p>
                    <p><strong>Referrals:</strong> {referral.referrals.length}</p>
                  </div>
                ))
              ) : (
                <div className="alert alert-warning">No referrals found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default ReferredBy;
