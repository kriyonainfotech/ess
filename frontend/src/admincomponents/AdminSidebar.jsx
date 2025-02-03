import React, { useEffect, useState } from 'react'
import { FaApper, FaAppStore, FaAppStoreIos, FaCalendar, FaDatabase, FaSortAmountDown, FaSuperpowers, FaUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../../public/ess-121.png"
import '../AdminCss/dashboard.css'

const AdminSidebar = () => {
  const navigate = useNavigate();
  // console.log(token, "token profil");
  const sidebarManu = [
    {
      id: 1,
      title: 'Dashboard',
      icon: <FaSortAmountDown />,
      path: '/admin',
    },
    
    {
      id: 2,
      title: 'CreateUser',
      icon: <FaSortAmountDown />,
      path: '/admin/creatUser',
    },

    {
      id: 2,
      title: 'Panding Approval',
      icon: <FaAppStoreIos />,
      path: '/admin/aprove',
    },
    {
      id: 3,
      title: 'AllUsers',
      icon: <FaUser />,
      path: '/admin/users',
    },
    {
      id: 3,
      title: 'Manage Category',
      icon: <FaCalendar />,
      path: '/admin/manageCategory',
    },

    {
      id: 4,
      title: 'Manage Admin',
      icon: <FaDatabase />,
      path: '/admin/manageAdmin',
    },

    {
      id: 5,
      title: 'Support',
      icon: <FaSuperpowers />,
      path: '/admin/support',
    },


  ]


  return (
    <>
     <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel">
     {/* <div className="offcanvas bg-white offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel"> */}
        <div className="d-flex w-100 align-items-center p-3">

          <div className='w-100 d-flex align-items-center justify-content-center '>
            <div className="img w-[80px] h-[80px]  d-flex">
              <Link to={"/admin"}>  <img src={logo} className='w-full h-full' /></Link>
            </div>

          </div>
          <div className=' d-flex justify-content-center'>
            <button type="button" className="btn-close " data-bs-dismiss="offcanvas" aria-label="Close" />

          </div>
        </div>
        <hr />
        <div className="offcanvas-body adminsidbar p-0 p-3">
          <div>
            <ul>
              {
                sidebarManu.map((manu, i) => {
                  return (
                    <li key={++i} className=' p-2 rounded '>
                      <Link to={manu.path} className=' text-lg d-flex align-items-center'>
                        <span className='inline-block mr-5 text-xl'>{manu.icon}</span>
                        {manu.title}</Link>
                    </li>
                  )
                })
              }

            </ul>
          </div>
        </div>
      </div>


    </>
  )
}

export default AdminSidebar
