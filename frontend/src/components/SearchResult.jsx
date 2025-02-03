import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FCMContext } from '../context/FCMContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import starGold from "../../public/starRating.png";
import starSilver from "../../public/startSilver.png";
import ProfileIcon from "../../public/User_icon.webp"

const backend_API = import.meta.env.VITE_API_URL;

const SearchResult = ({ Usersdata, token }) => {
    const { fcmToken } = useContext(FCMContext);
    const { user } = useContext(UserContext);
    const [requestStatus, setRequestStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allRequest, setAllRequest] = useState([]);
    const [message, setMessage] = useState("I NEED YOUR SERVICE");
    const navigate = useNavigate();

    const renderStars = (ratings = [], maxRating = 5) => {
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

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backend_API}/request/getUserRequests`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setAllRequest(response.data);
                    const currentRequest = response.data.sendedRequests.find(req => req.user._id === Usersdata?._id);
                    setRequestStatus(currentRequest?.status || null);
                }
            } catch (error) {
                console.error('Error fetching requests:', error.response?.data || error.message);
                toast(error?.response?.data?.message)

            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [Usersdata, token]);

    const sendRequest = async (userId, requestMessage = "I NEED YOUR SERVICE") => {
        if (Usersdata?.userstatus === 'unavailable') {
            toast("User is unavailable");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${backend_API}/request/sentRequest`, { receiverId: userId, message: requestMessage }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setRequestStatus('pending');
                toast(response.data.message || "Request Sent Successfully!");
                navigate('/work');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error sending request:', error.response?.data || error.message);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    if (!Usersdata) return <p>Loading user data...</p>;

    return (
        <>
            <div className="col-12 col-md-6 col-xl-3 p-2" style={{ cursor: "pointer" }}>
                <div className="d-flex flex-md-column border-0 overflow-hidden rounded-3 shadow-xl" style={{ position: "relative" }}>
                    <div className="col-5 col-md-7 p-2">
                        <div className="d-flex w-100 h-[150px] justify-content-center border rounded-2 align-items-center">
                            <img
                                src={Usersdata?.profilePic || ProfileIcon}
                                alt="User Profile"
                                className='img-fluid overflow-hidden w-100 h-100'
                                style={{ objectFit: "cover", objectPosition: "center" }}
                            />
                        </div>
                        <div style={{ position: "absolute", top: "2%", right: "3%" }}>
                            <span className={`px-2 py-1 shadow-xl bg-white d-flex align-items-center rounded-5 text-capitalize text-sm ${Usersdata?.userstatus === 'available' ? 'text-green' : 'text-orange'}`}>
                                {Usersdata?.userstatus}
                            </span>
                        </div>
                    </div>
                    <div className="col-8 col-md-12">
                        <div className="p-3 w-100 text-capitalize">
                            <h4 className="font-bold">{Usersdata?.name}</h4>
                            <h6 className="font-semibold py-1">{Usersdata?.businessCategory}</h6>
                            <p className="text-muted text">{Usersdata?.address?.area} {Usersdata?.address?.city} {Usersdata?.address?.state} {Usersdata?.address?.country} {Usersdata?.address?.pincode}</p>
                            <div className='py-2'>
                                {Usersdata.ratings ? (
                                    <div className='d-flex align-items-center'>
                                        {renderStars(Usersdata.ratings.map((r) => r.rating), 10)}
                                        <span className="ps-2">{Usersdata.ratings.length > 0 && Usersdata.ratings.reduce((acc, r) => acc + r.rating, 0) / Usersdata.ratings.length}</span>
                                    </div>
                                ) : (<></>)}
                            </div>
                            <div>
                                {requestStatus === 'pending' ? (
                                    <Link to={`tel:${Usersdata.phone}`} className='btn bg-green rounded-1 text-semibold text-white'>
                                        Contact Now
                                    </Link>
                                ) : (
                                    <button
                                        className='p-2 rounded-2 text-sm bg-green text-white'
                                        data-bs-toggle="modal"
                                        data-bs-target={`#modal-${Usersdata._id}`}
                                        disabled={loading}
                                    >
                                        {loading ?
                                            <div className="spinner-border text-white" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div> : 'Send now'}


                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* <div>
                        <div className="modal fade" id={`modal-${Usersdata._id}`} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="exampleModalLabel">Send Request {Usersdata._id}</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body h-[200px]">
                                        <h4>{Usersdata.name}</h4>
                                        <div className="card message shadow-xl bg-white h-100 p-3">
                                            <textarea
                                                className="form-control"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => sendRequest(Usersdata._id)}
                                            data-bs-dismiss="modal"
                                            disabled={loading}

                                        >
                                            {loading ?
                                                <div className="spinner-border text-white" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div> : 'Send Request'}

                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    <div>
                        <div
                            className="modal fade"
                            id={`modal-${Usersdata._id}`}
                            tabIndex={-1}
                            aria-labelledby="exampleModalLabel"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content shadow-lg rounded-lg">
                                    <div className="modal-header border-bottom-0">
                                        <h5 className="modal-title text-xl font-semibold" id="exampleModalLabel">
                                            Send Request to {Usersdata.name}
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        />
                                    </div>
                                    <div className="modal-body pb-4 pt-0">
                                        <h4 className="text-lg text-start capitalize font-medium mb-2">{Usersdata.businessCategory}</h4>
                                        <div className="card bg-white shadow-md ">
                                            <textarea
                                                className="form-control resize-none"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows="4"
                                                placeholder="Write your message..."
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer border-top-0 pt-3">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-32"
                                            data-bs-dismiss="modal"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => sendRequest(Usersdata._id)}
                                            data-bs-dismiss="modal"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="spinner-border spinner-border-sm text-white" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            ) : (
                                                'Send Request'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default SearchResult;
