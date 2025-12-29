import React, {useState} from 'react';
import {CouponDetail, usePromotionCoupons} from '../hooks/usePromotionCoupons';
import MerchantCouponCard from './MerchantCouponCard';
import PaginationControls from './PaginationControls';
import Navigation from "../../../components/layout/Navigation.tsx";

const PromotionsPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 3; // 3 nhà hàng mỗi trang
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState<'discount_high' | 'discount_low' | null>(null);

    const {data, isLoading, error} = usePromotionCoupons({
        page: currentPage,
        size: pageSize,
        keyword: keyword,
        sortBy: sortBy,
        onlyActive: true,
        autoFetch: true
    });

    const handleSearch = () => {
        setKeyword(searchInput);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setKeyword('');
        setCurrentPage(0);
    };

    const handleSortChange = (newSortBy: 'discount_high' | 'discount_low' | null) => {
        setSortBy(newSortBy);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleCouponClick = (coupon: CouponDetail) => {
        navigator.clipboard.writeText(coupon.code);
    };


    return (
        <div className="min-vh-100" style={{background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)'}}>
            <Navigation/>

            {/* Header Section */}
            <header className="bg-white border-bottom py-4 shadow-sm">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex align-items-center gap-3">
                                <div>
                                    <h1 className="h3 fw-bold mb-1">Khuyến Mãi Hấp Dẫn</h1>
                                    <p className="text-muted mb-0 small">
                                        Săn ngay mã giảm giá tốt nhất từ các nhà hàng đối tác
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container py-4">
                {/* Search & Filters */}
                <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            {/* Search Box */}
                            <div className="col-lg-8">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg border-2 ps-5 pe-5"
                                        placeholder="Tìm kiếm mã giảm giá..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        style={{borderRadius: '12px'}}
                                    />
                                    <i
                                        className="bi bi-search position-absolute text-muted"
                                        style={{
                                            left: '18px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '18px'
                                        }}
                                    ></i>

                                    {searchInput && (
                                        <button
                                            className="btn btn-link position-absolute text-danger p-0"
                                            onClick={handleClearSearch}
                                            style={{right: '70px', top: '50%', transform: 'translateY(-50%)'}}
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

                            {/* Sort Dropdown */}
                            <div className="col-lg-4">
                                <select
                                    className="form-select form-select-lg border-2"
                                    value={sortBy || ''}
                                    onChange={(e) => handleSortChange(e.target.value as any || null)}
                                    style={{borderRadius: '12px'}}
                                >
                                    <option value="">Sắp xếp: Mặc định</option>
                                    <option value="discount_high">Giảm giá cao nhất</option>
                                    <option value="discount_low">Giảm giá thấp nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger mb-3" style={{width: '3rem', height: '3rem'}}></div>
                        <p className="text-muted fw-medium">Đang tìm ưu đãi tốt nhất cho bạn...</p>
                    </div>
                ) : error ? (
                    <div className="alert border-0 shadow-sm d-flex align-items-start"
                         style={{borderRadius: '12px', borderLeft: '4px solid #dc3545'}}>
                        <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3 mt-1"></i>
                        <div>
                            <h6 className="fw-bold mb-1">Đã có lỗi xảy ra</h6>
                            <p className="mb-0 text-muted small">{error}</p>
                        </div>
                    </div>
                ) : data && data.content.length > 0 ? (
                    <>
                        {/* Statistics */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {data.totalPages > 1 && (
                                <small className="text-muted">
                                    Trang <strong
                                    className="text-danger">{data.currentPage + 1}</strong>/{data.totalPages}
                                </small>
                            )}
                        </div>

                        {/* Merchant Cards */}
                        <div className="merchants-list">
                            {data.content.map((merchant) => (
                                <MerchantCouponCard
                                    key={merchant.merchantId}
                                    merchant={merchant}
                                    onCouponClick={handleCouponClick}
                                />
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
                                    onPageChange={handlePageChange}
                                />
                                <small className="text-muted mt-3">
                                    Trang {data.currentPage + 1} trên {data.totalPages} • {data.totalElements} nhà hàng
                                </small>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card border-0 shadow-sm text-center py-5" style={{borderRadius: '16px'}}>
                        <div className="card-body">
                            <div className="mb-4">
                                <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                            </div>
                            <h4 className="fw-bold mb-3">Không tìm thấy mã giảm giá</h4>
                            <p className="text-muted mb-4">
                                {keyword
                                    ? `Không có kết quả phù hợp với từ khóa "${keyword}"`
                                    : 'Hiện tại chưa có mã giảm giá nào'
                                }
                            </p>
                            {keyword && (
                                <button
                                    className="btn btn-danger px-4 py-2"
                                    onClick={handleClearSearch}
                                    style={{borderRadius: '10px'}}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Xem tất cả mã giảm giá
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>



        </div>
    );
};

export default PromotionsPage;