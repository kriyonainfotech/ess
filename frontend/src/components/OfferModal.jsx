
import React, { useEffect, useState, useContext } from 'react';
import { IoClose } from 'react-icons/io5';
import { UserContext } from '../UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from "../../public/User_icon.webp";
import '../assets/Modal/Modal.css';
const OfferModal = ({ BannerUser, offerImage, closeModal, allBanners, initialBannerId }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false); // 🔥 Contact Now modal state

  console.log("Current Offer:", BannerUser);
  console.log("User Data:", currentOffer?.userId);
  console.log("Profile Pic:", currentOffer?.userId?.profilePic);
  useEffect(() => {
    if (allBanners?.length > 0 && initialBannerId) {
      const foundIndex = allBanners.findIndex(b => b._id === initialBannerId);
      setCurrentIndex(foundIndex !== -1 ? foundIndex : 0);
    }
  }, [initialBannerId, allBanners]); // Use initialBannerId to find the correct banner

  useEffect(() => {
    if (allBanners?.length > 0) {
      setCurrentOffer(allBanners[currentIndex]);
    }
  }, [currentIndex, allBanners]);

  const navigateOffer = (direction) => {
    let newIndex = (currentIndex + direction + allBanners.length) % allBanners.length;
    setCurrentIndex(newIndex);
  };
  const handleContactNowClick = () => {
    setPopupVisible(true); // 🔥 Open Contact Now Modal
  };
  const handleClosePopup = () => {
    setPopupVisible(false); // 🔥 Close Contact Now Modal
  };


  const sendRequest = async (userId) => {
    console.log(user, "user");
    if (!user) {
      toast.error("Please login first");
      navigete('/login')
      return;
    }
    if (offer?.userstatus === 'unavailable') {
      toast.error("User is unavailable");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${backend_API}/request/sentRequest`, { receiverId: userId }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(response, "banner");
      if (response.status === 200) {
        // toast(response.data.message);
        // setRequestStatus('pending'); // Update status to pending
        toast("Request Sent Successfully!");
        navigete('/work')
        setLoading(false);

      } else {
        toast.error(error?.response?.data?.message);
        setLoading(false);
      }
    } catch (error) {
      console.log('Error sending request:', error.response?.data || error);
      toast.error(error.response.data.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-wrapper">
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Offer</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {currentOffer ? (
                  <div className="offer-content">
                    <img src={currentOffer.imageUrl} className="offer-banner" alt="Offer" />
                    <div className="offer-details flex pt-2">
                      <div className="col-4">
                        <div className="img w-[100px] h-[150px] overflow-hidden">
                          <img src={currentOffer?.userId?.profilePic || ProfileIcon} className="profile-pic" alt="User" />
                        </div>
                      </div>
                      <div className="col-8 pt-3">
                        <h5>{currentOffer.userId?.name}</h5>
                        <p>{currentOffer.userId?.email}</p>
                        <p className="category">{currentOffer.userId?.businessCategory}</p>
                        <div className="ratings">{/* Render star ratings here */}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loading user data...</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => navigateOffer(-1)}>⬅️</button>
                <button className="btn btn-primary" onClick={() => navigateOffer(1)}>➡️</button>
                <button className="btn btn-success" onClick={handleContactNowClick}>Contact Now</button>
              </div>
            </div>
          </div>
        </div>
        {/* 🔥 Contact Now Modal (Inside OfferModal) */}
        {popupVisible && (
          <div className="contact-form-modal">
            <div className="modal-content shadow-lg bg-white p-3">
              <div className="modal-header flex justify-between items-center border-b pb-2">
                <h5 className="modal-title text-lg font-semibold">Send Request</h5>
                <button
                  type="button"
                  className="close-btn py-1 px-2 rounded-lg"
                  onClick={handleClosePopup}
                >
                  <IoClose size={24} />
                </button>
              </div>
              <div className="modal-body p-4">
                <form>
                  <textarea
                    id="serviceRequest"
                    className="form-control w-100 mb-3"
                    placeholder="Enter your service request details..."
                    required
                  />
                  <div className="text-right">
                    <button type="button" className="btn btn-secondary me-2" onClick={handleClosePopup}>
                      Cancel
                    </button>
                    <button type="button" className="btn bg-green text-white" onClick={() => sendRequest(currentOffer.userId._id)}>
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};
export default OfferModal;

// import React, { useEffect, useState, useContext } from 'react';
// import { IoClose } from 'react-icons/io5';
// import { UserContext } from '../UserContext';
// import { useNavigate } from 'react-router-dom';
// import ProfileIcon from '../../public/User_icon.webp';
// import '../assets/Modal/ModernModal.css';
// const OfferModal = ({ BannerUser, offerImage, closeModal, allBanners }) => {
//   const { user } = useContext(UserContext);
//   const navigate = useNavigate();

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [currentOffer, setCurrentOffer] = useState(null);
//   const [popupVisible, setPopupVisible] = useState(false);
//   useEffect(() => {
//     if (allBanners?.length > 0 && BannerUser?._id) {
//       const foundIndex = allBanners.findIndex(b => b._id === BannerUser._id);
//       setCurrentIndex(foundIndex !== -1 ? foundIndex : 0);
//     }
//   }, [BannerUser, allBanners]);
//   useEffect(() => {
//     if (allBanners.length > 0) {
//       setCurrentOffer(allBanners[currentIndex]);
//     }
//   }, [currentIndex, allBanners]);
//   const navigateOffer = (direction) => {
//     let newIndex = (currentIndex + direction + allBanners.length) % allBanners.length;
//     setCurrentIndex(newIndex);
//   };
//   const handleContactNowClick = () => {
//     setPopupVisible(true);
//   };
//   const handleClosePopup = () => {
//     setPopupVisible(false);
//   };
//   return (
//     <div className="modal-overlay">
//       <div className="modal-wrapper glass-effect animate-modal">
//         <div className="modal-header">
//           <h5 className="modal-title">View Offer</h5>
//           <button className="close-btn" onClick={closeModal}><IoClose size={24} /></button>
//         </div>
//         <div className="modal-body">
//           {currentOffer ? (
//             <div className="offer-content">
//               <img src={currentOffer.imageUrl} className="offer-banner" alt="Offer" />
//               <div className="offer-details">
//                 <img src={currentOffer.userId?.profilePic || ProfileIcon} className="profile-pic" alt="User" />
//                 <h5>{currentOffer.userId?.name}</h5>
//                 <p>{currentOffer.userId?.email}</p>
//                 <p className="category">{currentOffer.userId?.businessCategory}</p>
//               </div>
//             </div>
//           ) : (
//             <p>Loading user data...</p>
//           )}
//         </div>
//         <div className="modal-footer">
//           <button className="btn btn-secondary btn-glass" onClick={() => navigateOffer(-1)}>⬅️</button>
//           <button className="btn btn-primary btn-glass" onClick={() => navigateOffer(1)}>➡️</button>
//           <button className="btn btn-success btn-glow" onClick={handleContactNowClick}>Contact Now</button>
//         </div>
//       </div>
//       {popupVisible && (
//         <div className="contact-form-modal animate-popup">
//           <div className="modal-content glass-effect">
//             <div className="modal-header">
//               <h5 className="modal-title">Send Request</h5>
//               <button className="close-btn" onClick={handleClosePopup}><IoClose size={24} /></button>
//             </div>
//             <div className="modal-body">
//               <form>
//                 <textarea className="form-control" placeholder="Enter your request details..." required />
//                 <div className="modal-actions">
//                   <button className="btn btn-secondary" onClick={handleClosePopup}>Cancel</button>
//                   <button className="btn btn-success btn-glow">Send Request</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default OfferModal;
