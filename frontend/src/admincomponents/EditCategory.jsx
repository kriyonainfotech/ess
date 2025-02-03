import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backend_API = import.meta.env.VITE_API_URL;

const EditCategory = ({ editcategory, fetchCategory }) => {
    const [categoryName, setCategoryName] = useState("");
    const [categoryImg, setCategoryImg] = useState("");
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // console.log(editcategory,"editdata");

    const handlefileChange = (e) => {
        const file = e.target.files[0];
        console.log(file,"filea");
        
        if (file && file.type.startsWith('image/')) {
            setCategoryImg(file);
            const newPreview = URL.createObjectURL(file);
            setPreview(newPreview);     
            // Log the new image preview
            console.log("New image preview URL:", newPreview);
        } else {
            alert("Please select a valid image file.");
        }
    };
    
      
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
        alert("Please fill all fields");
        return;
    }

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    if (categoryImg) {
        formData.append("category", categoryImg); // Append the new image if it exists
    }
    formData.append("categorId", editcategory._id);

    try {
        setLoading(true);

        const response = await axios.post(`${backend_API}/category/updateCategory`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data.success) {
            alert("Category edited successfully!");
            fetchCategory();

            setCategoryName("");
            setCategoryImg("");
            setPreview("");
            setError("");
            const modalCloseButton = document.querySelector("[data-bs-dismiss='modal']");
            if (modalCloseButton) modalCloseButton.click();

        } else {
            setError(response.data.message || "Failed to update category. Please try again.");
        }

    } catch (error) {
        console.error("Error updating category:", error);
        setError(error?.response?.data?.message || "Failed to update category. Please try again.");
    } finally {
        setLoading(false);
    }
};

    // useEffect(() => {
    //     return () => {
    //         if (preview && typeof preview === "string") {
    //             URL.revokeObjectURL(preview); // Clean up the preview URL
    //         }
    //     };
    // }, [preview]);

    useEffect(() => {
        if (editcategory) {
            setCategoryName(editcategory.categoryName);
            setPreview(editcategory.image); // Initial preview
        }
    }, [editcategory]);

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h1 className="modal-title fs-5">Edit Category</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                        <label htmlFor="category-name" className="col-form-label">Category Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="file-upload" className="col-form-label">Category Image:</label>
                        <label htmlFor="file-upload" className="btn d-inline-block border border-orange d-flex justify-content-start align-items-center">
                            Category Image
                        </label>
                        <input
                            type="file"
                            id="file-upload"
                            name="categoryImg"
                            onChange={handlefileChange}
                            
                        />
                        {preview && <img src={preview} alt="Preview" width="100" />}
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Updating..." : "Update Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategory;
