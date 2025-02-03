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

const Profile = () => {
    const { user } = useContext(UserContext);
    const [linkCopied, setLinkCopied] = useState(false);
    const navigate = useNavigate();

    // const referralLink = `https://ess-frontend-eight.vercel.app/register?referralCode=${user?.referralCode}`;
    const referralLink = `https://ees121.com/register?referralCode=${user?.phone}`;

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
                            <div className="col-12">
                                <div className="card rounded-md overflow-hidden border-0 bg-base-100 shadow-xl">
                                    <div className="w-full position-relative bg-orange flex items-center justify-center">
                                        <img className='h-[200px] w-full' src="https://img.freepik.com/free-vector/colorful-watercolor-texture-background_1035-19319.jpg?ga=GA1.1.897959581.1731651336&semt=ais_hybrid" alt="profile" />
                                        <div className="avatar">
                                          
                                            <UpdateProfilePic user={user} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="col-12 d-flex flex-wrap">
                                            <div className="col-12 col-md-6 p-5">
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
                                                <h6 className='py-3 text-gray'>{user?.email}</h6>
                                                <p className='text-gray pb-3'> +91{user?.phone}</p>
                                                <CurrentLocation user={user} />
                                                <div className="flex">
                                                    <button onClick={() => navigate(`/editprofile`, { state: user })} className="text-orange py-3 rounded-full font-semibold uppercase text-sm">Edit Profile</button>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6 d-flex justify-content-md-end justify-content-start">
                                                <div className='p-5 w-full'>
                                                    <p className='text-gray'>Your Referral Link :</p>
                                                    <p onClick={copyToClipboard} className="text-blue-500 cursor-pointer">{referralLink}</p>
                                                    {linkCopied && <p className="text-green-500">Link copied!</p>}
                                                    <Link to={`whatsapp://send?text=${referralLink}`} className=' bg-blue text-white p-0 text-sm p-1 rounded-1'>
                                                        Share
                                                    </Link>
                                                    {
                                                        user?.userId && (  <div className='pt-3'>
                                                            <p className='text-gray'>Unique Id : <strong>EES121-{user?.userId}</strong></p>
                                                            
                                                            </div>)
                                                    }
                                                   

                                                    <h6 className='text-gray py-3'>Business Category <PiShoppingBagLight className='inline-block' /></h6>
                                                    {user?.businessCategory && (
                                                        <div className='btn d-flex justify-content-center text-uppercase rounded-md text-white bg-orange py-2'>{user.businessCategory}</div>
                                                    )}


                                                    <div className='pt-4'>
                                                        <BannerAdd />
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

                <AllBannners />
            </div>
            <Footer/>
        </>
    );
}

export default Profile;
