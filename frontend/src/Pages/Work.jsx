import React, { useEffect, useState, useCallback } from "react";
import AdminNavbar from "../admincomponents/AdminNavbar";
import UserSideBar from "../components/UserSideBar";
import Recievedrequest from "../components/Recievedrequest";
import Senedrequest from "../components/Senedrequest";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileSidebar from "../components/ProfileSidebar";
import Footer from "../components/Footer";
import { TailSpin } from "react-loader-spinner";
import toast from "react-hot-toast";

const backend_API = import.meta.env.VITE_API_URL;

const Work = () => {
  const token = JSON.parse(localStorage.getItem("token")) || null;
  const [receivedRequest, setReceivedRequest] = useState([]);
  const [sendedRequest, setSendedRequest] = useState([]);
  const [currentRequest, setCurrentRequest] = useState("Sended Request");
  const [loading, setLoading] = useState(true);

  console.log(receivedRequest, "receivedRequest");

  const requests = [
    { id: 1, name: "Sended Request" },
    { id: 2, name: "Received Request" },
  ];

  const fetchRequests = useCallback(async (requestType) => {
    if (!token) {
      console.warn("⚠️ No authentication token found.");
      toast.error("Authentication required!");
      setLoading(false);
      return;
    }

    setLoading(true);
    let endpoint = "";
    if (requestType === "Sended Request") {
      endpoint = `${backend_API}/request/getSentRequests`;
    } else {
      endpoint = `${backend_API}/request/getReceivedRequests`;
    }

    try {
      const response = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "response.data");
      if (response.status === 200 && response.data) {
        if (requestType === "Sended Request") {
          setSendedRequest(response.data.sendedRequests || []);

        } else {
          setReceivedRequest(response.data.receivedRequests || []);
          console.log(response.data.receivedRequests, "response.data.receivedRequests");
        }
      } else {
        toast.error(response?.data?.message || "Error fetching requests");
      }
    } catch (error) {
      console.log(error, "error");
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests(currentRequest);
  }, [currentRequest, fetchRequests]);

  return (
    <>
      <AdminNavbar />
      <UserSideBar />
      <ProfileSidebar />

      <div className="my-40">
        <section>
          <div className="container">
            <div className="row">
              <div className="col-12 d-flex gap-3">
                {requests.map((req) => (
                  <div key={req.id} className="receivReqBtn">
                    <Link
                      className={`btn rounded-lg ${currentRequest === req.name ? "btn-success text-white" : "bg-none border-black text-black"}`}
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

        <div className="mt-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
              <TailSpin color="#00BFFF" height={50} width={50} />
            </div>
          ) : currentRequest === "Received Request" ? (
            <Recievedrequest receivedRequest={receivedRequest} setReceivedRequest={setReceivedRequest} />
          ) : (
            <Senedrequest sendedRequest={sendedRequest} setSendedRequest={setSendedRequest} />
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Work;
