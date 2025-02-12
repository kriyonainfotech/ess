// import React, { useEffect, useState } from 'react'
// import { FaLocationDot, FaPhone, FaStar } from 'react-icons/fa6'
// import { Link } from 'react-router-dom'
// import AdminNavbar from '../admincomponents/AdminNavbar'
// import UserSideBar from './UserSideBar'
// import acService from '../../public/service-icons/ac service.png'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import AddRating from './Profile/AddRating'
// import { format } from 'date-fns';
// import starGold from "../../public/starRating.png"
// import starSilver from "../../public/startSilver.png"
// import ProfileIcon from "../../public/User_icon.webp"
// import AddProviderRating from './Profile/AddProviderRating'

// const backend_API = import.meta.env.VITE_API_URL;

// const Senedrequest = ({ sendedRequest }) => {
//     console.log(sendedRequest, "sendedRequest");
//     const [status, setStatus] = useState('');
//     const token = JSON.parse(localStorage.getItem('token'))
//     const [loading, setLoading] = useState(false);
//     // const [serviceProviderId, setServiceProviderId] = useState('');
//     const [serviceProviderId, setServiceProviderId] = useState(null);

//     const [userRatings, setUserRatings] = useState('');
//     const [isRatesubmit, setIsRatesubmit] = useState("");
//     // Render stars for the rating
//     const renderStars = (ratings = [], maxRating = 10) => {
//         const ratingValue = ratings.length > 0 ? ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length : 0;
//         const stars = [];
//         for (let i = 1; i <= maxRating; i++) {
//             stars.push(
//                 <img
//                     key={i}
//                     src={i <= ratingValue ? starGold : starSilver}
//                     alt={i <= ratingValue ? 'Filled Star' : 'Empty Star'}
//                     width={15}
//                 />
//             );
//         }
//         return stars;
//     };
//     // console.log(token , "token in sendreq");
//     console.log(sendedRequest, "sended status");


//     useEffect(() => {
//         let sendeReq = [...sendedRequest]
//         sendeReq.forEach((req) => {
//             if (req.status === 'received') {
//                 setStatus('received')
//                 // toast(`Request Accepted by ${req.user.name}`)

//             }
//             else if (req.status === 'canceled') {
//                 setStatus('canceled')
//                 // toast(`Request canceled by ${req.user.name}`)
//             }
//             else if (req.status === 'pending') {
//                 setStatus('pending')
//                 // toast(`Request pending by ${req.user.name}`)
//             }
//         })

//     }, [sendedRequest])

//     const handleDelet = async (requestId) => {
//         toast.info(
//             <div>
//                 <p>Are you sure you want to delete this request?</p>
//                 <div className="d-flex justify-content-center gap-2">
//                     <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(requestId)}>Yes</button>
//                     <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
//                 </div>
//             </div>,
//             { autoClose: false, closeOnClick: false }
//         );
//     };

//     const confirmDelete = async (requestId) => {
//         toast.dismiss(); // Close the confirmation toast
//         setLoading(true)
//         try {
//             const response = await axios.delete(`${backend_API}/request/deleteRequest`, {
//                 data: { requestId },
//                 headers: {
//                     'Content-Type': 'application/json',
//                     //  'Authorization': `Bearer ${token}`
//                 },
//             });

//             if (response.status === 200) {
//                 // setStatus("canceled");
//                 toast.success(response.data.message || "Request delete successfully.");
//                 window.location.reload()
//             } else {
//                 console.error("Failed to cancel request:", response.data.message);
//                 toast.error(response?.data?.message || "Failed to cancel request.");
//             }
//         } catch (error) {
//             console.error("Error canceling user request:", error);
//             toast.error(error?.response?.data?.message || "An error occurred while canceling the request.");
//         } finally {
//             setLoading(false)
//         }
//     };

//     const handleWorkDone = async (senderId) => {
//         setServiceProviderId(senderId)
//     }

//     // Fetch ratings for a specific user
//     const fetchUserRatings = async (userId) => {
//         setLoading(true)
//         try {
//             const response = await axios.get(`${backend_API}/user/getRatings/${userId}`, {

