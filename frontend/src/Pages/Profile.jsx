import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiShoppingBagLight } from "react-icons/pi";
import { FaStar } from 'react-icons/fa';
import UserSideBar from '../components/UserSideBar';
import AdminNavbar from '../admincomponents/AdminNavbar';
import BannerAdd from '../components/ProfileBanner/BannerAdd';
import AllBannners from '../components/ProfileBanner/AllBannners';
import { UserContext } from '../UserContext';
import ProfileSidebar from '../components/ProfileSidebar';
import GetUserRating from '../components/Profile/GetUserRating';
import CurrentLocation from '../components/Profile/CurrentLocation';
import UpdateProfilePic from '../components/Profile/UpdateProfilePic';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import starGold from "../../public/starRating.png"
import starSilver from "../../public/startSilver.png"
import { BsClipboardCheckFill, BsClipboardCheck } from "react-icons/bs";
import { FaShare } from "react-icons/fa";

const Profile = () => {
    const { user } = useContext(UserContext);
    const [linkCopied, setLinkCopied] = useState(false);
    const navigate = useNavigate();

    // const referralLink = `https://ess-frontend-eight.vercel.app/register?referralCode=${user?.referralCode}`;
    const referralLink = `${window.location.origin}/register?referralCode=${user?._id}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };


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

    return (
        <>
            <AdminNavbar />
            <UserSideBar />
            <ProfileSidebar />
            <div className='my-24'>
                <section className=''>
                    <div className="container">
                        <div className="row">
                            <div className="w-full bg-white p-6 rounded-lg shadow-md">
                                {/* Banner with Profile Pic */}
                                <div className="relative w-full">
                                    <img
                                        className="w-full h-[200px] object-cover rounded-md"
                                        src="https://img.freepik.com/free-vector/colorful-watercolor-texture-background_1035-19319.jpg?ga=GA1.1.897959581.1731651336&semt=ais_hybrid"
                                        alt="Banner"
                                    />
                                    <div className="absolute bottom-[-70px] right-14 w-[200px] h-[200px] rounded-full border-4 border-white ring-4 ring-orange-500 shadow-lg overflow-hidden">
                                        <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="px-3 md:px-5">

                                    {/* Profile Details */}
                                    <div className="mt-24 md:mt-8 text-left sm:text-left">
                                        <h2 className="text-4xl font-bold text-gray-700">{user?.name}</h2>
                                        {user?.profilePic ? null : <p className="text-orange text-sm">You haven't set a profile picture yet.</p>}

                                        {/* Ratings Section */}
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <strong className="text-sm">User Rating:</strong>
                                                {user?.userRatings && (
                                                    <div className="flex items-center">
                                                        {renderStars(user?.userRatings.map((r) => r.rating), 10)}
                                                        <span className="pl-2">{user?.userAverageRating}.0</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <strong className="text-sm">Provider Rating:</strong>
                                                {user?.providerRatings && (
                                                    <div className="flex items-center">
                                                        {renderStar(user?.providerRatings.map((r) => r.rating), 10)}
                                                        <span className="pl-2">{user?.providerAverageRating}.0</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="mt-4 text-gray-700 space-y-2">
                                            <p><strong>Email:</strong> {user?.email}</p>
                                            <p><strong>Phone:</strong> +91{user?.phone}</p>
                                            <CurrentLocation user={user} />
                                        </div>
                                    </div>

                                    {/* Referral Section */}
                                    <div className="mt-6 bg-gray-100 p-4 rounded-md">
                                        <p className="text-gray-600 font-medium">Your Referral Link:</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-blue-600 font-medium truncate">{referralLink}</span>
                                            <button onClick={copyToClipboard} className="text-gray-500 hover:text-blue-500">
                                                {linkCopied ? <BsClipboardCheck size={20} /> : <BsClipboardCheckFill size={20} />}
                                            </button>
                                            <Link to={`whatsapp://send?text=${referralLink}`} className="text-white bg-orange text-sm p-2 rounded-md flex items-center">
                                                <FaShare size={16} />
                                            </Link>
                                        </div>
                                        {linkCopied && <p className="text-green-500 text-sm">Copied!</p>}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-4">
                                        {user?.userId && (
                                            <p className="text-gray-600 font-medium">Unique ID: <span className="text-gray-800 font-semibold">EES121-{user?.userId}</span></p>
                                        )}
                                        <p className="text-gray-600 font-medium">Business Category: <span className="text-gray-800 font-semibold">{user?.businessCategory}</span></p>
                                        <p className="text-gray-600 font-medium">Business Details: <span className="text-gray-800 font-semibold">{user?.businessDetaile}</span></p>
                                        <p className="text-gray-600 font-medium">Business Address: <span className="text-gray-800 font-semibold">{user?.businessAddress}</span></p>

                                        <div className="py-3">
                                            <span className="text-gray-600 font-medium">Status: </span>
                                            <span className={`font-semibold ${user?.userstatus === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                                                {user?.userstatus}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Aadhaar Section */}
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-md font-medium">Aadhaar Front</label>
                                            {user?.frontAadhar ? <img src={user?.frontAadhar} alt="Aadhaar Front" className="mt-2 w-[200px]" /> : <p>No Aadhaar Front uploaded</p>}
                                        </div>
                                        <div>
                                            <label className="block text-md font-medium">Aadhaar Back</label>
                                            {user?.backAadhar ? <img src={user?.backAadhar} alt="Aadhaar Back" className="mt-2 w-[200px]" /> : <p>No Aadhaar Back uploaded</p>}
                                        </div>
                                    </div>

                                    {/* Edit Profile Button */}
                                    <div className="mt-6 flex justify-center sm:justify-end">
                                        <button onClick={() => navigate(`/editprofile`, { state: user })} className="bg-orange text-white py-2 px-4 rounded-full font-semibold uppercase text-sm">
                                            Edit Profile
                                        </button>
                                    </div>

                                    {/* Banner Ads */}
                                    <div className="mt-6">
                                        <BannerAdd />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >

                <AllBannners />
            </div >
            <Footer />
        </>
    );
}

export default Profile;
{/* <div className="col-12">
    <div className="card rounded-md overflow-hidden border-0 bg-base-100 shadow-xl">
        <div className="w-full position-relative bg-orange flex items-center justify-center">
            <img
                className="h-[200px] w-full object-cover"
                src="https://img.freepik.com/free-vector/colorful-watercolor-texture-background_1035-19319.jpg?ga=GA1.1.897959581.1731651336&semt=ais_hybrid"
                alt="banner"
            />
            <div className="absolute bottom-[-80px] left-[70px] w-[200px] h-[200px] rounded-full border-4 border-white ring-4 ring-orange-500 shadow-lg overflow-hidden">
                <img
                    src={user.profilePic}
                    alt="profile"
                    className="w-full h-full object-cover"
                />


            </div>

        </div>

        <button onClick={() => navigate(`/editprofile`, { state: user })} className="text-orange py-3 rounded-full font-semibold uppercase text-sm">Edit Profile</button>
        <div>
            <div className="col-12 d-flex flex-wrap">
                <div className="col-12 p-5">
                    <div className="pt-5 text-orange">
                        {
                            !user.profilePic ? (
                                <p> You haven't set a profile picture yet.</p>

                            ) : (
                                <></>
                            )
                        }
                    </div>

                    <h2 className="text-3xl font-bold text-gray-700">{user?.name}</h2>
                    <div className=''>
                        <div className="rating rating-sm d-flex flex-column text-start">

                            <div className="flex items-center gap-2">
                                <strong className="text-sm">User :</strong>
                                {user?.userRatings && (
                                    <div className="flex items-center">
                                        {renderStars(user?.userRatings.map((r) => r.rating), 10)}
                                        <span className="pl-2">{user?.userAverageRating}.0</span>
                                    </div>
                                )}
                            </div>


                        </div>
                        <div className="flex items-center gap-2">
                            <strong className="text-sm">Provider :</strong>
                            {user?.providerRatings && (
                                <div className="flex items-center">
                                    {renderStar(user?.providerRatings.map((r) => r.rating), 10)}
                                    <span className="pl-2">{user?.providerAverageRating}.0</span>
                                </div>
                            )}
                        </div>

                    </div>
                    <h6 className='py-3'><span className='text-gray-600 font-medium'>Email :</span> <span className='text-gray-800 font-semibold'>{user?.email}</span></h6>
                    <p className='pb-3'> <span className='text-gray-600 font-medium'>Phone :</span> <span className='text-gray-800 font-semibold'>+91{user?.phone}</span></p>
                    <CurrentLocation user={user} />
                    <div className="flex">

                    </div>
                </div>
                <div className="col-12 d-flex justify-content-md-end justify-content-start">
                    <div className='p-5 w-full'>
                        <div className="">
                            <p className="text-gray-600 font-medium">Your Referral Link:</p>
                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 my-2 rounded-md w-full sm:w-auto">
                                <span className="text-blue-600 font-medium truncate">{referralLink}</span>

                                <button onClick={copyToClipboard} className="text-gray-500 hover:text-blue-500">
                                    {linkCopied ? <BsClipboardCheck size={20} /> : <BsClipboardCheckFill size={20} />}
                                </button>

                                <Link
                                    to={`whatsapp://send?text=${referralLink}`}
                                    className="text-white bg-orange text-sm p-2 rounded-md flex items-center"
                                >
                                    <FaShare size={16} />
                                </Link>
                            </div>

                            {linkCopied && <p className="text-green-500 text-sm">Copied!</p>}

                        </div>
                        {
                            user?.userId && (<div className='pt-3'>
                                <p className='text-gray-600 font-medium'>Unique Id : <span className="text-gray-800 font-semibold"> EES121-{user?.userId}</span></p>

                            </div>)
                        }


                        <p className='text-gray py-3'>
                            <span className='text-gray-600 font-medium'>Business Category : </span>
                            <span className='text-gray-800 font-semibold'>
                                {user?.businessCategory}
                            </span>

                        </p>

                        <div className="my-1">
                            <label className="block text-md font-medium p-2 text-bold">Aadhaar Front</label>
                            {user?.frontAadhar ? (
                                <img src={user?.frontAadhar} alt="Aadhaar Front" className="mt-2" style={{ width: "200px" }} />
                            ) : (
                                <p>No Aadhaar Front uploaded</p>
                            )}
                        </div>

                        <div className="my-1">
                            <label className="block text-md font-medium p-2 text-bold">Aadhaar Back</label>
                            {user?.backAadhar ? (
                                <img src={user?.backAadhar} alt="Aadhaar Back" className="mt-2" style={{ width: "200px" }} />
                            ) : (
                                <p>No Aadhaar Back uploaded</p>
                            )}
                        </div>


                        <div className='pt-4'>
                            <BannerAdd />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div> */}