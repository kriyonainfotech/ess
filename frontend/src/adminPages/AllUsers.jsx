import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline, MdDateRange } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from '../admincomponents/AdminHeader';
import AdminSidebar from '../admincomponents/AdminSidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { SiTicktick } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx";

const backend_API = import.meta.env.VITE_API_URL;

const UserDetailsModal = ({ user, onClose, onApprove }) => {
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [zoomedProfile, setZoomedProfile] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState(user.permanentAddress || "");
  const [aadharNumber, setAadharNumber] = useState(user.aadharNumber || "");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [userId, setUserId] = useState(user._id);

  const aadharImages = [user.frontAadhar, user.backAadhar];

  if (!user) return null;

  const handleSave = async () => {
    console.log(permanentAddress, aadharNumber, userId, "permanentAddress, aadharNumber");
    try {
      setLoading(true);
      const response = await axios.put(`${backend_API}/auth/updateUserAddressAndAadhar`, {
        permanentAddress,
        aadharNumber,
        userId,
      });
      console.log(response.data);
      if (response.status === 200) {
        toast.success(response?.data?.message);
      }
    } catch (error) {
      console.log("Error updating user details:", error);
      toast.error(error?.response?.data?.message || "Failed to update user details");
    } finally {
      setLoading(false);
    }
  };

  const openZoomModal = (index) => {
    setZoomedIndex(index);
  };

  const closeZoomModal = () => {
    setZoomedIndex(null);
  };

  const handlePrevNext = (step) => {
    setZoomedIndex((prevIndex) => (prevIndex + step + aadharImages.length) % aadharImages.length);
  };

  const handleDeleteAadhar = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${backend_API}/auth/delete-aadhar`, {
        data: { userId }, // ✅ Correct way to send data in DELETE request
      });
      if (response.status === 200) {
        toast.success(response?.data?.message);
        onClose(); // Close modal after successful deletion
      }
    } catch (error) {
      console.error("Error deleting Aadhar:", error);
      toast.error(error?.response?.data?.message || "Failed to delete Aadhar images");
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backend_API}/auth/update-profile-pic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          profilePic: "https://res.cloudinary.com/dcfm0aowt/image/upload/v1739604108/user/phnbhd4onynoetzdxqjp.jpg"
        })
      });

      const data = await response.json();
      console.log(data, 'response of allow reset')
      if (response.ok) {
        setProfilePic(data.profilePic); // Update UI
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile picture.");
      }
    } catch (error) {
      console.log("API Error:", error);
      toast.error("Something went wrong while updating profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const resetProfilePic = () => {
    setProfilePic(user.profilePic); // Reset to original
    toast.info("Profile picture reset.");
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

      <div className="modal-content bg-white p-2 rounded shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-4xl h-[80vh] overflow-hidden">
        <h2 className="text-xl font-bold py-3 text-center border">User Details</h2>
        <div className="modal-body overflow-y-auto">
          <table className="table-auto w-full border-collapse border border-gray-300 bg-light">
            <tbody >
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Profile Picture</td>
                <td className="border border-gray-300 px-4 py-2 flex items-center justify-between gap-2">
                  <img src={profilePic} width={50} alt="Profile" className="cursor-pointer" onClick={() => setZoomedProfile(true)} />
                  <button onClick={updateProfilePic} className="bg-blue-500 text-white px-3 py-1 rounded" disabled={loading}>
                    {loading ? "Updating..." : "Allow Update"}
                  </button>

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
                <td className="border border-gray-300 px-4 py-2 flex items-center justify-between gap-2">
                  {aadharImages.filter(Boolean).length > 0 ? (
                    <div className="flex gap-2">
                      {aadharImages.map((img, index) => (
                        img && (
                          <img
                            key={index}
                            src={img}
                            width={50}
                            alt={`Aadhar ${index + 1}`}
                            className="cursor-pointer"
                            onClick={() => openZoomModal(index)}
                          />
                        )
                      ))}
                    </div>
                  ) : (
                    <span className="text-red-500">Photos Deleted</span>
                  )}
                  {aadharImages.filter(Boolean).length > 0 && (
                    <div className="flex flex-col justify-center">
                      <button onClick={handleDeleteAadhar} className="bg-red-500 text-white btn-sm px-4 py-1 rounded" disabled={loading}>
                        {loading ? "Deleting..." : "Delete Aadhar"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>


              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Permanent Address</td>
                <td className="border border-gray-300 px-4 py-2">{permanentAddress}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Aadhar Number</td>
                <td className="border border-gray-300 px-4 py-2">{aadharNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end m-0 gap-1 ">

          <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto">Close</button>
        </div>
      </div>
      {
        zoomedIndex !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[60]">
            <div className="bg-white p-4 rounded-lg flex relative">
              <button onClick={closeZoomModal} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">✖</button>
              <div className="flex items-center">
                <button onClick={() => handlePrevNext(-1)} className="px-4 py-2 bg-gray-300 rounded">⬅</button>
                <img src={aadharImages[zoomedIndex]} className="max-w-[70%] max-h-[90vh] object-contain mx-4" alt="Zoomed Aadhar" />
                <button onClick={() => handlePrevNext(1)} className="px-4 py-2 bg-gray-300 rounded">➡</button>
              </div>
              <div className="flex flex-col gap-4 w-1/3 p-4">
                <input type="text" className="border p-2 w-full" placeholder="Aadhar Number" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} />
                <input type="text" className="border p-2 w-full" placeholder="Permanent Address" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        )
      }

      {zoomedProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[60]">
          <div className="bg-white p-4 rounded-lg relative">
            <button onClick={() => setZoomedProfile(false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">✖</button>
            <img src={user.profilePic} className="max-w-full max-h-[90vh] object-contain" alt="Zoomed Profile" />
          </div>
        </div>
      )}
    </div >
  );
};

const AllUsers = () => {
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${backend_API}/auth/getAllUser`);
      console.log(response.data, "response.data");
      const filteredUsers = response.data.user.filter(user => user.isAdminApproved === true);
      // console.log(filteredUsers, "filteredUsers");
      setUserList(filteredUsers);
    } catch (error) {
      console.error('Error:', error.message);
      toast(error?.response?.data?.message);
    }
  };

  const deleteUser = async (uid) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete?</p>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(uid)}>Yes</button>
          <button className="btn btn-secondary btn-sm" onClick={toast.dismiss}>No</button>
        </div>
      </div>,
      { autoClose: true, closeOnClick: true }
    );
  };

  const confirmDelete = async (uid) => {
    toast.dismiss();
    try {
      const response = await axios.delete(`${backend_API}/auth/deleteUser`, {
        headers: { 'Content-Type': 'application/json' },
        data: { id: uid },
      });
      if (response.status === 200) {
        toast(response?.data?.message);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error.message);
      toast(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = userList.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  ).sort((a, b) => {
    if (filter === 'A-Z') {
      return b.name.localeCompare(a.name);
    } else if (filter === 'Z-A') {
      return a.name.localeCompare(b.name);
    } else if (filter === 'oldest-newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === 'newest-oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);

    }
    return 0;
  });

  const handleReferredUserClick = async (referredById) => {
    console.log(referredById, "referredById");
    if (!referredById) return;

    try {
      const response = await axios.get(`${backend_API}/auth/getUserById/${referredById}`);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error("Error fetching referred user:", error.message);
      toast(error?.response?.data?.message || "Failed to fetch referred user details");
    }
  };


  return (
    <>
      <AdminHeader />
      <AdminSidebar />
      <div className="my-32">
        <section>
          <div className="container-fluid">
            <div className="card bg-base-100 shadow-xl mt-5">
              <div className="card-header text-xl font-bold py-3">All Users</div>
              <div className="p-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Name, Email, or Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="form-select mt-2"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Sort By</option>
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                  <option value="oldest-newest">Oldest-Newest</option>
                  <option value="newest-oldest">Newest-Oldest</option>
                </select>
              </div>
              <div className="table-container">
                <table className="table table-bordered border">
                  <thead className="text-bold text-[15px] text-black bg-gray-100">
                    <tr>
                      <th>SrNo</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Referred By</th>
                      <th>UserStatus</th>
                      <th>Payment Status</th>
                      <th>Action</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.reverse().map((user, index) => (
                      <tr key={user._id}>
                        <th>{index + 1}</th>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{`${user?.address?.area}, ${user?.address?.city}, ${user?.address?.state}, ${user?.address?.country}, ${user?.address?.pincode}`}</td>
                        <td>
                          <button
                            className="btn btn-light border border-gray-300 btn-sm"
                            onClick={() => handleReferredUserClick(user?.referredBy[0]?._id)}
                          >
                            {user?.referredBy?.length > 0 ? user?.referredBy[0]?.name : "N/A"}
                          </button>
                        </td>
                        <td > {user?.userstatus === 'available' ?
                          <span className='btn btn-sm btn-success'>available</span> : <span className='btn btn-sm btn-danger'>unavailable</span>
                        }</td>
                        <td>
                          {user.paymentVerified ? (
                            <button className="btn btn-success btn-sm">
                              <span className="text-white flex items-center gap-2">Payment <SiTicktick /></span>
                            </button>
                          ) : (
                            <button className="btn btn-danger btn-sm">
                              <span className="text-white flex items-center gap-2">Payment <RxCrossCircled size={17} className='' /></span>
                            </button>
                          )}
                        </td>
                        <td className="d-flex">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Details
                          </button>
                          <button
                            className="btn btn-danger btn-sm ml-2"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-warning text-white btn-sm ml-2"
                            onClick={() => navigate(`/admin/editUser`, { state: user })}
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <Link
                            to="/admin/users/addremark"
                            state={{ userId: user._id }}
                            className="btn btn-sm btn-info"
                          >
                            Add Remarks
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </>
  );
};




export default AllUsers;
