import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5'; // Import a close icon
import { UserContext } from '../UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import starGold from "../../public/starRating.png";
import starSilver from "../../public/startSilver.png";
import ProfileIcon from "../../public/User_icon.webp"
import '../assets/Modal/Modal.css';
import { TailSpin } from 'react-loader-spinner';

const backend_API = import.meta.env.VITE_API_URL;

const OfferModal = ({ BannerUser, offerImage, closeModal }) => {
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);

  const [offer, setOffer] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // Stores the status of the request

  const [serviceRequest, setServiceRequest] = useState('I need your services');
  const token = JSON.parse(localStorage.getItem('token'))
  const navigete = useNavigate()

  useEffect(() => {
    if (Object.keys(BannerUser).length > 0) {
      setOffer(BannerUser);
    }
  }, [BannerUser]);
  console.log(offer, "offer");

  const profileImageUrl = offer?.profilePic || ProfileIcon;

  const renderStars = (ratings = [], maxRating = 10) => {
    const ratingValue = ratings.length > 0 ? ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length : 0;
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <img
          key={i}
          src={i <= ratingValue ? starGold : starSilver}
          alt={i <= ratingValue ? 'Filled Star' : 'Empty Star'}
          width={15}
        />
      );
    }
    return stars;
  };

  const handleContactNowClick = () => {
    setPopupVisible(true);
  };



  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${backend_API}/request/getUserRequests`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (response.status === 200) {
          // setAllRequest(response.data); // Store all requests 
          const currentRequest = response.data.sendedRequests.find(req => req.user._id === offer?._id);
          setRequestStatus(currentRequest?.status || null); // Set status for this user
        }
      } catch (error) {
        console.error('Error fetching requests:', error.response?.data || error.message);
        // toast.error("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [offer]);

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
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') closeModal();
    }}>
      <div className={`modal-wrapper ${popupVisible ? 'has-second-modal' : ''}`}>
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">View Offer</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {offer ? (
                  <div className="col-12">
                    <div className="modalImg h-[250px] w-full overflow-hidden">
                      <img src={offerImage} className="h-full w-full img-fluid " style={{ objectFit: "cover", objectPosition: "center" }} alt="Offer Banner" />
                    </div>
                    <div className="ModalContent pt-3 d-flex">
                      <div className="col-4">
                        <div className="img w-[100px] h-[150px] overflow-hidden">
                          <img src={profileImageUrl} alt="User Profile" className="w-full h-full img-fluid" />
                        </div>
                      </div>
                      <div className="col-8 d-flex align-items-center">
                        <div className="userContent px-3">
                          <h5>{offer?.name}</h5>
                          <p className='py-2 text'>{offer?.email}</p>
                          <strong className='text-capitalize text-orange'>{offer?.businessCategory}</strong>
                          <div className='py-2'>
                            <strong className='text-sm'> Provider</strong>
                            <div >
                              {offer.ratings ? (
                                <div className='d-flex align-items-center'>
                                  {renderStars(offer.ratings.map((r) => r.rating), 10)}
                                  <span className="ps-2">{offer.ratings.length > 0 && offer.ratings.reduce((acc, r) => acc + r.rating, 0) / offer.ratings.length}</span>
                                </div>
                              ) : (<></>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loading user data...</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn bg-green text-white"
                  onClick={handleContactNowClick}
                >
                  Contact Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {popupVisible && (
          <div className="contact-form-modal">
            <div className="modal-content shadow-lg bg-white p-3 ">
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
                    value={serviceRequest}
                    onChange={(e) => setServiceRequest(e.target.value)}
                    rows="1"
                    placeholder="Enter your service request details..."
                    required
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleClosePopup}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn bg-green text-white"
                      onClick={() => sendRequest(offer?._id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <TailSpin
                            height="20"
                            width="20"
                            color="white"
                            ariaLabel="tail-spin-loading"
                            radius="1"
                            visible={true}
                          />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferModal;
