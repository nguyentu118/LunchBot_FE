import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';
import PaginationControls from "../../coupon/components/PaginationControls.tsx";
import Navigation from "../../../components/layout/Navigation.tsx";
import {CartApiService} from "../../cart/services/CartApi.service.ts";
import toast from "react-hot-toast";
import { ShoppingCart } from 'lucide-react';

interface DishDiscount {
    id: number;
    name: string;
    imageUrl: string;
    address: string;
    preparationTime: number;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
}

interface PaginatedResponse {
    content: DishDiscount[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

const AllDiscountsPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState('discount_desc');
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    const fetchDiscounts = async (page: number, search: string, sort: string) => {
        setIsLoading(true);
        try {
            const params: any = {
                page,
                size: 12,
                sortBy: sort
            };
            if (search) params.keyword = search;

            const response = await axiosInstance.get<PaginatedResponse>(
                '/dishes/all-discounts',
                { params }
            );
            setData(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts(currentPage, keyword, sortBy);
    }, [currentPage, keyword, sortBy]);

    const handleSearch = () => {
        setKeyword(searchInput);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setKeyword('');
        setCurrentPage(0);
    };

    const handleAddToCart = async (e: React.MouseEvent, dishId: number) => {
        e.stopPropagation();
        e.preventDefault();
        setAddingToCart(dishId);

        try {
            await CartApiService.addToCart({ dishId, quantity: 1 });
            toast.success('Đã thêm vào giỏ hàng!', {
                duration: 2000,
                position: 'top-center',
            });

            // Dispatch event để Navigation cập nhật
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setAddingToCart(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
    };

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
            <Navigation/>
            {/* Header */}
            <header className="bg-white border-bottom shadow-sm py-4">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                            <h1 className="h3 fw-bold mb-1">Món Ăn Giảm Giá</h1>
                            <p className="text-muted mb-0 small">
                                {data && `${data.totalElements} món ăn đang giảm giá`}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container py-4">
                {/* Search & Filter */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-lg-8">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg border-2 ps-5 pe-5"
                                        placeholder="Tìm món ăn hoặc nhà hàng..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        style={{ borderRadius: '12px' }}
                                    />
                                    <i className="bi bi-search position-absolute text-muted"
                                       style={{ left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}></i>

                                    {searchInput && (
                                        <button
                                            className="btn btn-link position-absolute text-danger p-0"
                                            onClick={handleClearSearch}
                                            style={{ right: '70px', top: '50%', transform: 'translateY(-50%)' }}
                                        >
                                            <i className="bi bi-x-circle-fill fs-5"></i>
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-danger position-absolute"
                                        onClick={handleSearch}
                                        style={{
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            borderRadius: '8px',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        Tìm
                                    </button>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <select
                                    className="form-select form-select-lg border-2"
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    style={{ borderRadius: '12px' }}
                                >
                                    <option value="discount_desc">Giảm giá cao nhất</option>
                                    <option value="discount_asc">Giảm giá thấp nhất</option>
                                    <option value="price_asc">Giá tăng dần</option>
                                    <option value="price_desc">Giá giảm dần</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {keyword && (
                            <div className="mt-3 pt-3 border-top">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted fw-medium small">
                                        <i className="bi bi-funnel-fill me-1"></i>Đang lọc:
                                    </span>
                                    <span className="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2"
                                          style={{ fontSize: '13px', borderRadius: '8px' }}>
                                        <i className="bi bi-search"></i>
                                        "{keyword}"
                                        <i className="bi bi-x-lg text-danger"
                                           onClick={handleClearSearch}
                                           style={{ cursor: 'pointer', fontSize: '11px' }}></i>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="text-muted fw-medium">Đang tải món ăn giảm giá...</p>
                    </div>
                ) : data && data.content.length > 0 ? (
                    <>
                        {/* Statistics */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="mb-0 fw-bold">Danh sách món ăn</h5>
                                <small className="text-muted">
                                    Hiển thị {data.content.length} món • Trang {data.currentPage + 1}/{data.totalPages}
                                </small>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="row g-4">
                            {data.content.map((dish) => (
                                <div key={dish.id} className="col-6 col-md-4 col-lg-3">
                                    <div
                                        className="card h-100 border-0 shadow-sm"
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => navigate(`/dishes/${dish.id}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <div className="position-relative overflow-hidden"
                                             style={{ borderRadius: '12px 12px 0 0' }}>
                                            <img
                                                src={dish.imageUrl || 'https://via.placeholder.com/300'}
                                                alt={dish.name}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                            <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-3 py-2"
                                                  style={{ fontSize: '14px', fontWeight: '600' }}>
                                                -{Math.round(dish.discountPercentage)}%
                                            </span>
                                        </div>
                                        <div className="card-body p-3">
                                            <h6 className="fw-bold mb-2 text-truncate" title={dish.name}>
                                                {dish.name}
                                            </h6>
                                            <p className="text-muted small mb-3 text-truncate" title={dish.address}>
                                                <i className="bi bi-geo-alt me-1"></i>
                                                {dish.address}
                                            </p>

                                            {/* Price and Cart Button */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-danger fw-bold d-block" style={{ fontSize: '1rem' }}>
                                                        {formatCurrency(dish.discountedPrice)}
                                                    </span>
                                                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                                                        {formatCurrency(dish.originalPrice)}
                                                    </span>
                                                </div>

                                                {/* Cart Button */}
                                                <button
                                                    className="btn shadow-sm d-flex align-items-center justify-content-center"
                                                    onClick={(e) => handleAddToCart(e, dish.id)}
                                                    disabled={addingToCart === dish.id}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#ececec', // Màu xám nhạt như ảnh bạn gửi
                                                        border: 'none',
                                                        transition: 'all 0.2s ease',
                                                        padding: '0',
                                                        position: 'relative',
                                                        zIndex: 10
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (addingToCart !== dish.id) {
                                                            e.currentTarget.style.backgroundColor = '#e0e0e0';
                                                            e.currentTarget.style.transform = 'scale(1.1)'; // Phóng to nhẹ khi hover
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (addingToCart !== dish.id) {
                                                            e.currentTarget.style.backgroundColor = '#ececec';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }
                                                    }}
                                                >
                                                    {addingToCart === dish.id ? (
                                                        <span
                                                            className="spinner-border spinner-border-sm"
                                                            style={{ width: '1.2rem', height: '1.2rem', color: '#ff5e62' }}
                                                        ></span>
                                                    ) : (
                                                        <ShoppingCart
                                                            size={20}
                                                            color="#ff5e62"
                                                            strokeWidth={2.5} // Làm icon đậm nét hơn một chút cho giống ảnh
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className="mt-4 d-flex flex-column align-items-center">
                                <PaginationControls
                                    currentPage={data.currentPage}
                                    totalPages={data.totalPages}
                                    hasNext={data.hasNext}
                                    hasPrevious={data.hasPrevious}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                                <small className="text-muted mt-3">
                                    Trang {data.currentPage + 1} trên {data.totalPages} • {data.totalElements} món ăn
                                </small>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
                        <div className="card-body">
                            <div className="mb-4">
                                <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                            </div>
                            <h4 className="fw-bold mb-3">Không tìm thấy món ăn</h4>
                            <p className="text-muted mb-4">
                                {keyword
                                    ? `Không có kết quả phù hợp với từ khóa "${keyword}"`
                                    : 'Hiện tại chưa có món ăn giảm giá'
                                }
                            </p>
                            {keyword && (
                                <button
                                    className="btn btn-danger px-4 py-2"
                                    onClick={handleClearSearch}
                                    style={{ borderRadius: '10px' }}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Xem tất cả món giảm giá
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllDiscountsPage;