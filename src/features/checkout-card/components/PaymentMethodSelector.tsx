// src/features/checkout/components/PaymentMethodSelector.tsx

import React from 'react';
import { Card, Form, Badge } from 'react-bootstrap';
import { CreditCard, Wallet } from 'lucide-react';
import { PaymentMethod } from '../types/checkout.types';
// phương thức thanh toán
interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onSelectMethod: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
                                                                         selectedMethod,
                                                                         onSelectMethod
                                                                     }) => {
    const paymentMethods = [
        {
            value: PaymentMethod.COD,
            label: 'Thanh toán khi nhận hàng (COD)',
            icon: <Wallet size={24} className="text-success" />,
            description: 'Thanh toán bằng tiền mặt khi nhận hàng',
            badge: 'Phổ biến'
        },
        {
            value: PaymentMethod.CARD,
            label: 'Thanh toán bằng thẻ',
            icon: <CreditCard size={24} className="text-primary" />,
            description: 'Visa, Mastercard, JCB, ATM nội địa',
            badge: 'Sắp có'
        }
    ];

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 d-flex align-items-center">
                    <CreditCard size={20} className="text-danger me-2" />
                    Phương thức thanh toán
                </h5>
            </Card.Header>

            <Card.Body>
                {paymentMethods.map((method) => (
                    <Card
                        key={method.value}
                        className={`mb-3 ${selectedMethod === method.value ? 'border-primary border-2' : 'border'}`}
                        style={{
                            cursor: method.value === PaymentMethod.CARD ? 'not-allowed' : 'pointer',
                            opacity: method.value === PaymentMethod.CARD ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            if (method.value !== PaymentMethod.CARD) {
                                onSelectMethod(method.value);
                            }
                        }}
                    >
                        <Card.Body>
                            <div className="d-flex align-items-start">
                                <Form.Check
                                    type="radio"
                                    id={`payment-${method.value}`}
                                    name="paymentMethod"
                                    checked={selectedMethod === method.value}
                                    onChange={() => {
                                        if (method.value !== PaymentMethod.CARD) {
                                            onSelectMethod(method.value);
                                        }
                                    }}
                                    disabled={method.value === PaymentMethod.CARD}
                                    className="me-3 mt-1"
                                />

                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        {method.icon}
                                        <h6 className="mb-0 fw-bold">{method.label}</h6>
                                        {method.badge && (
                                            <Badge
                                                bg={method.value === PaymentMethod.CARD ? 'secondary' : 'success'}
                                                className="ms-2"
                                            >
                                                {method.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted mb-0 small">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </Card.Body>
        </Card>
    );
};

export default PaymentMethodSelector;