//             });
//             if (response.data.success) {
//                 console.log(response.data, "rating");
//                 setUserRatings((prev) => ({
//                     ...prev,
//                     [userId]: response.data.providerRatings.map((r) => r.rating),
//                 }));
//             }
//         } catch (error) {
//             console.error('Error fetching ratings:', error);
//             toast(error?.response?.data?.message)
//         } finally {
//             setLoading(false)
//         }
//     };

//     // Fetch ratings for all users in the sendedRequest array
//     useEffect(() => {
//         sendedRequest

//             .forEach((req) => {
//                 if (req?.user?._id) {
//                     fetchUserRatings(req.user._id);
//                 }
//             });
//     }, [sendedRequest]);
//     const renderStar = (ratingValue = 0, maxRating = 10) => {
//         const stars = [];
//         // Loop through to render full, half, or empty stars based on ratingValue
//         for (let i = 1; i <= maxRating; i++) {
//             if (i <= ratingValue) {
//                 stars.push(
//                     <img
//                         key={i}
//                         src={starGold} // Filled star
//                         alt="Filled Star"
//                         width={15}
//                     />
//                 );
//             } else if (i - 0.5 <= ratingValue) {
//                 stars.push(
//                     <img
//                         key={i}
//                         src={starHalf} // Half star
//                         alt="Half Star"
//                         width={15}
//                     />
//                 );
//             } else {
//                 stars.push(
//                     <img
//                         key={i}
//                         src={starSilver} // Empty star
//                         alt="Empty Star"
//                         width={15}
//                     />
//                 );
//             }
//         }
//         return stars;
//     };

//     return (
//         <>
//             <AdminNavbar />
//             <UserSideBar />
//             <div className='mt-4'>
//                 <section className="bg-gray-50 p-4 rounded-lg">
//                     <div className="container">
//                         <div className="row">
//                             <div className="col-12 mb-6">
//                                 <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">
//                                     Sent Requests
//                                 </h2>
//                             </div>

//                             <div className="col-12">
//                                 <div className="row g-4">
//                                     {sendedRequest?.length ? (
//                                         sendedRequest.map((receive, i) => (
//                                             <div key={i} className="col-12 col-md-6 col-xl-4">

//                                                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
//                                                     {/* Image Section */}
//                                                     <div className="relative">
//                                                         <img
//                                                             className="w-full h-96 object-cover object-top"
//                                                             src={receive?.user?.profilePic || ProfileIcon}
//                                                             alt="Profile"
//                                                         />
//                                                         <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${receive?.status === "done" ? "bg-green-100 text-white" : "bg-orange-100 text-orange-800"}`}>
//                                                             {receive?.status === "done" ? "Completed" : receive?.user?.userstatus}
//                                                         </span>
//                                                     </div>


//                                                     {/* Content Section */}
//                                                     <div className="p-4 flex-1 flex flex-col">
//                                                         <div className="flex justify-between items-start mb-2">
//                                                             <div className='text-start'>
//                                                                 <h3 className="text-xl font-semibold text-gray-800">
//                                                                     {receive?.user?.name}
//                                                                 </h3>
//                                                                 <p className="text-sm text-orange-600  font-medium">
//                                                                     {receive?.user?.businessCategory}

//                                                                 </p>
//                                                             </div>
//                                                             <span className="text-sm text-gray-500">
//                                                                 {format(new Date(receive?.date), 'PP')}
//                                                             </span>
//                                                         </div>

//                                                         <div className="mb-4">
//                                                             <p className="text-sm text-start text-gray-600">
//                                                                 <i className="fas fa-map-marker-alt text-orange-500"></i>
//                                                                 {`${receive?.user?.address?.area}, ${receive?.user?.address?.city}, ${receive?.user?.address?.state}`}
//                                                             </p>
//                                                         </div>

//                                                         {/* Ratings Section */}
//                                                         <div className="space-y-3 mb-4">
//                                                             {receive?.user?.providerRatings && (
//                                                                 <div className="flex items-center">
//                                                                     <span className="text-sm font-medium text-gray-700 mr-2">User Rating:</span>
//                                                                     <div className="flex items-center">
//                                                                         {renderStars(receive.user.providerRatings.map(r => r.rating), 10)}
//                                                                         <span className="ml-2 text-sm font-medium text-gray-600">
//                                                                             {receive.user.providerAverageRating?.toFixed(1)}
//                                                                         </span>
//                                                                     </div>
//                                                                 </div>
//                                                             )}

