import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import MerchantCouponManager from './MerchantCouponManager';
import AddCouponModal from './AddCouponModal';

const CouponsPage: React.FC = () => {
    const [couponCreatedToggle, setCouponCreatedToggle] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Quản lý mã giảm giá</h5>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowCouponModal(true)}
                >
                    <Plus size={16} className="me-1" />
                    Thêm mã giảm giá
                </button>
            </div>
            <MerchantCouponManager
                brandColor="#ff5e62"
                refreshTrigger={couponCreatedToggle}
            />
            <AddCouponModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                onSuccess={() => setCouponCreatedToggle(prev => !prev)}
                customStyles={{ primaryPink: '#ff5e62' }}
            />
        </div>
    );
};

export default CouponsPage;