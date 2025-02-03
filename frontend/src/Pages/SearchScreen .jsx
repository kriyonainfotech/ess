// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const backend_API = import.meta.env.VITE_API_URL;

// const SearchScreen = () => {
//   const token = JSON.parse(localStorage.getItem('token'));
//   const [categories, setCategories] = useState([]);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // Fetch categories from API with useCallback to prevent re-fetching
//   const fetchCategory = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${backend_API}/category/getAllCategory`);
//       const sortedCategories = response.data.category.sort((a, b) =>
//         a.categoryName.localeCompare(b.categoryName)
//       );
//       setCategories(sortedCategories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       toast(error?.response?.data?.message)
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Run fetchCategory once on mount
//   useEffect(() => {
//     fetchCategory();
//   }, [fetchCategory]);

//   // Efficiently check for auth state based on token
//   const auth = Boolean(token);

//   return (
//     <section>
//       <div className="container bd-orange">
//         <div className="row row-cols-3 row-cols-lg-5 overflow-hidden">
//           {
//             categories.map((category) => (
//               <div
//                 key={category.categoryName} // Use a unique key (categoryName or id if available)
//                 className="col"
//                 style={{ cursor: "pointer" }}
//                 onClick={() => navigate(`/serviceDetail`, { state: category.categoryName })}
//               >
//                 <div className="border-0 w-100 h-100 text-center items-center rounded-md">
//                   <figure className='w-full m-0 p-2'>
//                     <img
//                       className='img-fluid w-100 border-orange rounded-4 p-1 overflow-hidden'
//                       style={{ objectFit: "cover" }}
//                       src={category.image}
//                       alt={category.categoryName} // Adding alt attribute for better accessibility
//                     />
//                   </figure>
//                   <h6 className='text-md text-capitalize'>{category.categoryName}</h6>
//                 </div>
//               </div>
//             ))
//           }
//         </div>
//       </div>
//     </section>
//   );
// }

// export default SearchScreen;
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

const backend_API = import.meta.env.VITE_API_URL;

const SearchScreen = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('token'));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // ✅ Track if more data exists
  const observer = useRef();

  // Fetch categories with pagination
  const fetchCategories = useCallback(async () => {
    if (!hasMore || loading) return; // Prevent extra API calls

    setLoading(true);
    try {
      const response = await axios.get(`${backend_API}/category/getAllCategory?page=${page}&limit=20`);
      console.log(response, 'category response')
      if (!response.data || !Array.isArray(response.data.category)) {
        throw new Error("Invalid data format: 'category' is missing or not an array");
      }

      if (response.data.category.length === 0) {
        setHasMore(false); // Stop fetching if no more data
      } else {
        setCategories((prev) => [...prev, ...response.data.category]); // Append new data
        setPage((prev) => prev + 1); // Increase page count
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast(error?.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchCategories(); // ✅ Fetch first batch on mount
  }, []);

  // Infinite Scroll Observer
  const lastCategoryRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCategories();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <section>
      <div className="container bd-orange">
        <div className="row row-cols-3 row-cols-lg-5 overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={category.categoryName}
              className="col"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/serviceDetail`, { state: category.categoryName })}
              ref={index === categories.length - 1 ? lastCategoryRef : null} // ✅ Observe last item
            >
              <div className="border-0 w-100 h-100 text-center items-center rounded-md">
                <figure className="w-full m-0 p-2">
                  <img
                    className="img-fluid w-100 border-orange rounded-4 p-1 overflow-hidden"
                    style={{ objectFit: "cover" }}
                    src={category.image}
                    alt={category.categoryName}
                  />
                </figure>
                <h6 className="text-md text-capitalize">{category.categoryName}</h6>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "10vh" }}>
            <TailSpin color="#00BFFF" height={50} width={50} />
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchScreen;
