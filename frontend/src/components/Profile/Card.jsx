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
import { MdDelete, MdAddPhotoAlternate } from "react-icons/md";
import { Link } from 'react-router-dom';
const backend_API = import.meta.env.VITE_API_URL;


const Card = () => {
    const token = JSON.parse(localStorage.getItem('token'));
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const referralLink = `https://ees121.com/register?referralCode=${user?.phone}`;
    // State to manage availability
    const [isAvailable, setIsAvailable] = useState(() => {
        const savedStatus = localStorage.getItem('isAvailable');
        return savedStatus === 'true';
    });

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

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
                { userstatus: newStatus ? "available" : "unavailable" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response, "response");
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

    // Add new states for image zoom modal
    const [showImageModal, setShowImageModal] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);

    // Add function to handle image click
    const handleImageClick = (imageSrc) => {
        setZoomedImage(imageSrc);
        setShowImageModal(true);
    };

    // Add Image Modal Component
    const ImageModal = ({ image, onClose }) => {
        if (!image) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
                onClick={onClose}
            >
                <div className="relative max-w-4xl w-90 mx-4">
                    <button
                        className="absolute -top-10 right-0 text-white text-xl font-bold"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                    <img
                        src={image}
                        alt="Zoomed"
                        className="w-100 h-auto rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        );
    };

    // Add new states
    const [banner, setBanner] = useState(null);
    const [existingBanner, setExistingBanner] = useState(null);
    const [bannerId, setBannerId] = useState(null);

    // Fetch existing banner on component mount
    useEffect(() => {
        fetchUserBanner();
    }, []);

    // Function to fetch user's banner
    const fetchUserBanner = async () => {
        try {
            const response = await axios.get(`${backend_API}/banner/getBanners`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // console.log("Banner response:", response.data.banners[0]);

            // Check if banners array exists and has at least one item
            if (response.data.success && response.data.banners?.length > 0) {
                // Use proper image URL path from the response
                const bannerUrl = response.data.banners[0].imageUrl;
                // console.log("Banner:", banner);
                setExistingBanner(bannerUrl);
                setPreview(bannerUrl);
                setBannerId(response?.data?.banners[0]?._id);
            }
        } catch (error) {
            console.error("Error fetching banner:", error);
        }
    };
    // Handle banner image selection
    const handleBannerChange = async (e) => {

        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }

        if (file) {
            const formData = new FormData();
            formData.append('banner', file);

            try {
                setLoading(true);
                const response = await axios.post(
                    `${backend_API}/banner/addBanner`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log("Banner upload response:", response.data); // Debug log
                if (response.data.success) {
                    toast.success("Banner added successfully");
                    // Update the banner state with the direct image URL
                    setExistingBanner(response.data.banner.bannerImage || response.data.banner);
                    setBannerId(response?.data?.banner?._id);
                    // console.log(response?.data?.banner?._id, "bannerrrId");
                }
            } catch (error) {
                console.error("Banner upload error:", error);
                toast.error(error.response?.data?.message || "Error adding banner");
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle banner delete
    const handleDeleteBanner = async (bannerId) => {
        // setPreview(null);
        console.log(bannerId, "bannerId");
        toast.info(
            <div>
                <p>Are you sure you want to delete this Banner?</p>

                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(bannerId)}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
                </div>
            </div>,
            { autoClose: true, closeOnClick: true }
        );
    };

    const confirmDelete = async (bannerId) => {
        toast.dismiss(); // Close the confirmation toast


        try {
            const response = await axios.delete(`${backend_API}/banner/deleteBanner`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                data: { bannerId }, // Pass bannerId in request body
            });

            if (response.status === 200) {
                console.log("Banner deleted successfully");
                window.location.reload();
                toast.success("Banner deleted successfully");
                setPreview(null);
            }
        } catch (error) {
            toast.error('Error deleting banner. Please try again later.');
            console.error("Error deleting banner:", error);
        } finally {
            setLoading(false);
        }



    };

    return (
        <section>
            {/* Add Modal */}
            {showImageModal && (
                <ImageModal
                    image={zoomedImage}
                    onClose={() => setShowImageModal(false)}
                />
            )}



            <div className="container">
                <div className="row flex" >
                    {/* Banner Section */}
                    <div className="p-4 border-0 shadow-xl">
                        <div className="col-12 d-flex flex-col flex-md-row">
                            {/* Profile Picture Section */}
                            <div className="col-12 col-md-4">
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
                            <div className="col-12 col-md-4 text-gray-700 justify-content-start">
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

                                <div className="p-2">

                                    <p className='text-gray'>Your Referral Link :</p>
                                    <p onClick={copyToClipboard} className="text-blue-500 cursor-pointer">{referralLink}</p>
                                    {linkCopied && <p className="text-green-500">Link copied!</p>}
                                    <Link to={`whatsapp://send?text=${referralLink}`} className=' bg-blue text-white text-sm p-1 rounded-1'>
                                        Share
                                    </Link>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                {existingBanner ? (
                                    <div className="position-relative">
                                        {preview && <img src={preview} alt="Banner Preview" className="w-full h-auto" />}

                                        <button
                                            className="btn btn-danger position-absolute top-0 end-0 m-2"

                                            onClick={() => handleDeleteBanner(bannerId)}
                                            disabled={loading}
                                        >
                                            <MdDelete className="fs-5" />

                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded p-4 text-center">
                                        <label className="btn btn-outline-primary" htmlFor="banner-upload" disabled={loading}>
                                            <MdAddPhotoAlternate className="me-1 fs-5" />
                                            Add Banner
                                            <input
                                                type="file"
                                                id="banner-upload"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
};

export default Card;
