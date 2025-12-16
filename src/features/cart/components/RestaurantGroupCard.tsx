// features/cart/components/RestaurantGroupCard.tsx

import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { Store } from 'lucide-react';
import { CartItem } from '../types/cart';
import CartItemCard from './CartItemCard';

interface RestaurantGroupCardProps {
    restaurantId: number;
    restaurantName: string;
    items: CartItem[];
    isSelected: boolean;
    selectedItems: Set<number>;
    onSelectGroup: (restaurantId: number, selected: boolean) => void;
    onSelectItem: (dishId: number, selected: boolean) => void;
    onUpdateQuantity: (dishId: number, newQuantity: number) => Promise<void>;
    onRemove: (dishId: number) => Promise<void> | void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const RestaurantGroupCard: React.FC<RestaurantGroupCardProps> = ({
                                                                     restaurantId,
                                                                     restaurantName,
                                                                     items,
                                                                     isSelected,
                                                                     selectedItems,
                                                                     onSelectGroup,
                                                                     onSelectItem,
                                                                     onUpdateQuantity,
                                                                     onRemove
                                                                 }) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

    const handleGroupCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectGroup(restaurantId, e.target.checked);
    };

    return (
        <Card className="mb-4 shadow-sm border-0">
            {/* Header của nhóm cửa hàng */}
            <Card.Header
                className="bg-white border-bottom py-3"
                style={{ backgroundColor: '#f8f9fa' }}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleGroupCheckboxChange}
                            className="me-3"
                            style={{ transform: 'scale(1.2)' }}
                        />

                        <div className="d-flex align-items-center">
                            <div
                                className="bg-danger bg-opacity-10 p-2 rounded-circle me-2"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <Store size={24} className="text-danger" />
                            </div>
                            <div>
                                <h5 className="mb-0 fw-bold text-dark">{restaurantName}</h5>
                                <small className="text-muted">
                                    {totalItems} món • {formatCurrency(totalPrice)}
                                </small>
                            </div>
                        </div>
                    </div>

                    {isSelected && (
                        <span className="badge bg-danger px-3 py-2">
                            Đã chọn
                        </span>
                    )}
                </div>
            </Card.Header>

            {/* Danh sách món trong cửa hàng */}
            <Card.Body className="p-3">
                <div className="d-flex flex-column gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="d-flex align-items-start">
                            <Form.Check
                                type="checkbox"
                                checked={selectedItems.has(item.dishId)}
                                onChange={(e) => onSelectItem(item.dishId, e.target.checked)}
                                className="me-3 mt-3"
                                style={{ transform: 'scale(1.2)' }}
                            />

                            <div className="flex-grow-1">
                                <CartItemCard
                                    item={item}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onRemove={onRemove}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

export default RestaurantGroupCard;