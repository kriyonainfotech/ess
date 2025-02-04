import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaLocationDot, FaPhone, FaStar } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import acService from '../../public/service-icons/ac service.png';
import { toast } from 'react-toastify';
import { LuUserPen } from 'react-icons/lu';
import AddRating from './Profile/AddRating';
import { format } from 'date-fns';
import starGold from "../../public/starRating.png"
import starSilver from "../../public/startSilver.png"
import ProfileIcon from "../../public/User_icon.webp"

const backend_API = import.meta.env.VITE_API_URL;

const Recievedrequest = ({ recievedRequest, setRecievedRequest }) => {
    const [status, setStatus] = useState('');
    const [serviceProviderId, setServiceProviderId] = useState('');
    const token = JSON.parse(localStorage.getItem('token'));
    const naviget = useNavigate();
    const [userRatings, setUserRatings] = useState('');
    const [providerRating, setProviderRating] = useState("");
    const [loading, setLoading] = useState(false);

    const handleProviderRatingClick = (rating) => {
        setProviderRating(rating);
        // localStorage.setItem("providerRating", JSON.stringify(rating));
    };

    const renderStars = (ratings, maxRating = 5) => {
        const ratingValue = ratings.length > 0 ? ratings.reduce((acc, cur) => acc + cur.rating, 0) / ratings.length : 0;
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

    const handleAcceptRequest = async (senderId) => {
        toast.info(
            <div>
                <p>Are you sure you want to Accept this Request?</p>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => confirmAccept(senderId)}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
                </div>
            </div>,
            { autoClose: true, closeOnClick: true }
        );
    };

    const confirmAccept = async (senderId) => {
        toast.dismiss(); // Close the confirmation toast
        console.log('hello')
        setLoading(true)
        try {
            const response = await axios.post(`${backend_API}/request/receivedRequest`, { senderId: senderId }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                setStatus("received");
                setRecievedRequest((prev) =>
                    prev.map((req) =>
                        req.user._id === senderId ? { ...req, status: 'received' } : req
                    )
                );
                toast.success(response?.data?.message || `Request accepted successfully`);
            } else {
                console.error("Failed to accept request:", response.data.message);
                toast.error(response.data.message || "Failed to accept request.");
            }
        } catch (error) {
            console.error("Error accepting user request:", error);
            toast(error?.response?.data?.message)
        }
    };

    const cancelRequest = async (senderId) => {
        toast.info(
            <div>
                <p>Are you sure you want to cancel this Request?</p>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => confirmCancle(senderId)}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
                </div>
            </div>,
            { autoClose: true, closeOnClick: true }
        );
    };

    const confirmCancle = async (senderId) => {
        toast.dismiss()
        try {
            const response = await axios.post(`${backend_API}/request/cancelRequest`, { senderId: senderId }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                setStatus("canceled");
                toast.success(error?.response?.data?.message || "Request canceled successfully.");
                setRecievedRequest((prev) =>
                    prev.map((req) =>
                        req.user._id === senderId ? { ...req, status: 'canceled' } : req
                    )
                );
            } else {
                console.error("Failed to cancel request:", response.data.message);
                toast.error(response.data.message || "Failed to cancel request.");
            }
        } catch (error) {
            console.error("Error canceling user request:", error);
            toast(error?.response?.data?.message)
        }
    };

    useEffect(() => {
        let receive = [...recievedRequest];
        receive.forEach((req) => {
            if (req.status === 'received') {
                setStatus('received');
            } else if (req.status === 'canceled') {
                setStatus('canceled');
            } else if (req.status === 'pending') {
                setStatus('pending');
            }
        });
    }, [recievedRequest]);

    const handleWorkDone = async (senderId) => {
        setServiceProviderId(senderId);

        // // toast.success(`Work done by ${id}`);
        // try {
        //     const response = await axios.post(`${backend_API}/request/workDone`, { senderId: senderId }, {
        //         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        //     });

        //     if (response.status === 200) {
        //         setStatus("pending");
        //         toast.success(`Work done successfully`);

        //     } else {
        //         console.error("Failed to work done request:", response.data.message);
        //         toast.error("Failed to work done request.");
        //     }
        // } catch (error) {
        //     console.error("Error work done  user request:", error);
        //     toast.error("An error occurred while work done  request.");
        // }

    };

    const renderStar = (ratingValue = 0, maxRating = 10) => {
        const stars = [];
        // Loop through to render full, half, or empty stars based on ratingValue
        for (let i = 1; i <= maxRating; i++) {
            if (i <= ratingValue) {
                stars.push(
                    <img
                        key={i}
                        src={starGold} // Filled star
                        alt="Filled Star"
                        width={15}
                    />
                );
            } else if (i - 0.5 <= ratingValue) {
                stars.push(
                    <img
                        key={i}
                        src={starHalf} // Half star
                        alt="Half Star"
                        width={15}
                    />
                );
            } else {
                stars.push(
                    <img
                        key={i}
                        src={starSilver} // Empty star
                        alt="Empty Star"
                        width={15}
                    />
                );
            }
        }
        return stars;
    };

    console.log(recievedRequest, "recieved");
    return (

        <>
            <div className='mt-4'>
                <section className="bg-gray-50 p-4 rounded-lg">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">
                                    Received Requests
                                </h2>
                            </div>

                            <div className="col-12">
                                <div className="row g-4">
                                    {recievedRequest.length ? (
                                        recievedRequest.map((receive, i) => (
                                            <div key={i} className="col-12 col-md-6 col-xl-4">
                                                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                                                    {/* Image Section */}
                                                    <div className="relative">
                                                        <img
                                                            className="w-full h-96 object-cover object-top"
                                                            src={receive?.user?.profilePic || ProfileIcon}
                                                            alt="Profile"
                                                        />
                                                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${receive.status === "done" ? "bg-red-500" : "bg-green-600"} text-white`}>
                                                            {receive.status === "done" ? "Completed" : receive?.user?.userstatus}
                                                        </span>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <div className='d-flex justify-content-between capitalize '>
                                                            <h6 className='text-orange m-0 text-md'>
                                                                {receive.user.businessCategory}
                                                            </h6>
                                                            <p className='text-sm'>{format(new Date(receive.date), 'PPpp')}</p>
                                                        </div>

                                                        <div className='flex-column pt-2 text-start'>

                                                            <h4 className="py-1">{receive.user.name}</h4>
                                                            <p className='d-flex align-items-center gap-2 pt-2'>
                                                                {receive?.user?.address?.area} {receive?.user?.address?.city} {receive?.user?.address?.state} {receive?.user?.address?.country} {receive?.user?.address?.pincode}
                                                            </p>

                                                            <div className="rating rating-sm w-full d-flex flex-column">
                                                                <div className='d-flex align-items-center'>
                                                                    <strong className='pe-2'>User:</strong>
                                                                    {renderStars(receive?.user?.userRatings || [], 10)}
                                                                    <span className='ps-2'>
                                                                        {receive?.user?.userRatings?.length ? receive?.user?.userRatings[0].rating : 0}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {receive.status === "done" ? (
                                                                <div className="rating rating-sm d-flex flex-column">

                                                                    <div className='d-flex align-items-center'>
                                                                        <div className='pe-2'>
                                                                            <strong>Provider:</strong>
                                                                        </div>
                                                                        <div>
                                                                            {receive?.userrating?.value ? (
                                                                                <div className="d-flex align-items-center">
                                                                                    {renderStar(receive?.userrating.value, 10)}
                                                                                    <span className="ps-2">
                                                                                        {receive?.userrating?.value.toFixed(1) || 0}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <span>No ratings yet.</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className='pt-2 d-flex justify-content-between align-items-start w-100'>
                                                                    {receive.status === "received" ? (
                                                                        <>
                                                                            <Link to={`tel:${receive.user.phone}`} className='btn p-2 w-50 border-green rounded-1 text-semibold text-green btn-outline-orange m-1'>
                                                                                Contact Now
                                                                            </Link>
                                                                            <Link onClick={() => handleWorkDone(receive.user._id)} className='btn p-2 w-50 m-1 border-green rounded-1 text-semibold text-green btn-outline-orange' data-bs-toggle="modal" data-bs-target="#exampleModal">
                                                                                Work Done
                                                                            </Link>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Link onClick={() => handleAcceptRequest(receive.user._id)} className='btn p-2 w-50 border-orange rounded-1 text-semibold text-orange m-1 btn-outline-orange'>
                                                                                Accept
                                                                            </Link>
                                                                            <Link onClick={() => cancelRequest(receive.user._id)} className='btn p-2 w-50 m-1 border-orange rounded-1 text-semibold text-orange btn-outline-orange'>
                                                                                Cancel
                                                                            </Link>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-12">
                                            <h5>No Request Found for you</h5>
                                            <p className="text-gray-500">Your Received requests will appear here once you make them</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>


        </>
    );
};

export default Recievedrequest;
