import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { TrendingUp, DollarSign, Percent, Receipt } from 'lucide-react';

interface RevenueSummaryProps {
    totalOrders: number;
    totalGrossRevenue: number;
    platformCommissionRate: number;
    totalPlatformFee: number;
    netRevenue: number;
}

export const RevenueSummary: React.FC<RevenueSummaryProps> = ({
                                                                  totalOrders,
                                                                  totalGrossRevenue,
                                                                  platformCommissionRate,
                                                                  totalPlatformFee,
                                                                  netRevenue
                                                              }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const stats = [
        {
            icon: Receipt,
            label: 'Tổng đơn hàng',
            value: totalOrders.toString(),
            color: 'primary',
            bgColor: 'primary-subtle'
        },
        {
            icon: DollarSign,
            label: 'Doanh thu gộp',
            value: formatCurrency(totalGrossRevenue),
            color: 'success',
            bgColor: 'success-subtle'
        },
        {
            icon: Percent,
            label: 'Phí chiết khấu',
            value: formatCurrency(totalPlatformFee),
            subValue: `${(platformCommissionRate * 100).toFixed(4)}%`,
            color: 'warning',
            bgColor: 'warning-subtle'
        },
        {
            icon: TrendingUp,
            label: 'Doanh thu ròng',
            value: formatCurrency(netRevenue),
            color: 'info',
            bgColor: 'info-subtle'
        }
    ];

    return (
        <Row className="g-3 mb-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Col key={index} xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-2">
                                    <div
                                        className={`p-2 rounded bg-${stat.bgColor} me-3`}
                                        style={{ width: '48px', height: '48px' }}
                                    >
                                        <Icon size={32} className={`text-${stat.color}`} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <p className="text-muted mb-1 small">{stat.label}</p>
                                        <h5 className="mb-0 fw-bold">{stat.value}</h5>
                                        {stat.subValue && (
                                            <small className="text-muted">{stat.subValue}</small>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};