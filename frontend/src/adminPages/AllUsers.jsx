import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline, MdDateRange } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../admincomponents/AdminHeader';
import AdminSidebar from '../admincomponents/AdminSidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { SiTicktick } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx";

const backend_API = import.meta.env.VITE_API_URL;

// User Details Modal
// const UserDetailsModal = ({ user, onClose }) => {
//   const [zoomedImage, setZoomedImage] = useState(null);
//   if (!user) return null;

//   const handleApproveClick = (e) => {
//     e.stopPropagation();
//     onApprove(user._id);
//   };

//   const toggleZoom = (image) => {
//     setZoomedImage(zoomedImage === image ? null : image);
//   };

//   return (
//     <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="modal-content bg-white  rounded shadow-lg w-full sm:w-2/4 md:w-1/2 lg:w-1/3 max-w-6xl h-[80vh] overflow-hidden">
//         <h2 className="text-xl font-bold my-4 text-center">User Details</h2>
//         <div className="modal-body overflow-x-auto "> {/* Make the body scrollable */}
//           <table className="table-auto w-full border-collapse border border-gray-300">
//             <tbody>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">ProfilePic</td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   <img src={user.profilePic} width={50} alt="" />
//                 </td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Name</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.name}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Email</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.email}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Contact</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.phone}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Address</td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   {`${user?.address?.area} ${user?.address?.city} ${user?.address?.state} ${user?.address?.country} ${user?.address?.pincode}`}
//                 </td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Business Name</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.businessName}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Business Category</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.businessCategory}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Business Address</td>
//                 <td className="border border-gray-300 px-4 py-2">{user.businessAddress}</td>
//               </tr>
//               <tr>
//                 <td className="border border-gray-300 px-4 py-2 font-semibold">Aadhar</td>
//                 <td className="border border-gray-300 px-4 py-2 flex gap-2">
//                   <img
//                     src={user.frontAadhar}
//                     width={50}
//                     alt="Front Aadhar"
//                     className="cursor-pointer"
//                     onClick={() => toggleZoom(user.frontAadhar)}
//                   />
//                   <img
//                     src={user.backAadhar}
//                     width={50}
//                     alt="Back Aadhar"
//                     className="cursor-pointer"
//                     onClick={() => toggleZoom(user.backAadhar)}
//                   />
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//         <div className="flex justify-end m-4">
//           {/* <button onClick={handleApproveClick} className="btn btn-primary w-full sm:w-auto">Approve</button> */}
//           <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto">Close</button>
//         </div>
//       </div>

//       {/* Zoomed Image Modal */}
//       {zoomedImage && (
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[60]"
//           onClick={() => setZoomedImage(null)}
//         >
//           <img
//             src={zoomedImage}
//             alt="Zoomed Aadhar"
//             className="max-w-[90%] max-h-[90vh] object-contain"
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}

//     </div>
//   );
// };
const UserDetailsModal = ({ user, onClose, onApprove }) => {
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [permanentAddress, setPermanentAddress] = useState(user.permanentAddress || "");
  const [aadharNumber, setAadharNumber] = useState(user.aadharNumber || "");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(user._id);

  const aadharImages = [user.frontAadhar, user.backAadhar];

  if (!user) return null;

  const handleApproveClick = (e) => {
    e.stopPropagation();
    onApprove(user._id);
  };

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
                  {aadharImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      width={50}
                      alt={`Aadhar ${index + 1}`}
                      className="cursor-pointer"
                      onClick={() => openZoomModal(index)}
                    />
                  ))}
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
        <div className="flex justify-between mt-4 gap-1">
          <button onClick={handleApproveClick} className="btn btn-primary w-full sm:w-auto">Approve</button>
          <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto">Close</button>
        </div>
      </div>
      {zoomedIndex !== null && (
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
      )}
    </div>
  );
};

// All Users Component
// const AllUsers = () => {
//   const [userList, setUserList] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [filter, setFilter] = useState('');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [referredByList, setReferredByList] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(`${backend_API}/auth/getAllUser`, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.data;
//       const filteredUsers = data.user.filter(user => user.isAdminApproved === true);
//       setUserList(filteredUsers);
//       console.log(filteredUsers, "all");



//     } catch (error) {
//       console.error('Error:', error.message);
//       toast(error?.response?.data?.message)
//     }
//   };


//   // Fetch Categories from backend
//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`${backend_API}/category/getAllCategory`);
//       const sortedCategories = response.data.category.sort((a, b) =>
//         a.categoryName.localeCompare(b.categoryName)
//       );
//       setCategories(sortedCategories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchCategories();
//   }, []);

//   const deleteUser = async (uid) => {
//     toast.info(
//       <div>
//         <p>Are you sure you want to delete ?</p>
//         <div className="d-flex justify-content-center gap-2">
//           <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(uid)}>Yes</button>
//           <button className="btn btn-secondary btn-sm" OnClick={toast.dismiss}>No</button>
//         </div>
//       </div>,
//       { autoClose: true, closeOnClick: true }
//     );
//   };
//   const confirmDelete = async (uid) => {
//     toast.dismiss(); // Close the confirmation toast


//     try {
//       const response = await axios.delete(`${backend_API}/auth/deleteUser`, {
//         headers: { 'Content-Type': 'application/json' },
//         data: { id: uid },
//       });
//       if (response.status === 200) {
//         toast(response?.data?.message)
//         fetchData();
//       }
//     } catch (error) {
//       console.error('Error:', error.message);
//       toast(error?.response?.data?.message)

//     }
//   };

//   const handleRowClick = (user) => {
//     setSelectedUser(user);
//   };

//   const filteredUserList = userList
//     .filter(user => {
//       if (selectedDate && filter === 'date') {
//         const userDate = new Date(user.createdAt).toLocaleDateString();
//         const filterDate = selectedDate.toLocaleDateString();
//         return userDate === filterDate;
//       }
//       if (selectedCategory && filter === 'category') {
//         return user.businessCategory.includes(selectedCategory);
//       }
//       return true;
//     })
//     .sort((a, b) => {
//       if (filter === 'A-Z') {

//         return b.name.localeCompare(a.name);
//       } else if (filter === 'Z-A') {
//         return a.name.localeCompare(b.name);
//       } else if (filter === 'date') {
//         return new Date(b.date) - new Date(a.date);
//       }
//       return 0;
//     });

//   return (
//     <>
//       <AdminHeader />
//       <AdminSidebar />
//       <div className="my-32">
//         <section className="p-4">
//           <div className="container-fluid">
//             <div className="row">
//               <div className="col-12">
//                 <div className="col-12 col-md-4">
//                   {/* Filter Selection */}
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="role" className="text-sm font-medium text-gray-700">
//                       Select Filter
//                     </label>
//                     <select
//                       id="role"
//                       className="form-select border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
//                       value={filter}
//                       onChange={(e) => setFilter(e.target.value)}
//                     >
//                       <option value="">All</option>
//                       <option value="A-Z">A-Z</option>
//                       <option value="Z-A">Z-A</option>
//                       <option value="date">DATE</option>
//                       <option value="category">Category</option>
//                     </select>
//                   </div>

//                   {/* Date Picker */}
//                   {filter === "date" && (
//                     <div className="mt-4">
//                       <label className="text-sm font-medium text-gray-700">Select Date</label>
//                       <div className="relative flex items-center mt-1">
//                         <DatePicker
//                           selected={selectedDate}
//                           onChange={(date) => setSelectedDate(date)}
//                           dateFormat="yyyy-MM-dd"
//                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
//                         />
//                         <span className="absolute right-3 text-gray-500">
//                           <MdDateRange size={20} />
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {/* Category Selection */}
//                   {filter === "category" && (
//                     <div className="mt-4">
//                       <label className="text-sm font-medium text-gray-700">Select Category</label>
//                       <select
//                         className="form-select border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition mt-1"
//                         value={selectedCategory}
//                         onChange={(e) => setSelectedCategory(e.target.value)}
//                       >
//                         <option value="">All Categories</option>
//                         {categories.map((category) => (
//                           <option key={category._id} value={category.categoryName}>
//                             {category.categoryName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section>
//           <div className="container-fluid">
//             <div className="card bg-base-100 shadow-xl mt-5">
//               <div className="card-header text-xl text-bold z-0 py-3">All Users</div>
//               <div className="table-container">
//                 <table className="table table-bordered z-30 border">
//                   <thead className="text-bold text-[15px] text-black z-30 bg-gray-100">
//                     <tr>
//                       <th>SrNo</th>
//                       <th>Name</th>
//                       <th>Email</th>
//                       <th>Contact</th>
//                       <th>Address</th>
//                       <th>Business Name</th>
//                       <th>Business Category</th>
//                       <th>Business Address</th>
//                       <th>ReffredBy</th>
//                       <th>Payment Status</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredUserList.reverse().map((user, index) => (
//                       <tr key={user._id} onClick={() => handleRowClick(user)}>
//                         <th>{index + 1}</th>
//                         <td>{user.name}</td>
//                         <td>{user.email}</td>
//                         <td>{user.phone}</td>
//                         <td>
//                           {`${user?.address?.area} ${user?.address?.city} ${user?.address?.state} ${user?.address?.country} ${user?.address?.pincode}`}
//                         </td>
//                         <td>{user.businessName}</td>
//                         <td>{user.businessCategory}</td>
//                         <td>{user.businessAddress}</td>
//                         <td>{user.referredBy.map((r) => {
//                           return r.name
//                         })}</td>
//                         <td>
//                           {user.paymentVerified ? (
//                             <button className="btn btn-success btn-sm flex items-center gap-1" title="Payment Verified">
//                               Payment Verified
//                             </button>


//                           ) : (
//                             <button
//                               className="btn btn-danger btn-sm"
//                               title="Payment Not Verified"
//                             >
//                               Payment Not Verified
//                             </button>

//                           )}
//                         </td>
//                         <td className="d-flex">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               deleteUser(user._id);
//                             }}
//                             className="btn-xl m-1 fs-3 text-primary"
//                           >
//                             <MdOutlineDeleteOutline />
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               navigate(`/admin/editUser`, { state: user });
//                             }}
//                             className="btn-xl fs-4 text-green-500"
//                           >
//                             <FaEdit />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </section>
//         {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
//       </div>
//     </>
//   );
// };

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
                      <th>Payment Status</th>
                      <th>Action</th>
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
