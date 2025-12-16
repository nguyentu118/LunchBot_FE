// src/features/checkout/components/OrderSummary.tsx
// tổng thanh toán
import React from 'react';
import { Card, ListGroup, Badge, Image } from 'react-bootstrap';
import { ShoppingBag, Store, MapPin } from 'lucide-react';
import { CartItemDTO } from '../types/checkout.types';

interface OrderSummaryProps {
    merchantName: string;
    merchantAddress: string;
    items: CartItemDTO[];
    totalItems: number;
    itemsTotal: number;
    discountAmount: number;
    serviceFee: number;
    shippingFee: number;
    totalAmount: number;
    appliedCouponCode?: string | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
                                                       merchantName,
                                                       merchantAddress,
                                                       items,
                                                       totalItems,
                                                       itemsTotal,
                                                       discountAmount,
                                                       serviceFee,
                                                       shippingFee,
                                                       totalAmount,
                                                       appliedCouponCode
                                                   }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <Card className="shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 d-flex align-items-center">
                    <ShoppingBag size={20} className="text-danger me-2" />
                    Chi tiết đơn hàng
                </h5>
            </Card.Header>

            <Card.Body className="p-0">
                {/* Merchant Info */}
                <div className="p-3 bg-light border-bottom">
                    <div className="d-flex align-items-start gap-2 mb-2">
                        <Store size={18} className="text-primary mt-1" />
                        <div>
                            <h6 className="mb-1 fw-bold">{merchantName}</h6>
                            <p className="mb-0 small text-muted d-flex align-items-start gap-1">
                                <MapPin size={14} className="mt-1" />
                                <span>{merchantAddress}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <ListGroup variant="flush">
                    {items.map((item) => (
                        <ListGroup.Item key={item.id} className="px-3 py-2">
                            <div className="d-flex gap-3">
                                <Image
                                    src={item.dishImage || 'https://via.placeholder.com/60'}
                                    alt={item.dishName}
                                    rounded
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 small">{item.dishName}</h6>
                                    <p className="mb-1 small text-muted">
                                        {formatPrice(item.price)} x {item.quantity}
                                    </p>
                                    <p className="mb-0 fw-bold text-danger small">
                                        {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Price Breakdown */}
                <div className="p-3 border-top">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Tạm tính ({totalItems} món)</span>
                        <span className="small">{formatPrice(itemsTotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">
                Giảm giá
                  {appliedCouponCode && (
                      <Badge bg="success" className="ms-2 small">
                          {appliedCouponCode}
                      </Badge>
                  )}
              </span>
                            <span className="small text-success">-{formatPrice(discountAmount)}</span>
                        </div>
                    )}

                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Phí dịch vụ</span>
                        <span className="small">
              {serviceFee === 0 ? 'Miễn phí' : formatPrice(serviceFee)}
            </span>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                        <span className="text-muted small">Phí vận chuyển</span>
                        <span className="small">{formatPrice(shippingFee)}</span>
                    </div>

                    <div className="d-flex justify-content-between pt-3 border-top">
                        <span className="fw-bold">Tổng thanh toán</span>
                        <span className="fw-bold fs-5 text-danger">
              {formatPrice(totalAmount)}
            </span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default OrderSummary;