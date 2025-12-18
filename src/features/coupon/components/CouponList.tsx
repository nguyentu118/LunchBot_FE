import React, { useState } from 'react';
import { Alert, Button, Col, Row, Spinner, Pagination } from 'react-bootstrap';
import { RefreshCw, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { Coupon, useCouponList } from '../hooks/useCouponList';
import CouponCard from './CouponCard';
import EditCouponModal from './EditCouponModal';

interface CouponListProps {
    merchantId?: number;
    onlyActive?: boolean;
    showMerchantView?: boolean;
    title?: string;
    brandColor?: string;
    emptyMessage?: string;
}

const CouponList: React.FC<CouponListProps> = ({
                                                   merchantId,
                                                   onlyActive = false,
                                                   showMerchantView = false,
                                                   title,
                                                   brandColor = '#FF5E62',
                                                   emptyMessage = 'Chưa có mã giảm giá nào'
                                               }) => {
    const { coupons: rawData, isLoading, error, refetch, deleteCoupon } = useCouponList({
        merchantId,
        onlyActive,
        autoFetch: true
    });

    const coupons = Array.isArray(rawData) ? rawData : [];
    const listRef = React.useRef<HTMLDivElement>(null);
    // --- LOGIC PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = showMerchantView ? 8 : 4;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = coupons.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(coupons.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        if (listRef.current) {
            listRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Đưa đầu danh sách lên mép trên màn hình
            });
        }
    };
    // ------------------------

    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleCopyCode = (code: string) => {
        toast.success(`Đã sao chép mã: ${code}`, { icon: '📋', duration: 2000 });
    };

    const handleDelete = async (id: number) => {
        await deleteCoupon(id);
    };

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        refetch();
    };

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" style={{ color: brandColor, width: '2rem', height: '2rem' }} />
                <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>Đang tải danh sách...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-3 py-3">
                <Alert.Heading style={{ fontSize: '1rem' }}>Lỗi tải dữ liệu</Alert.Heading>
                <p style={{ fontSize: '0.85rem' }}>{error}</p>
                <Button variant="outline-danger" size="sm" onClick={refetch}>Thử lại</Button>
            </Alert>
        );
    }

    return (
        <div className="coupon-list-container">
            {title && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold d-flex align-items-center gap-2 mb-0" style={{ fontSize: '1.25rem' }}>
                        <Ticket size={24} color={brandColor} />
                        {title}
                    </h3>
                    <Button variant="outline-secondary" size="sm" onClick={refetch} className="d-flex align-items-center gap-1">
                        <RefreshCw size={14} /> Làm mới
                    </Button>
                </div>
            )}

            {coupons.length === 0 ? (
                <Alert variant="info" className="text-center py-3">
                    <Ticket size={40} className="mb-2 opacity-50" />
                    <p className="mb-0" style={{ fontSize: '0.85rem' }}>{emptyMessage}</p>
                </Alert>
            ) : (
                <>
                    {/* Hiển thị Grid: 4 coupon mỗi dòng trên màn hình lớn */}
                    <Row className="g-4">
                        {currentItems.map((coupon) => (
                            <Col key={coupon.id} xs={12} sm={6} md={4} lg={3}>
                                <CouponCard
                                    coupon={coupon}
                                    showMerchantView={showMerchantView}
                                    brandColor={brandColor}
                                    onCopy={handleCopyCode}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            </Col>
                        ))}
                    </Row>

                    {/* Điều hướng phân trang */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <Pagination>
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => handlePageChange(index + 1)}
                                        style={{
                                            backgroundColor: index + 1 === currentPage ? brandColor : 'transparent',
                                            borderColor: index + 1 === currentPage ? brandColor : '#dee2e6'
                                        }}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}

                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {selectedCoupon && (
                <EditCouponModal
                    show={showEditModal}
                    onHide={() => {
                        setShowEditModal(false);
                        setSelectedCoupon(null);
                    }}
                    coupon={selectedCoupon}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default CouponList;