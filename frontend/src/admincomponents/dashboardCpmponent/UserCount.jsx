import React from 'react'
import { FaUserCheck } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const UserCount = ({ Users }) => {
    const navigete = useNavigate()
    return (
        <>
            <div>
                <div className=" shadow rounded-4 py-3 w-100">
                    <div className="card-body d-flex justify-content-evenly" onClick={() => navigete("/admin/users")}>
                        <div className='pb-3'>
                            <span ><FaUserCheck className='fs-3 w-[50px] h-[50px] text-white p-1 bg-green rounded-full' /></span>
                        </div>
                        <div>
                            <p className="card-text">Approved User </p>
                            <h5 className="card-title pt-2">{Users.length}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserCount