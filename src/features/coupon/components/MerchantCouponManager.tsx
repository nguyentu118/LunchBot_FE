import React, { useState, useEffect } from 'react';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { List, Grid } from 'lucide-react';
import CouponList from './CouponList';
import AddCouponModal from './AddCouponModal';
import toast from 'react-hot-toast';

interface MerchantCouponManagerProps {
    brandColor?: string;
    refreshTrigger?: boolean;
}

const MerchantCouponManager: React.FC<MerchantCouponManagerProps> = ({
                                                                         brandColor = '#FF5E62',
                                                                         refreshTrigger
                                                                     }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterActive, setFilterActive] = useState<'all' | 'active'>('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // ✅ Listen to refreshTrigger from parent (Dashboard)
    useEffect(() => {
        if (refreshTrigger !== undefined) {
            setRefreshKey(prev => prev + 1);
        }
    }, [refreshTrigger]);

    const handleCouponCreated = () => {
        setShowAddModal(false);
        toast.success('Tạo mã giảm giá thành công!', {
            icon: '🎉',
            duration: 3000
        });
        // // Trigger refresh của CouponList
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Quản lý mã giảm giá</h2>
                <div className="d-flex gap-2 align-items-center">
                    <ButtonGroup>
                        <Button
                            variant={filterActive === 'all' ? 'primary' : 'outline-secondary'}
                            size="sm"
                            onClick={() => setFilterActive('all')}
                            style={{
                                backgroundColor: filterActive === 'all' ? brandColor : 'transparent',
                                borderColor: brandColor,
                                color: filterActive === 'all' ? 'white' : brandColor
                            }}
                        >
                            <List size={16} className="me-1" />
                            Tất cả
                        </Button>
                        <Button
                            variant={filterActive === 'active' ? 'primary' : 'outline-secondary'}
                            size="sm"
                            onClick={() => setFilterActive('active')}
                            style={{
                                backgroundColor: filterActive === 'active' ? brandColor : 'transparent',
                                borderColor: brandColor,
                                color: filterActive === 'active' ? 'white' : brandColor
                            }}
                        >
                            <Grid size={16} className="me-1" />
                            Còn hiệu lực
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            <CouponList
                key={refreshKey}
                onlyActive={filterActive === 'active'}
                showMerchantView={true}
                brandColor={brandColor}
                emptyMessage={
                    filterActive === 'active'
                        ? 'Chưa có mã giảm giá còn hiệu lực'
                        : 'Chưa tạo mã giảm giá nào'
                }
            />

            <AddCouponModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleCouponCreated}
                customStyles={{ primaryPink: brandColor }}
            />
        </Container>
    );
};

export default MerchantCouponManager;