import React, { useContext, useEffect, useState } from 'react';
import Card from '../components/Profile/Card';
import ServieceCategories from '../components/ServieceCategories';
import Benner from '../components/Benner';
import AdminNavbar from '../admincomponents/AdminNavbar';
import UserSideBar from '../components/UserSideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getFcmToken, messaging } from '../Firebaseconfig';
import { onMessage } from 'firebase/messaging';
import ProfileSidebar from '../components/ProfileSidebar';
import { UserContext } from '../UserContext';
import Footer from '../components/Footer';
import "../assets/Veryfymodal.css"
import { toast } from 'react-toastify';
const backend_API = import.meta.env.VITE_API_URL;
import { FCMContext } from '../context/FCMContext';
const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
// console.log(KEY_ID);
const Home = () => {

  const { user } = useContext(UserContext);

  const [categories, setCategories] = useState([]);
  const [bannerImage, setBannerImage] = useState([]);
  const [auth, setAuth] = useState(false);
  const token = JSON.parse(localStorage.getItem('token'));
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for Payment Popup
  const [loading, setLoading] = useState(false);


  // Get FCM Token on mount
  // useEffect(() => {
  //   getFcmToken();
  //   onMessage(messaging, (payload) => {
  //     console.log(payload);
  //   });
  // }, []);
  const { fcmToken } = useContext(FCMContext);

  useEffect(() => {
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
    }
  }, [fcmToken]);

  // Fetch Categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_API}/category/getAllCategory`);
      const sortedCategories = response.data.category.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      );
      console.log(response, 'hc');
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast(error?.response?.data?.message)
    }
  };

  // Process categories and banners into groups
  const processCategoriesAndBanners = (categories, BannerImage, categoryGroupSize = 15, bannerGroupSize = 10) => {
    const groupedResult = [];
    let i = 0;
    let j = 0;

    while (i < categories.length || j < BannerImage.length) {
      const group = {
        categories: categories.slice(i, i + categoryGroupSize),
        BannerImage: BannerImage.slice(j, j + bannerGroupSize),
      };

      groupedResult.push(group);
      i += categoryGroupSize;
      j += bannerGroupSize;
    }

    return groupedResult;
  };

  // Fetch categories once when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Memoize grouped categories and banners to avoid recalculation on each render
  const groupedCategoriesAndBanners = React.useMemo(
    () => processCategoriesAndBanners(categories, bannerImage, 15, 10),
    [categories, bannerImage]
  );
  // hendlePaymentVerify
  const hendlePaymentVerify = async (userid) => {
    setLoading(true)
    try {
      const orderResponse = await axios.post(`${backend_API}/payment/create-order`, {
        amount: "121",
        currency: "INR",
      });

      if (orderResponse.data.success) {
        const order = orderResponse.data.data.order;

        const options = {
          key: KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "enjoy enjoy services",
          description: "services Payment",
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post(
                `${backend_API}/payment/verify-payment`,
                {
                  payment_id: response.razorpay_payment_id,
                  user_id: userid
                },
                { headers: { "Content-Type": "application/json" } }
              );

              if (verifyResponse.data.success) {
                toast.success("Payment verification successfull");
                window.location.reload()

              } else {
                toast.error("Payment verification failed.");
              }
            } catch (error) {
              console.error("Error verifying payment or registering user:", error);
              toast.error("An error occurred during verifying payment. Please try again.");
            }
          },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      toast(error?.response?.data?.message)
    }
  }

  // Set authentication state based on token
  useEffect(() => {
    setAuth(Boolean(user));  // Simplified check for token existence
  }, [user]);

  useEffect(() => {
    if (user && user.paymentVerified === false) {
      setShowModal(true);
    }
  }, [user]);

  return (
    <>
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />
      {/* Payment Verification Modal */}
      {showModal && (
        <div className="modals">
          <div className="modal-contents">
            <h5>Payment Verification</h5>
            <p>Your payment is not verified. Please complete the verification.</p>
            <button className='btn bg-green text-white' onClick={() => hendlePaymentVerify(user._id)}>Verify Payment</button>

          </div>
        </div>
      )}

      <div className='my-28'>
        {/* Render Card only if user is authenticated */}
        {auth && <Card />}
        <div className='container pt-4'>
          <h4>Poppuler Offers</h4>
        </div>
        <div>

          {groupedCategoriesAndBanners.map((group, index) => (
            <React.Fragment key={index}>


              <Benner BannerImage={group.BannerImage} setBannerImage={setBannerImage} />
              <ServieceCategories categories={group.categories} />
            </React.Fragment>
          ))}
        </div>
      </div>

      <Footer />

    </>
  );
};

export default Home;
