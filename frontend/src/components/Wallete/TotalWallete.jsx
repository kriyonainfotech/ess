import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";

const backend_API = import.meta.env.VITE_API_URL;

const TotalWallete = ({ walletBalance }) => {
  const { user } = useContext(UserContext);
  const [earnings, setEarnings] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch earnings data when the component is mounted
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?._id) return; // Ensure user ID exists
      setLoading(true)
      try {
        const response = await axios.get(`${backend_API}/referal/earnings/${user?._id}`);
        if (response.status === 200) {
          setEarnings(response.data.earnings);
        } else {
          setError(response?.data?.message || "Failed to fetch earnings");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user?._id]);

  // Handle withdraw logic
  const handleWithdraw = () => {
    if (walletBalance >= 120) {
      // Logic to perform the withdrawal, such as calling an API
      console.log(`Withdrawal successful: ₹${earnings}`);
    } else {
      alert("Insufficient balance for withdrawal.");
    }
  };

 
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="col-4 col-md-4 d-flex align-items-center justify-content-center">
        <div className="card w-100 rounded-1 border-0 shadow-xl p-2 py-3">
          <div className="d-flex flex-column gap-3 align-items-center justify-content-center">
            <span className="text-capitalize">Total</span>
            <h3>&#8377;{walletBalance || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-4 col-md-4 d-flex align-items-center justify-content-center p-1">
        <div className="card w-100 rounded-1 border-0 shadow-xl p-2 py-3">
          <div className="d-flex flex-column gap-3 align-items-center justify-content-center">
            <span className="text-capitalize">Transfer</span>
            <h3>&#8377;{0 || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-4 col-md-4 d-flex align-items-center justify-content-center">
        <div className="card w-100 rounded-1 border-0 shadow-xl p-2 py-3 cursor-pointer">
          <button
            className="d-flex flex-column gap-3 align-items-center justify-content-center"
            onClick={handleWithdraw}
            disabled={walletBalance < earnings}  // Disable button if balance is insufficient
          >
            <span className="text-capitalize">Withdraw</span>
            <h3>&#8377;{0 || 0}</h3>
          </button>
        </div>
      </div>
    </>
  );
};

export default TotalWallete;