//                                                             {receive?.providerrating?.value ? (
//                                                                 <div className="flex items-center">
//                                                                     <span className="text-sm font-medium text-gray-700 mr-2">Your Rating:</span>
//                                                                     <div className="flex items-center">
//                                                                         {renderStar(receive.providerrating.value, 10)}
//                                                                         <span className="ml-2 text-sm font-medium text-gray-600">
//                                                                             {receive.providerrating.value.toFixed(1)}
//                                                                         </span>
//                                                                     </div>
//                                                                 </div>
//                                                             ) : (
//                                                                 <button
//                                                                     onClick={() => handleWorkDone(receive.user._id)}
//                                                                     className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
//                                                                 >
//                                                                     <i className="fas fa-star"></i>
//                                                                     Rate Service
//                                                                 </button>
//                                                             )}
//                                                         </div>

//                                                         {/* Action Buttons */}
//                                                         <div className="mt-auto flex gap-2">
//                                                             <button
//                                                                 onClick={() => handleDelet(receive._id)}
//                                                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
//                                                             >
//                                                                 <i className="fas fa-trash"></i>
//                                                                 Delete
//                                                             </button>
//                                                             <Link
//                                                                 to={`tel:${receive?.user?.phone}`}
//                                                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
//                                                             >
//                                                                 <i className="fas fa-phone"></i>

//                                                                 Contact
//                                                             </Link>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="col-12 text-center py-12">
//                                             <div className="max-w-md mx-auto">
//                                                 <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
//                                                 <h3 className="text-xl font-medium text-gray-600 mb-2">
//                                                     No Requests Found for you
//                                                 </h3>
//                                                 <p className="text-gray-500">
//                                                     Your sent requests will appear here once you make them
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </>
//     )
// }

// export default Senedrequest
// import React, { useEffect, useState } from 'react'
// import { FaLocationDot, FaPhone, FaStar } from 'react-icons/fa6'
// import { Link } from 'react-router-dom'
// import AdminNavbar from '../admincomponents/AdminNavbar'
// import UserSideBar from './UserSideBar'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { format } from 'date-fns';
// import starGold from "../../public/starRating.png"
// import starSilver from "../../public/startSilver.png"
// import ProfileIcon from "../../public/User_icon.webp"
// import AddProviderRating from './Profile/AddProviderRating'

// const backend_API = import.meta.env.VITE_API_URL;

// const Senedrequest = ({ sendedRequest }) => {
//     console.log(sendedRequest, "sendedRequest");

//     const renderStars = (rating = 0, maxRating = 5) => {
//         return [...Array(maxRating)].map((_, i) => (
//             <img
//                 key={i}
//                 src={i < rating ? starGold : starSilver}
//                 alt={i < rating ? 'Filled Star' : 'Empty Star'}
//                 width={15}
//             />
//         ));
//     };

//     const handleDelete = (id) => {
//         console.log(id, "id");
//         toast.info(
//             <div>
//                 <p>Are you sure you want to delete this request?</p>

//                 <div className="flex gap-2 mt-2">
//                     <button
//                         onClick={() => confirmDelete(id)}
//                         className="px-4 py-2 bg-red-600 text-white rounded-lg"
//                     >
//                         Yes
//                     </button>
//                     <button
//                         onClick={() => toast.dismiss()}
//                         className="px-4 py-2 bg-gray-400 text-white rounded-lg"
//                     >
//                         No
//                     </button>
//                 </div>
//             </div>,
//             { autoClose: false, closeOnClick: false }
//         );
//     };

//     const confirmDelete = async (id) => {
//         // Perform the delete operation
//         console.log(id, "id");
//         toast.dismiss();
//         toast.success("Request deleted successfully");
//         try {
//             const response = await axios.delete(`${backend_API}/request/cancelRequest`, {
//                 data: { requestId: id },
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//             });
//             console.log(response, "response");
//             if (response.status === 200) {
//                 toast.success(response.data.message || "Request deleted successfully.");
//                 window.location.reload()
//             } else {
//                 toast.error(response?.data?.message || "Failed to delete request.");
//             }
//         } catch (error) {
//             toast.error(error?.response?.data?.message || "An error occurred while deleting the request.");
//         }
//     };


//     return (
//         <>
//             <AdminNavbar />
//             <UserSideBar />
//             <div className='mt-4'>
//                 <section className="bg-gray-50 p-4 rounded-lg">
//                     <div className="container">
//                         <div className="row">
//                             <div className="col-12 mb-6">
//                                 <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">
//                                     Sent Requests
//                                 </h2>
//                             </div>
//                             <div className="col-12">
//                                 <div className="row g-4">
//                                     {sendedRequest?.length ? (
//                                         sendedRequest.map((receive, i) => (
//                                             <div key={i} className="col-12 col-md-6 col-xl-4">
//                                                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
//                                                     <div className="relative">
//                                                         <img
//                                                             className="w-full h-96 object-cover object-top"
//                                                             src={receive?.profilePic || ProfileIcon}
//                                                             alt="Profile"
//                                                         />
//                                                     </div>
//                                                     <div className="p-4 flex-1 flex flex-col">
//                                                         <h3 className="text-xl font-semibold text-gray-800">
//                                                             {receive?.name}
//                                                         </h3>
//                                                         <div className='d-flex align-items-center justify-content-between '>
//                                                             <p className="text-sm text-orange-600 font-medium">
//                                                                 {receive?.businessCategory?.join(', ')}
//                                                             </p>
//                                                             <p className='text-sm'>{format(new Date(receive.date), 'PPpp')}</p>

//                                                         </div>
//                                                         <div className="mt-2 d-flex align-items-center justify-content-between">
//                                                             <p className="text-sm font-medium text-gray-700">User Rating:</p>
//                                                             <div className="flex items-center">
//                                                                 {renderStars(receive?.userAverageRating || 0, 5)}
//                                                                 <span className="ml-2 text-sm font-medium text-gray-600">
//                                                                     {receive?.userAverageRating?.toFixed(1) || "0.0"}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                         <div className="mt-2 d-flex align-items-center justify-content-between">
//                                                             <p className="text-sm font-medium text-gray-700">Provider Rating:</p>
//                                                             <div className="flex items-center">
//                                                                 {renderStars(receive?.providerAverageRating || 0, 5)}
//                                                                 <span className="ml-2 text-sm font-medium text-gray-600">
//                                                                     {receive?.providerAverageRating?.toFixed(1) || "0.0"}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                         <div className="mt-3 flex gap-2">
//                                                             <Link
//                                                                 to={`tel:${receive?.phone}`}
//                                                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
//                                                             >
//                                                                 <FaPhone /> Contact
//                                                             </Link>
//                                                             <button
//                                                                 onClick={() => handleDelete(receive?._id)}
//                                                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                                                             >
//                                                                 Delete
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="col-12 text-center py-12">
//                                             <h3 className="text-xl font-medium text-gray-600">No Requests Found</h3>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </>
//     )
// }

// export default Senedrequest
import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import starGold from "../../public/starRating.png";
import starSilver from "../../public/startSilver.png";
import ProfileIcon from "../../public/User_icon.webp";
import { Link } from 'react-router-dom';
import axios from 'axios';
const backend_API = import.meta.env.VITE_API_URL;


