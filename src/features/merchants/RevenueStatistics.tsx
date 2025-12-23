// RevenueStatistics.tsx (CẬP NHẬT - GỌN, 1 HÀNG)

import React, { useEffect, useState } from 'react';
import { RevenueStatisticsResponse, OrderResponse } from './types/merchant.ts';
import { Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { merchantService } from "./services/merchantService.ts";

interface Props {
    merchantId: number;
}

const RevenueStatistics: React.FC<Props> = ({ merchantId }) => {
    const [stats, setStats] = useState<RevenueStatisticsResponse | null>(null);
    const [timeRange, setTimeRange] = useState<string>('MONTH');

    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedQuarter, setSelectedQuarter] = useState<number>(
        Math.ceil(new Date().getMonth() / 3)
    );
    const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumber(new Date()));

    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    function getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params: any = {
                timeRange,
                page,
                size: 10
            };

            if (timeRange === 'WEEK') {
                params.week = selectedWeek;
                params.year = selectedYear;
            } else if (timeRange === 'MONTH') {
                params.month = selectedMonth;
                params.year = selectedYear;
            } else if (timeRange === 'QUARTER') {
                params.quarter = selectedQuarter;
                params.year = selectedYear;
            } else if (timeRange === 'YEAR') {
                params.year = selectedYear;
            }

            const data = await merchantService.getRevenueStatistics(merchantId, params);
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (merchantId) {
            fetchStats();
        }
    }, [merchantId, timeRange, selectedYear, selectedMonth, selectedQuarter, selectedWeek, page]);

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
        setPage(0);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(Number(e.target.value));
        setPage(0);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(Number(e.target.value));
        setPage(0);
    };

    const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedQuarter(Number(e.target.value));
        setPage(0);
    };

    const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWeek(Number(e.target.value));
        setPage(0);
    };

    const getPeriodLabel = (): string => {
        if (timeRange === 'WEEK') {
            return `Tuần ${selectedWeek} - ${selectedYear}`;
        } else if (timeRange === 'MONTH') {
            return `Tháng ${selectedMonth} - ${selectedYear}`;
        } else if (timeRange === 'QUARTER') {
            return `Quý ${selectedQuarter} - ${selectedYear}`;
        } else if (timeRange === 'YEAR') {
            return `Năm ${selectedYear}`;
        }
        return '';
    };

    return (
        <div className="container-fluid p-0">
            <h5 className="fw-bold mb-3">Thống kê doanh số</h5>
            {/* 1. BỘ LỌC - GỌN, 1 HÀNG */}
            <div className="mb-4">
                <div className="d-flex gap-2 align-items-end flex-wrap">
                    {/* TIME RANGE BUTTONS */}
                    <div className="btn-group">
                        {['WEEK', 'MONTH', 'QUARTER', 'YEAR'].map((range) => (
                            <button
                                key={range}
                                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleTimeRangeChange(range)}
                                style={{ minWidth: '70px' }}
                            >
                                {range === 'WEEK' ? 'Tuần'
                                    : range === 'MONTH' ? 'Tháng'
                                        : range === 'QUARTER' ? 'Quý'
                                            : 'Năm'}
                            </button>
                        ))}
                    </div>

                    {/* NĂNT - HIỂN THỊ LUÔN */}
                    <select
                        className="form-select form-select-sm"
                        value={selectedYear}
                        onChange={handleYearChange}
                        style={{ maxWidth: '100px' }}
                    >
                        {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {/* THÁNG */}
                    {timeRange === 'MONTH' && (
                        <select
                            className="form-select form-select-sm"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            style={{ maxWidth: '140px' }}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* QUÝ */}
                    {timeRange === 'QUARTER' && (
                        <select
                            className="form-select form-select-sm"
                            value={selectedQuarter}
                            onChange={handleQuarterChange}
                            style={{ maxWidth: '120px' }}
                        >
                            {[1, 2, 3, 4].map(q => (
                                <option key={q} value={q}>
                                    Quý {q}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* TUẦN */}
                    {timeRange === 'WEEK' && (
                        <select
                            className="form-select form-select-sm"
                            value={selectedWeek}
                            onChange={handleWeekChange}
                            style={{ maxWidth: '120px' }}
                        >
                            {[...Array(53)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tuần {i + 1}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* 2. CARDS TỔNG QUAN */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 bg-primary text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                <DollarSign size={32} />
                            </div>
                            <div>
                                <p className="mb-0 opacity-75">Tổng Doanh Thu ({getPeriodLabel()})</p>
                                <h2 className="fw-bold mb-0">
                                    {loading ? '...' : formatCurrency(Number(stats?.totalRevenue) || 0)}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 bg-success text-white h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                <ShoppingBag size={32} />
                            </div>
                            <div>
                                <p className="mb-0 opacity-75">Đơn hàng hoàn thành</p>
                                <h2 className="fw-bold mb-0">
                                    {loading ? '...' : stats?.totalOrders || 0} đơn
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. DANH SÁCH ĐƠN HÀNG CHI TIẾT */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold">Chi tiết đơn hàng</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Tổng tiền</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-4">Đang tải dữ liệu...</td></tr>
                            ) : stats?.orders.content.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-4">Chưa có đơn hàng trong khoảng thời gian này.</td></tr>
                            ) : (
                                stats?.orders.content.map((order: OrderResponse) => (
                                    <tr key={order.id}>
                                        <td><span className="badge bg-light text-dark border">#{order.orderNumber}</span></td>
                                        <td>{order.customerName}</td>
                                        <td><small className="text-muted"><Calendar size={14} className="me-1"/>{formatDate(order.orderDate)}</small></td>
                                        <td>
                                            <span className="badge bg-success bg-opacity-10 text-success">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold text-primary">{formatCurrency(Number(order.totalAmount))}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. PHÂN TRANG */}
                {stats && stats.orders.totalPages > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-end py-3">
                        <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Trước
                        </button>
                        <span className="align-self-center mx-2">
                            Trang {page + 1} / {stats.orders.totalPages}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            disabled={page >= stats.orders.totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueStatistics;