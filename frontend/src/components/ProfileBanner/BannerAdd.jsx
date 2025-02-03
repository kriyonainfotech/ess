import axios from 'axios';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
const backend_API = import.meta.env.VITE_API_URL;
// console.log(backend_API);

const BannerAdd = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // To show preview
  const token = JSON.parse(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // Generate a preview URL
  };

  const hendleSubmitIng = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append('banner', image); // Matches the backend field name
    console.log('FormData:', Object.fromEntries(formData));

    try {
      setLoading(true)
      const response = await axios.post(`${backend_API}/banner/addBanner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Pass the token in headers
        },
      }
      );
      // alert(response.data.message)
      toast("Banner Added Successfully")
      window.location.reload()
      setImage(null);
      setPreview(null);

    } catch (error) {
      console.error("Error details:", error);
      toast(error.response.data.message);
    } finally {
      setLoading(false)
    }

  }


  return (
    <>
      <form action="" onSubmit={hendleSubmitIng} >
        <div className='' >
          <label htmlFor="file-upload" className="h-[100px] btn d-inline-block border border-orange d-flex justify-content-center align-items-center  text-center ">
            Add Offer Benner
          </label>
          <input type="file" id="file-upload" name="banner" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" width="200" />}
          <button type='submit' className='btn bg-green p-0 p-1 text-white mt-1' disabled={loading}>
            {loading ?
              <div className="spinner-border text-white" role="status">
                <span className="sr-only">Loading...</span>
              </div> : 'Add'}
            
          </button>
        </div>
      </form>

    </>
  )
}

export default BannerAdd
