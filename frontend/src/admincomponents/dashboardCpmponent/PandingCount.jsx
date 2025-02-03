import React from 'react'
import { FaUserCheck } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const PandingCount = ({ pandingcnt }) => {
    const navigete = useNavigate()
    return (
        <>
            <div>
                <div className=" shadow rounded-4 py-3 w-100" onClick={() => navigete("/admin/aprove")}>
                    <div className="card-body d-flex justify-content-evenly">
                        <div className='pb-3'>
                            <span ><FaUserCheck className='fs-3 w-[50px] h-[50px] text-white p-1 bg-green rounded-full' /></span>
                        </div>
                        <div>
                            <p className="card-text">Pending approval </p>
                            <h5 className="card-title pt-2">{pandingcnt.length}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PandingCount