const Senedrequest = ({ sendedRequest, setSendedRequest }) => {

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rating, setRating] = useState(0);
    const token = JSON.parse(localStorage.getItem('token'));
    console.log(sendedRequest, "sendedRequest");
    const cancelRequest = async (id, requestId, status) => {
        console.log(id, status, requestId, "id, status, requestId");
        try {
            const response = await axios.post(`${backend_API}/request/updateRequestStatus`, { userId: id, requestId, status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response, "response cancel request");
            if (response.status === 200) {
                toast.success(`Request ${status}`);
                setSendedRequest((prev) =>
                    prev?.map((req) => (req._id === id ? { ...req, status } : req))
                );

            } else {
                toast.error("Failed to update request");
            }
        } catch (error) {
            console.log(error, "error");
            toast.error(error?.response?.data?.message || "Failed to update request");
        }

    };


    const openModal = (request) => {
        setSelectedRequest(request);
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setRating(0);
    };
    const submitRating = async (senderId, requestId, ratingValue) => {
        console.log(senderId, requestId, ratingValue, "senderId, requestId, ratingValue");
        if (!selectedRequest) return;

        try {
            const response = await axios.post(`${backend_API}/user/rate`, {
                receiverId: senderId,
                requestId: requestId,
                ratingValue: ratingValue,
                comment: "",
            }, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                toast.success(response.data.message || "Rating submitted successfully");
                setSendedRequest((prev) =>
                    prev.map((req) =>
                        req.requestId === requestId
                            ? { ...req, userRating: ratingValue, status: "rated" } // ✅ Update status
                            : req
                    )
                );
                closeModal();

            } else {
                console.log(response, "response");
                toast.error("Failed to submit rating.");
            }
        } catch (error) {
            console.log(error, "error");
            toast.error(error?.response?.data?.message || "Failed to submit rating.");
        }
    };
    const renderStars = (ratingValue = 0, maxRating = 10, isClickable = false) => {
        return Array.from({ length: maxRating }, (_, i) => (
            <img
                key={i}
                src={i < ratingValue ? starGold : starSilver}
                alt={i < ratingValue ? "Filled Star" : "Empty Star"}
                width={22}
                className={`cursor-pointer ${isClickable ? "hover:opacity-80" : ""}`}
                onClick={isClickable ? () => {
                    console.log("Star Clicked:", i + 1);
                    setRating(i + 1);
                } : undefined}
            />
        ));
    };


    return (
        <div className="mt-0">
            <section className="">
                <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                        {sendedRequest?.length ? (
                            sendedRequest.map((send, i) => (
                                <div key={i} title={
                                    send.status === "cancelled"
                                        ? "Sender has cancelled the request."
                                        : send.status === "rejected"
                                            ? "Receiver has rejected the request."
                                            : send.status === "completed"
                                                ? "Request completed rate the user"
                                                : send.status === "accepted"
                                                    ? "Request accepted contact the user"
                                                    : ""

                                } className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${["rejected", "cancelled"].includes(send.status) ? "opacity-50 grayscale" : ""}`}>
                                    <div className="relative">
                                        <img className="w-full h-70 object-cover object-top"
                                            src={send.profilePic || ProfileIcon}
                                            alt="Profile"
                                        />
                                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                                        ${send.status === "accepted" ? "bg-blue-600" : send.status === "completed" ? "bg-green-600" : "bg-yellow-500"} text-white`}>
                                            {send.status || "Pending"}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-orange-600 font-semibold capitalize">
                                                {send.businessCategory?.join(", ") || "N/A"}
                                            </p>
                                            <p className="text-sm">{format(new Date(send.date), "PPpp")}</p>
                                        </div>
                                        <h4 className="pt-1 font-semibold text-lg">{send.name || "Unknown User"}</h4>
                                        <p className="text-sm text-gray-600 py-1">{send.email || "No email provided"}</p>
                                        <div className="flex items-center ">
                                            <p className="text-sm font-semibold pe-1">ServiceProvider:</p>

                                            {renderStars(send.providerAverageRating || 0, 10)}
                                            <span className="pl-2">{send.providerAverageRating || 0}</span>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <p className="text-sm font-semibold pe-1">UserRating:</p>
                                            {renderStars(send.userAverageRating || 0, 10)}
                                            <span className="pl-2">{send.userAverageRating || 0}</span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            {send.status === "accepted" && (
                                                <>
                                                    <a
                                                        href={`tel:${send.phone}`}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <FaPhone /> Contact Now
                                                    </a>
                                                    <button
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        onClick={() => cancelRequest(send.receiverId, send.requestId, "completed")}
                                                    >
                                                        Completed
                                                    </button>
                                                </>
                                            )}
                                            {send.status === "completed" && (
                                                <button
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                                                    onClick={() => openModal(send)}
                                                >
                                                    Rate User
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <h5>No Requests Found</h5>
                                <p className="text-gray-500">Your sent requests will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Rating Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Rate {selectedRequest.name}</h3>
                        <div className="flex justify-center mb-4">{renderStars(rating, 10, true)}</div>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 bg-gray-400 text-white rounded-lg" onClick={closeModal}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => submitRating(selectedRequest.receiverId, selectedRequest.requestId, rating)}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );

};


export default Senedrequest;