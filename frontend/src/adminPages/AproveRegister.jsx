import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline, MdDateRange } from "react-icons/md";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../admincomponents/AdminHeader';
import AdminSidebar from '../admincomponents/AdminSidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { IoArrowBack } from "react-icons/io5";

const backend_API = import.meta.env.VITE_API_URL;

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onApprove }) => {
    const [zoomedImage, setZoomedImage] = useState(null);

    if (!user) return null;

    const handleApproveClick = (e) => {
        e.stopPropagation();
        onApprove(user._id);
    };

    const toggleZoom = (image) => {
        setZoomedImage(zoomedImage === image ? null : image);
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="modal-content bg-white p-2 rounded shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-4xl h-[80vh] overflow-hidden">
                <h2 className="text-xl font-bold py-3 text-center border">User Details</h2>
                <div className="modal-body overflow-y-auto">
                    <table className="table-auto w-full border-collapse border border-gray-300">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">ProfilePic</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <img src={user.profilePic} width={50} alt="Profile" />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Name</td>
                                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Email</td>
                                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Contact</td>
                                <td className="border border-gray-300 px-4 py-2">{user.phone}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Address</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {`${user?.address?.area} ${user?.address?.city} ${user?.address?.state} ${user?.address?.country} ${user?.address?.pincode}`}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Business Name</td>
                                <td className="border border-gray-300 px-4 py-2">{user.businessName}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Business Category</td>
                                <td className="border border-gray-300 px-4 py-2">{user.businessCategory}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Business Address</td>
                                <td className="border border-gray-300 px-4 py-2">{user.businessAddress}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Aadhar</td>
                                <td className="border border-gray-300 px-4 py-2 flex gap-2">
                                    <img
                                        src={user.frontAadhar}
                                        width={50}
                                        alt="Front Aadhar"
                                        className="cursor-pointer"
                                        onClick={() => toggleZoom(user.frontAadhar)}
                                    />
                                    <img
                                        src={user.backAadhar}
                                        width={50}
                                        alt="Back Aadhar"
                                        className="cursor-pointer"
                                        onClick={() => toggleZoom(user.backAadhar)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Referred By</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {user.referredBy && user.referredBy.length > 0
                                        ? user.referredBy.map(referrer => referrer.phone || 'Unknown').join(', ')
                                        : 'None'
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between mt-4 gap-1">
                    <button onClick={handleApproveClick} className="btn btn-primary w-full sm:w-auto">Approve</button>
                    <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto">Close</button>
                </div>
            </div>

            {/* Zoomed Image Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[60]"
                    onClick={() => setZoomedImage(null)}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed Aadhar"
                        className="max-w-[90%] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

// All Users Component
const AllUsers = () => {
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await axios.get(`${backend_API}/auth/getAllUser`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.data;
            console.log(data, 'data');
            const filteredUsers = data.user
                .filter(user => user.isAdminApproved === false)
                .map(user => ({
                    ...user,
                    referredBy: Array.isArray(user.referredBy) ? user.referredBy : []
                }));
            console.log('Users with referral info:', filteredUsers);
            setUserList(filteredUsers);
        } catch (error) {
            console.error('Error:', error.message);
            toast(error?.response?.data?.message)
        }
    };

    // Fetch Categories from backend
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backend_API}/category/getAllCategory`);
            const sortedCategories = response.data.category.sort((a, b) =>
                a.categoryName.localeCompare(b.categoryName)
            );
            setCategories(sortedCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const deleteUser = async (uid) => {
        toast.info(
            <div>
                <p>Are you sure you want to delete ?</p>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(uid)}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
                </div>
            </div>,
            { autoClose: true, closeOnClick: true }
        );
    };
    const confirmDelete = async (uid) => {
        toast.dismiss(); // Close the confirmation toast


        try {
            const response = await axios.delete(`${backend_API}/auth/deleteUser`, {
                headers: { 'Content-Type': 'application/json' },
                data: { id: uid },
            });
            if (response.status === 200) {
                toast(response?.data?.message)
                fetchData();
            }
        } catch (error) {
            console.error('Error:', error.message);
            toast(error?.response?.data?.message)
        }
    };

    const approveUser = async (userId) => {
        try {
            const response = await axios.put(`${backend_API}/auth/approveUser`, { userId }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                toast(response?.data?.message)
                fetchData(); // Refresh the user list after approval
            }
        } catch (error) {
            console.log(error.response.data);
            toast(error?.response?.data?.message)
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    const filteredUserList = userList
        .filter(user => {
            if (selectedDate && filter === 'date') {
                const userDate = new Date(user.createdAt).toLocaleDateString();
                const filterDate = selectedDate.toLocaleDateString();
                return userDate === filterDate;
            }
            if (selectedCategory && filter === 'category') {
                return user.businessCategory.includes(selectedCategory);
            }
            return true;
        })
        .sort((a, b) => {
            if (filter === 'A-Z') {
                return b.name.localeCompare(a.name);
            } else if (filter === 'Z-A') {
                return a.name.localeCompare(b.name);
            } else if (filter === 'date') {
                return new Date(b.date) - new Date(a.date);
            }
            return 0;
        });


    return (
        <>
            <AdminHeader />
            <AdminSidebar />
            <div className="my-32">

                <section>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex justify-content-between align-items-end">
                                    <div className="col-2 flex justify-content-center">
                                        <button
                                            onClick={() => navigate('/admin')}
                                            className="btn btn-light d-flex align-items-center gap-2 border hover:bg-gray-100"
                                        >
                                            <IoArrowBack size={20} />
                                            <span>Back to Dashboard</span>
                                        </button>
                                    </div>
                                    <div className="col-8 flex align-items-end justify-content-end">
                                        <div className="col-12 col-md-5">
                                            <div>
                                                <label htmlFor="role" className="form-label">Select filter</label>
                                                <select
                                                    id="role"
                                                    className="form-select"
                                                    value={filter}
                                                    onChange={(e) => setFilter(e.target.value)}
                                                >
                                                    <option value="">All</option>
                                                    <option value="A-Z">A-Z</option>
                                                    <option value="Z-A">Z-A</option>
                                                    <option value="date">DATE</option>
                                                    <option value="category">Category</option>
                                                </select>
                                            </div>
                                            {filter === 'date' && (
                                                <div className="mt-3">
                                                    <label className="form-label">Select Date</label>
                                                    <div className="input-group">
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="yyyy-MM-dd"
                                                            className="form-control"
                                                        />
                                                        <span className="input-group-text">
                                                            <MdDateRange />
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {filter === 'category' && (
                                                <div className="mt-3">
                                                    <label className="form-label">Select Category</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                    >
                                                        <option value="">All Categories</option>
                                                        {categories.map((category) => (
                                                            <option key={category._id} value={category.categoryName}>
                                                                {category.categoryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12 col-md-3 mt-4 flex justify-content-center">
                                            <button
                                                onClick={() => navigate('/admin/users')}
                                                className="btn btn-primary d-flex align-items-center gap-2"
                                            >
                                                <span>View All Users</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-arrow-right"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="container-fluid">
                        <div className="card bg-base-100 shadow-xl mt-5">
                            <div className="card-header text-xl text-bold z-0 py-3">Register Users</div>
                            <div className="table-container">
                                <table className="table table-bordered z-30 border">
                                    <thead className="text-bold text-[15px] text-black z-30">
                                        <tr>
                                            <th>SrNo</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Contact</th>
                                            <th>Address</th>
                                            <th>Business Name</th>
                                            <th>Business Category</th>
                                            <th>Business Address</th>
                                            <th>Referred By</th>
                                            <th>Payment Status</th>
                                            <th>Approve</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUserList.reverse().map((user, index) => (
                                            <tr key={user._id} onClick={() => handleRowClick(user)}>
                                                <th>{index + 1}</th>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>
                                                    {user?.address?.area} {user?.address?.city} {user?.address?.state}
                                                    {user?.address?.country} {user?.address?.pincode}
                                                </td>
                                                <td>{user.businessName}</td>
                                                <td>{user.businessCategory}</td>
                                                <td>{user.businessAddress}</td>
                                                <td>
                                                    {user.referredBy && user.referredBy.length > 0 ? (
                                                        user.referredBy.map(referrer => referrer.phone || 'Unknown').join(', ')
                                                    ) : (
                                                        'None'
                                                    )}
                                                </td>
                                                <td>
                                                    {user.paymentVerified ? (
                                                        <button className="btn btn-success btn-sm flex items-center gap-1" title="Payment Verified">
                                                            Payment Verified
                                                        </button>


                                                    ) : (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            title="Payment Not Verified"
                                                        >
                                                            Payment Not Verified
                                                        </button>

                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            approveUser(user._id);
                                                        }}
                                                        className="btn fs-6 bg-blue text-white py-1 px-2 sm:px-4 rounded">
                                                        Approve
                                                    </button>
                                                </td>
                                                <td className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteUser(user._id); }}
                                                        className="btn-xl m-1 fs-3 text-primary">
                                                        <MdOutlineDeleteOutline />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/editUser`, { state: user }); }}
                                                        className="btn-xl fs-4 text-green-500">
                                                        <FaEdit />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} onApprove={approveUser} />}
            </div>
        </>
    );
};

export default AllUsers;
