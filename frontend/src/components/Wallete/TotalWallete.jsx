import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { toast } from "react-toastify";

const backend_API = import.meta.env.VITE_API_URL;

const TotalWallete = ({ walletBalance }) => {
  const { user } = useContext(UserContext);
  const [earnings, setEarnings] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch earnings data when the component is mounted
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchEarnings = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${backend_API}/referal/earnings/${user._id}`,
          {
            timeout: 10000, // 10 second timeout
            signal: controller.signal,
          }
        );

        if (isMounted && response.status === 200) {
          setEarnings(response.data.earnings);
          setEarningsHistory(response.data.earningsHistory || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[ERROR] Failed to fetch earnings:", err);
          if (axios.isCancel(err)) {
            console.log("Request cancelled");
          } else {
            setError(err.response?.data?.message || "Failed to fetch earnings");
            toast.error("Error loading earnings data. Retrying...");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEarnings();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
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
            <span className="text-capitalize">Earnings</span>
            <h3>&#8377;{earnings || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-4 col-md-4 d-flex align-items-center justify-content-center">
        <div className="card w-100 rounded-1 border-0 shadow-xl p-2 py-3 cursor-pointer">
          <button
            className="d-flex flex-column gap-3 align-items-center justify-content-center"
            onClick={handleWithdraw}
            disabled={walletBalance < 120 || loading}
          >
            <span className="text-capitalize">
              {loading ? "Loading..." : "Withdraw"}
            </span>
            <h3>&#8377;{walletBalance >= 120 ? walletBalance : 0}</h3>
          </button>
        </div>
      </div>

      {error && (
        <div className="col-12 mt-3">
          <div className="alert alert-danger text-center">
            {error}
          </div>
        </div>
      )}
    </>
  );
};

export default TotalWallete;
