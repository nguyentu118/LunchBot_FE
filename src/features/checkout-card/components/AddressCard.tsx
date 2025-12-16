// src/features/address/components/AddressCard.tsx

import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { MapPin, Edit2, Trash2, Check } from 'lucide-react';
import { Address } from '../types/address.types';

interface AddressCardProps {
    address: Address;
    isSelected?: boolean;
    onSelect?: (address: Address) => void;
    onEdit?: (address: Address) => void;
    onDelete?: (addressId: number) => void;
    onSetDefault?: (addressId: number) => void;
    showActions?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
                                                     address,
                                                     isSelected = false,
                                                     onSelect,
                                                     onEdit,
                                                     onDelete,
                                                     onSetDefault,
                                                     showActions = true
                                                 }) => {
    return (
        <Card
            className={`mb-3 ${isSelected ? 'border-primary border-2' : 'border'}`}
            style={{
                cursor: onSelect ? 'pointer' : 'default',
                transition: 'all 0.2s'
            }}
            onClick={() => onSelect && onSelect(address)}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                        {/* Header */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <MapPin size={18} className="text-danger" />
                            <h6 className="mb-0 fw-bold">{address.contactName}</h6>
                            {address.isDefault && (
                                <Badge bg="success" className="ms-2">
                                    <Check size={14} className="me-1" />
                                    Mặc định
                                </Badge>
                            )}
                            {isSelected && (
                                <Badge bg="primary" className="ms-2">
                                    <Check size={14} className="me-1" />
                                    Đã chọn
                                </Badge>
                            )}
                        </div>

                        {/* Phone */}
                        <p className="text-muted mb-2 small">
                            <strong>SĐT:</strong> {address.phone}
                        </p>

                        {/* Address */}
                        <p className="mb-2 small">
                            {address.fullAddress}
                        </p>

                        {/* Type Badge */}
                        <Badge bg="light" text="dark" className="small">
                            {address.addressType}
                        </Badge>
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="d-flex gap-2 ms-3">
                            {onEdit && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(address);
                                    }}
                                    title="Sửa địa chỉ"
                                >
                                    <Edit2 size={16} />
                                </Button>
                            )}

                            {onDelete && !address.isDefault && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(address.id);
                                    }}
                                    title="Xóa địa chỉ"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}

                            {onSetDefault && !address.isDefault && (
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetDefault(address.id);
                                    }}
                                    title="Đặt làm mặc định"
                                >
                                    <Check size={16} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default AddressCard;