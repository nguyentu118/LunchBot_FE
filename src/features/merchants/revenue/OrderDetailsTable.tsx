import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import { OrderRevenueDetail } from '../types/revenue.types.ts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderDetailsTableProps {
    orders: OrderRevenueDetail[];
}

export const OrderDetailsTable: React.FC<OrderDetailsTableProps> = ({ orders }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    if (orders.length === 0) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                    <p className="text-muted mb-0">Không có đơn hàng nào trong tháng này</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
                <h6 className="mb-0">Chi tiết đơn hàng ({orders.length})</h6>
            </Card.Header>
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Hoàn thành</th>
                            <th className="text-end">Tổng món</th>
                            <th className="text-end">Giảm giá</th>
                            <th className="text-end">Doanh thu</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.orderId}>
                                <td>
                                    <Badge bg="primary" className="font-monospace fs-6" >
                                        {order.orderNumber}
                                    </Badge>
                                </td>
                                <td className="small text-muted">
                                    {formatDateTime(order.orderDate)}
                                </td>
                                <td className="small text-muted">
                                    {formatDateTime(order.completedAt)}
                                </td>
                                <td className="text-end">
                                    {formatCurrency(order.itemsTotal)}
                                </td>
                                <td className="text-end text-danger">
                                    -{formatCurrency(order.discountAmount)}
                                </td>
                                <td className="text-end fw-bold text-success">
                                    {formatCurrency(order.revenue)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};