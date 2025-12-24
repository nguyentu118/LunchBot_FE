import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import MerchantOrderManager from '../../features/merchants/MerchantOrderManager';

const OrdersPage: React.FC = () => {
    const [searchFilters, setSearchFilters] = useState({
        keyword: '',
        status: '',
        date: ''
    });

    const handleSearchChange = (field: string, value: string) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div>
            <h5 className="fw-bold mb-3">Quản lý đơn hàng</h5>

            {/* Search & Filter Bar */}
            <div className="bg-light rounded-3 p-3 mb-3">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Tìm kiếm</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} className="text-muted"/>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchFilters.keyword}
                                onChange={(e) => handleSearchChange('keyword', e.target.value)}
                            />
                            {searchFilters.keyword && (
                                <button
                                    className="btn btn-outline-secondary border-start-0"
                                    onClick={() => handleSearchChange('keyword', '')}
                                >
                                    <X size={18}/>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Trạng thái</label>
                        <select
                            className="form-select"
                            value={searchFilters.status}
                            onChange={(e) => handleSearchChange('status', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="PROCESSING">Đang chế biến</option>
                            <option value="READY">Đã xong món</option>
                            <option value="DELIVERING">Đang giao</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Ngày đặt</label>
                        <input
                            type="date"
                            className="form-control"
                            value={searchFilters.date}
                            onChange={(e) => handleSearchChange('date', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <MerchantOrderManager filters={searchFilters} />
        </div>
    );
};

export default OrdersPage;
