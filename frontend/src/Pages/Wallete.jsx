import React, { memo, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../admincomponents/AdminNavbar';
import UserSideBar from '../components/UserSideBar';
import TotalWallete from '../components/Wallete/TotalWallete';
import ProfileSidebar from '../components/ProfileSidebar';
import ReferredBy from '../components/Team/ReferredBy';
import { UserContext } from '../UserContext';
import Footer from '../components/Footer';

const backend_API = import.meta.env.VITE_API_URL;

const Wallete = () => {
  const { user } = useContext(UserContext);
  const [walletBalance, setWalletBalance] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user's wallet balance and earnings history
    const fetchWalletData = async () => {
      if (!user?._id) {
        setError('User is not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backend_API}/referal/getUserWalletBalance/${user._id}`);
        console.log(response.data, "wallete");

        setWalletBalance(response.data.walletBalance);
        // setEarningsHistory(response.data.earningsHistory);
        setLoading(false);
      } catch (error) {
        setError(error?.response?.data?.message || 'Error fetching wallet balance');

      } finally {
        setLoading(false);
      }

    };

    fetchWalletData();
  }, [user?._id]);

  return (
    <>
      {/* Navigation */}
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />

      {/* Main Section */}
      <div className="my-32">
        <section>
          <div className="container">
            <div className="row">
              <div className="wallete text-white">

                {/* Wallet Overview */}
                <div className="col-12 d-flex flex-wrap p-4 rounded-1 bg-blue align-items-center">
                  {loading ? (
                    <div>
                      <div className="spinner-border text-light" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>

                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : (
                    <TotalWallete walletBalance={walletBalance} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default memo(Wallete);
