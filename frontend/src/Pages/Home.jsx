import React, { useContext, useEffect, useState, useMemo } from 'react';
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
import "../assets/Veryfymodal.css";
import { toast } from 'react-toastify';
import { FCMContext } from '../context/FCMContext';

const backend_API = import.meta.env.VITE_API_URL;
const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const { fcmToken } = useContext(FCMContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [bannerImage, setBannerImage] = useState([]);
  const [auth, setAuth] = useState(Boolean(user));
  const [showModal, setShowModal] = useState(user?.paymentVerified === false);
  const [loading, setLoading] = useState(false);

  // Fetch Categories and Banners
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backend_API}/category/getAllCategory`);

        // Just set the categories directly - they should already be unique from backend
        setCategories(response.data.category);
      } catch (error) {
        console.error("[ERROR] Failed to fetch categories:", error);
        toast.error("Error fetching categories");
      }
    };

    fetchCategories();
  }, []);

  // Simplified grouping logic
  const groupedCategoriesAndBanners = useMemo(() => {
    if (!categories.length) return [];

    // Single group with all categories
    return [{
      categories: categories,
      BannerImage: bannerImage
    }];
  }, [categories, bannerImage]);

  // Handle Payment Verification
  const handlePaymentVerify = async (userId) => {
    setLoading(true);
    try {
      console.log("[INFO] Initiating payment for user:", userId);

      const orderResponse = await axios.post(`${backend_API}/payment/create-order`, {
        amount: "121",
        currency: "INR",
      });

      console.log("[INFO] Order created:", orderResponse.data);

      if (orderResponse.data.success) {
        const order = orderResponse.data.data.order;
        const options = {
          key: KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Enjoy Enjoy Services",
          description: "Test Payment",
          order_id: order.id,
          handler: async (response) => {
            try {
              console.log("[INFO] Payment response received:", response);

              const verifyResponse = await axios.post(
                `${backend_API}/payment/verify-payment`,
                {
                  payment_id: response.razorpay_payment_id,
                  user_id: userId
                }
              );

              if (verifyResponse.data.success) {
                toast.success("Payment verified successfully");
                setUser((prevUser) => ({ ...prevUser, paymentVerified: true }));
                setShowModal(false);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (error) {
              console.error("[ERROR] Payment verification failed:", error);
              toast.error(error.response?.data?.message || "Payment verification failed");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: "#3399cc"
          }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          console.error("[ERROR] Payment failed:", response.error);
          toast.error(response.error.description || "Payment failed");
        });
        rzp1.open();
      }
    } catch (error) {
      console.error("[ERROR] Payment initiation failed:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  // Authentication State Management
  useEffect(() => {
    setAuth(Boolean(user));
    if (user?.paymentVerified === false) {
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
            <button className="btn bg-green text-white" onClick={() => handlePaymentVerify(user._id)} disabled={loading}>
              {loading ? "Verifying..." : "Verify Payment"}
            </button>
          </div>
        </div>
      )}

      <div className='my-28'>
        {auth && <Card />}
        <div className='container pt-4'>
          <h4>Popular Offers</h4>
        </div>

        {/* Single render of categories */}
        {groupedCategoriesAndBanners.length > 0 && (
          <React.Fragment>
            <Benner BannerImage={bannerImage} setBannerImage={setBannerImage} />
            <ServieceCategories categories={categories} />
          </React.Fragment>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Home;
