import React, { useEffect, useState } from 'react'
import AdminHeader from '../admincomponents/AdminHeader'
import AdminSidebar from '../admincomponents/AdminSidebar'
import UserCount from '../admincomponents/dashboardCpmponent/UserCount'
import axios from 'axios';
import PandingCount from '../admincomponents/dashboardCpmponent/PandingCount';
import AdminCount from '../admincomponents/dashboardCpmponent/AdminCount';
import AssignReferal from '../admincomponents/dashboardCpmponent/AssignReferal';
import { FaUserCheck } from 'react-icons/fa'
import { Link } from 'react-router-dom';

const backend_API = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [Users, setUsers] = useState([]);
  const [pandingcnt, setPandincnt] = useState([]);  // Make sure this is a number
  const [admincnt, setAdminCnt] = useState([]);    // Make sure this is a number

  const fetchData = async () => {
    try {
      const response = await axios.get(`${backend_API}/auth/getAllUser`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.data;
      setUsers(data.user);
      console.log(data, "AllUser");

      // Set counts for approved and pending users
      if (response.status === 200) {
        const aprovedUser = data.user.filter(user => user.isAdminApproved === true);
        const pendingaprovalUsers = data.user.filter(user => user.isAdminApproved === false);
        const admins = data.user.filter(user => user.role === 'Admin');
        setUsers(aprovedUser)
        setAdminCnt(admins);
        setPandincnt(pendingaprovalUsers);

        console.log("All User Successful...");
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <AdminHeader />
      <AdminSidebar />

      <div className="my-32">
        <section>
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h3 className="">Dashboard</h3>
              </div>
              <div className="col-12 d-flex flex-wrap pt-3">
                <div className="col-12 col-md-6 col-lg-3 p-1">
                  <PandingCount pandingcnt={pandingcnt} label="Approved Admins" />
                </div>
                <div className="col-12 col-md-6 col-lg-3 p-1">
                  <UserCount Users={Users} label="Pending Admins" />
                </div>
                <div className="col-12 col-md-6 col-lg-3 p-1">
                  <AdminCount admincnt={admincnt} label="Total Users" />
                </div>
                <div className="col-12 col-md-6 col-lg-3 p-1">
                  <Link to={"/admin/assignRefferal"}>
                    <div className=" shadow rounded-4 py-3 w-100">
                      <div className="card-body d-flex justify-content-evenly">
                        <div className='pb-3'>
                          <span ><FaUserCheck className='fs-3 w-[50px] h-[50px] text-white p-1 bg-green rounded-full' /></span>
                        </div>
                        <div>
                          <p className="card-text">Assign Referals</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
