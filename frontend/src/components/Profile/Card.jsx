import { FaStar } from 'react-icons/fa';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext';
import axios from 'axios'; // Add axios for API requests
import { toast } from 'react-toastify';
import GetUserRating from './GetUserRating';
import CurrentLocation from './CurrentLocation';
import ProfileIcon from "../../../public/User_icon.webp"
import starGold from "../../../public/starRating.png"
import starSilver from "../../../public/startSilver.png"
const backend_API = import.meta.env.VITE_API_URL;

const Card = () => {
    const token = JSON.parse(localStorage.getItem('token'));
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);

    // State to manage availability
    const [isAvailable, setIsAvailable] = useState(() => {
        const savedStatus = localStorage.getItem('isAvailable');
        return savedStatus === 'true';
    });

    // Update local storage whenever the state changes
    useEffect(() => {
        localStorage.setItem('isAvailable', isAvailable);
    }, [isAvailable]);

    // Handle checkbox change and update status in backend
    const handleCheckboxChange = async (e) => {
        const newStatus = e.target.checked;
        setIsAvailable(newStatus);
        setLoading(true);
        try {
            const response = await axios.put(
                `${backend_API}/auth/setUserStatus`,
                { userstatus: newStatus ? 'available' : 'unavailable' },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 200) {
                toast.success('User status updated successfully');
            }
        } catch (error) {
            toast.error('Error updating user status');
            console.error('Error updating user status:', error);
            // toast(error?.response?.data?.message)
        } finally {
            setLoading(false);
        }
    };

    // Render stars for the rating
  
    const renderStar = (ratings = [], maxRating = 10) => {
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

    // Handle user rating display
    const userRating = user?.userRatings?.length
        ? user?.userRatings.reduce((acc, curr) => acc + curr.rating, 0) / user?.userRatings.length
        : 0; // Average rating if available, otherwise default to 0.
    const ProviderRating = user?.providerRatings?.length
        ? user?.providerRatings.reduce((acc, curr) => acc + curr.rating, 0) / user?.providerRatings.length
        : 0; // Average rating if available, otherwise default to 0.

    return (
        <section>
            <div className="container">
                <div className="row">
                    <div className="p-4 border-0 shadow-xl">
                        <div className="col-12 d-flex">
                            {/* Profile Picture Section */}
                            <div className="col-5 col-md-4">
                                <div className="w-100 text-center ">
                                    <div className='d-flex justify-content-center'>
                                        <div className="img-card w-[250px] h-[200px] d-flex overflow-hidden justify-content-center">
                                            <img
                                                className="rounded-md img-fluid w-100 overflow-hidden"
                                                src={user?.profilePic || ProfileIcon}
                                                alt="User"

                                            />
                                        </div>
                                    </div>
                                    <div className="pt-3 w-100">
                                        <h3 className=" pb-1">{user?.name}</h3>
                                        <div className='d-md-none'>
                                        <div className="rating rating-sm d-flex flex-column text-start">
                                            <strong className='text-sm' >User :</strong>
                                            <div>
                                                {
                                                    user?.userRatings ? (
                                                        <div className=' d-flex align-items-center'>
                                                            {renderStars(user?.userRatings.map((r) => {
                                                                return r.rating
                                                            }), 10,)}
                                                            <span className="ps-2 ">{user?.userAverageRating

                                                            }</span>
                                                            {/* <FaStar className= {` ${Usersdata.ratings ? "d-flex" : "d-none"}`}  /> */}
                                                        </div>
                                                    ) : (<></>)
                                                }
                                            </div>

                                        </div>
                                        <div className="rating rating-sm d-flex flex-column  text-start">
                                            <strong className='text-sm' >Provider :</strong>
                                            <div>
                                                {
                                                    user?.providerRatings ? (
                                                        <div className=' d-flex align-items-center'>
                                                            {renderStar(user?.providerRatings.map((r) => {
                                                                return r.rating
                                                            }), 10,)}
                                                            <span className="ps-2 ">{user?.providerAverageRating
                                                            }</span>
                                                            {/* <FaStar className= {` ${Usersdata.ratings ? "d-flex" : "d-none"}`}  /> */}
                                                        </div>
                                                    ) : (<></>)
                                                }
                                            </div>

                                        </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                            {/* Profile Details Section */}
                            <div className="col-7 col-md-8 text-gray-700">
                                <div className="px-2 d-none d-md-none ">
                                    <h1 className="fs-3">{user?.name}</h1>
                                </div>

                                {/* Email */}
                                <div className="p-2 d-flex">
                                    <div className="d-none d-md-flex col-4 col-md-2">
                                        <h6>Email</h6>
                                    </div>
                                    <div className="col-12 col-md-10 ps-3 text-gray">
                                        <p className='text'>{user?.email}</p>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="p-2 d-flex">
                                    <div className="d-none d-md-flex col-4 col-md-2">
                                        <h6>Contact</h6>
                                    </div>
                                    <div className="col-12 col-md-10 ps-3 text-gray">
                                        <p>{user?.phone}</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="p-2 d-flex">
                                    <div className="d-none d-md-flex col-4 col-md-2">
                                        <h6>Address</h6>
                                    </div>
                                    <div className="col-12 col-md-10 ps-3 text-gray">
                                        {/* <p>{user?.address?.area} {user?.address?.city} {user?.address?.state} {user?.address?.country} {user?.address?.pincode}</p> */}
                                        <CurrentLocation user={user} />
                                    </div>
                                </div>

                                {/* Availability Status */}
                                <div className="p-2 d-flex">
                                    <div className="d-none d-md-flex col-4 col-md-2 text-sm">
                                        <h6>Status</h6>
                                    </div>
                                    <div className="col-12 col-md-10 ps-3">
                                        <div className="checkbox-con d-flex align-items-center">
                                            <input
                                                id="checkbox"
                                                type="checkbox"
                                                checked={isAvailable}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className={`ms-2 ${isAvailable ? 'text-success' : 'text-danger'}`}>
                                                {isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ratings */}
                                <div className="p-2 d-flex d-md-flex d-none ">
                                    <div className="d-none d-md-flex col-4 col-md-2 text-sm">
                                        <h6>Ratings</h6>
                                    </div>
                                    <div className="col-12 col-md-10 ps-3">
                                        
                                        <div className="rating rating-sm d-flex flex-column ">
                                            <strong className='text-sm' >User :</strong>
                                            <div>
                                                {
                                                    user?.userRatings ? (
                                                        <div className=' d-flex align-items-center'>
                                                            {renderStars(user?.userRatings.map((r) => {
                                                                return r.rating
                                                            }), 10,)}
                                                            <span className="ps-2 ">{user?.userAverageRating

                                                            }</span>
                                                            {/* <FaStar className= {` ${Usersdata.ratings ? "d-flex" : "d-none"}`}  /> */}
                                                        </div>
                                                    ) : (<></>)
                                                }
                                            </div>

                                        </div>
                                        <div className="rating rating-sm d-flex flex-column ">
                                            <strong className='text-sm' >Provider :</strong>
                                            <div>
                                                {
                                                    user?.providerRatings ? (
                                                        <div className=' d-flex align-items-center'>
                                                            {renderStar(user?.providerRatings.map((r) => {
                                                                return r.rating
                                                            }), 10,)}
                                                            <span className="ps-2 ">{user?.providerAverageRating
                                                            }</span>
                                                            {/* <FaStar className= {` ${Usersdata.ratings ? "d-flex" : "d-none"}`}  /> */}
                                                        </div>
                                                    ) : (<></>)
                                                }
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Card;
