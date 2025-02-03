import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../UserContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const backend_API = import.meta.env.VITE_API_URL;

const Reffrale = () => {
  const { user } = useContext(UserContext);
  const [referrals, setReferrals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?._id) return;
      setLoading(true)
      try {
        const response = await axios.get(`${backend_API}/referal/getReferredBy/${user._id}`);
        if (response.status === 200) {
          setReferrals(response.data.referredBy);
          console.log(response.data, "referdby");
        } else {
          setError("Failed to fetch referrals");
        }
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [user?._id]);

  if (loading) return <p>Loading referrals...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="text-start">
      <h4 className="py-2">ReferredBy</h4>
      <div className="col-md-12">
        <div>

          <Link to={`tel:${referrals.phone}`} className="list-group">
            {referrals.length > 0 ? (
              referrals.map((referral, index) => (
                <div className="alert alert-primary" key={index}>
                  <h5>{referral.name}</h5>
                  <p><Link>
                    {referral.phone}
                  </Link></p>
                  {/* <p>{referral.email}</p> */}
                </div>
              ))
            ) : (
              <div className="alert alert-primary">No referrals found.</div>
            )}
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Reffrale;
