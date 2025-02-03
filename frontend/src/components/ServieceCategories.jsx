import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';

const ServieceCategories = () => {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const limit = 20; // items per page
    const navigate = useNavigate();

    // For infinite scroll
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backend_API}/category/getAllCategory`, {
                params: {
                    page,
                    limit,
                    scroll: true // Enable scroll mode
                }
            });

            const { category, pagination } = response.data;

            setCategories(category);
            setHasMore(pagination.hasMore);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
        }
    };

    // For pagination
    const fetchPaginatedCategories = async (pageNumber) => {
        try {
            setLoading(true);
            const response = await axios.get(`${backend_API}/category/getAllCategory`, {
                params: {
                    page: pageNumber,
                    limit,
                    scroll: false // Disable scroll mode for regular pagination
                }
            });

            const { category, pagination } = response.data;

            setCategories(category);
            setHasMore(pagination.hasMore);
            setPage(pagination.currentPage);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
        }
    };

    // Load more function for infinite scroll
    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page]);

    // Handle category click
    const handleCategoryClick = (categoryName) => {
        navigate('/serviceDetail', { state: categoryName });
    };

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center py-5">
                <h5>No categories available</h5>
            </div>
        );
    }

    return (
        <div>
            {/* For Infinite Scroll */}
            <InfiniteScroll
                dataLength={categories.length}
                next={loadMore}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p>No more categories to load.</p>}
            >
                <section className='mt-2'>
                    <div className="container">
                        <div className="row row-cols-3 row-cols-lg-5 overflow-hidden">
                            {categories.map((item, index) => (
                                <div key={index} className="col py-2" style={{ cursor: "pointer" }} onClick={() => handleCategoryClick(item.categoryName)}>
                                    <div className="border-0 w-100 h-100 text-center rounded-md">
                                        <figure className='w-full  m-0 p-1'>
                                            <img className='img-fluid w-100 h-100 p-2 border-orange rounded-4 overflow-hidden'
                                                style={{ objectFit: "cover" }}
                                                src={item.image}
                                                alt={item.categoryName} />
                                        </figure>
                                        <h6 className='text-md text-capitalize'>{item.categoryName}</h6>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </InfiniteScroll>

            {/* For Pagination */}
            <div className="pagination">
                {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => fetchPaginatedCategories(i + 1)}
                        disabled={loading || page === i + 1}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ServieceCategories;
