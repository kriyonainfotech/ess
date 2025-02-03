import React, { useEffect, useState } from 'react'
import { FaLocationDot, FaPhone, FaStar } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import AdminNavbar from '../admincomponents/AdminNavbar'
import UserSideBar from './UserSideBar'
import acService from '../../public/service-icons/ac service.png'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddRating from './Profile/AddRating'
import { format } from 'date-fns';
import starGold from "../../public/starRating.png"
import starSilver from "../../public/startSilver.png"
import ProfileIcon from "../../public/User_icon.webp"
import AddProviderRating from './Profile/AddProviderRating'

const backend_API = import.meta.env.VITE_API_URL;

const Senedrequest = ({ sendedRequest }) => {
    const [status, setStatus] = useState('');
    const token = JSON.parse(localStorage.getItem('token'))
    const [loading, setLoading] = useState(false);
    // const [serviceProviderId, setServiceProviderId] = useState('');
    const [serviceProviderId, setServiceProviderId] = useState(null);

    const [userRatings, setUserRatings] = useState('');
    const [isRatesubmit, setIsRatesubmit] = useState("");
    // Render stars for the rating
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
    // console.log(token , "token in sendreq");
    console.log(sendedRequest, "sended status");


    useEffect(() => {
        let sendeReq = [...sendedRequest]
        sendeReq.forEach((req) => {
            if (req.status === 'received') {
                setStatus('received')
                // toast(`Request Accepted by ${req.user.name}`)

            }
            else if (req.status === 'canceled') {
                setStatus('canceled')
                // toast(`Request canceled by ${req.user.name}`)
            }
            else if (req.status === 'pending') {
                setStatus('pending')
                // toast(`Request pending by ${req.user.name}`)
            }
        })

    }, [sendedRequest])

    const handleDelet = async (requestId) => {
        toast.info(
            <div>
                <p>Are you sure you want to delete this request?</p>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(requestId)}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
                </div>
            </div>,
            { autoClose: false, closeOnClick: false }
        );
    };

    const confirmDelete = async (requestId) => {
        toast.dismiss(); // Close the confirmation toast
        setLoading(true)
        try {
            const response = await axios.delete(`${backend_API}/request/deleteRequest`, {
                data: { requestId },
                headers: {
                    'Content-Type': 'application/json',
                    //  'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                // setStatus("canceled");
                toast.success(response.data.message || "Request delete successfully.");
                window.location.reload()
            } else {
                console.error("Failed to cancel request:", response.data.message);
                toast.error(response?.data?.message || "Failed to cancel request.");
            }
        } catch (error) {
            console.error("Error canceling user request:", error);
            toast.error(error?.response?.data?.message || "An error occurred while canceling the request.");
        } finally {
            setLoading(false)
        }
    };

    const handleWorkDone = async (senderId) => {
        setServiceProviderId(senderId)
    }

    // Fetch ratings for a specific user
    const fetchUserRatings = async (userId) => {
        setLoading(true)
        try {
            const response = await axios.get(`${backend_API}/user/getRatings/${userId}`, {

            });
            if (response.data.success) {
                console.log(response.data, "rating");
                setUserRatings((prev) => ({
                    ...prev,
                    [userId]: response.data.providerRatings.map((r) => r.rating),
                }));
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
            toast(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    };

    // Fetch ratings for all users in the sendedRequest array
    useEffect(() => {
        sendedRequest

            .forEach((req) => {
                if (req?.user?._id) {
                    fetchUserRatings(req.user._id);
                }
            });
    }, [sendedRequest]);
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

    return (
        <>
            <AdminNavbar />
            <UserSideBar />
            <div className='mt-4'>
                <section className="bg-gray-50 p-4 rounded-lg">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">
                                    Sent Requests
                                </h2>
                            </div>

                            <div className="col-12">
                                <div className="row g-4">
                                    {sendedRequest.length ? (
                                        sendedRequest.map((receive, i) => (
                                            <div key={i} className="col-12 col-md-6 col-xl-4">
                                                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                                                    {/* Image Section */}
                                                    <div className="relative">
                                                        <img
                                                            className="w-full h-96 object-cover object-top"
                                                            src={receive?.user?.profilePic || ProfileIcon}
                                                            alt="Profile"
                                                        />
                                                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${receive.status === "done" ? "bg-green-100 text-white" : "bg-orange-100 text-orange-800"}`}>
                                                            {receive.status === "done" ? "Completed" : receive?.user?.userstatus}
                                                        </span>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className='text-start'>
                                                                <h3 className="text-xl font-semibold text-gray-800">
                                                                    {receive.user.name}
                                                                </h3>
                                                                <p className="text-sm text-orange-600  font-medium">
                                                                    {receive.user.businessCategory}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {format(new Date(receive.date), 'PP')}
                                                            </span>
                                                        </div>

                                                        <div className="mb-4">
                                                            <p className="text-sm text-start text-gray-600">
                                                                <i className="fas fa-map-marker-alt text-orange-500"></i>
                                                                {`${receive?.user?.address?.area}, ${receive?.user?.address?.city}, ${receive?.user?.address?.state}`}
                                                            </p>
                                                        </div>

                                                        {/* Ratings Section */}
                                                        <div className="space-y-3 mb-4">
                                                            {receive?.user?.providerRatings && (
                                                                <div className="flex items-center">
                                                                    <span className="text-sm font-medium text-gray-700 mr-2">User Rating:</span>
                                                                    <div className="flex items-center">
                                                                        {renderStars(receive.user.providerRatings.map(r => r.rating), 10)}
                                                                        <span className="ml-2 text-sm font-medium text-gray-600">
                                                                            {receive.user.providerAverageRating?.toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {receive?.providerrating?.value ? (
                                                                <div className="flex items-center">
                                                                    <span className="text-sm font-medium text-gray-700 mr-2">Your Rating:</span>
                                                                    <div className="flex items-center">
                                                                        {renderStar(receive.providerrating.value, 10)}
                                                                        <span className="ml-2 text-sm font-medium text-gray-600">
                                                                            {receive.providerrating.value.toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleWorkDone(receive.user._id)}
                                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                                                >
                                                                    <i className="fas fa-star"></i>
                                                                    Rate Service
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="mt-auto flex gap-2">
                                                            <button
                                                                onClick={() => handleDelet(receive._id)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                                Delete
                                                            </button>
                                                            <Link
                                                                to={`tel:${receive.user.phone}`}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                            >
                                                                <i className="fas fa-phone"></i>
                                                                Contact
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-12">
                                            <div className="max-w-md mx-auto">
                                                <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                                                <h3 className="text-xl font-medium text-gray-600 mb-2">
                                                    No Requests Found
                                                </h3>
                                                <p className="text-gray-500">
                                                    Your sent requests will appear here once you make them
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default Senedrequest