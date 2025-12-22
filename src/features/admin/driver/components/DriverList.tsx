import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft, MapPin, Percent, Phone, Mail, Star } from 'lucide-react';
import { getShippingPartnerById } from '../api/driverApi';
import { ShippingPartnerResponse } from '../types/driver';

const DriverList: React.FC = () => {
    const { driverId } = useParams<{ driverId: string }>();
    const navigate = useNavigate();
    const [partner, setPartner] = useState<ShippingPartnerResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!driverId) return;
            try {
                const data = await getShippingPartnerById(Number(driverId));
                console.log("Partner Detail:", data);
                setPartner(data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [driverId]);

    if (loading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center p-5">
                Không tìm thấy dữ liệu đối tác.
            </div>
        );
    }

    return (
        <div className="p-4">
            <Button
                variant="link"
                className="mb-3 p-0 text-decoration-none"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={20} className="me-2" /> Quay lại danh sách
            </Button>

            <Card className="border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <h2 className="fw-bold mb-0">{partner.name}</h2>
                            {partner.isDefault && (
                                <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                                    <Star size={12} fill="currentColor" /> Mặc định
                                </Badge>
                            )}
                        </div>
                        <Badge bg={partner.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {partner.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                    </div>

                    <Link
                        to={`/admin/drivers/update/${partner.id}`}
                        className="btn btn-outline-primary d-flex align-items-center gap-2"
                    >
                        <i className="bi bi-pencil"></i>
                        Chỉnh sửa thông tin
                    </Link>
                </div>

                <Row className="g-4">
                    <Col md={6}>
                        <div className="d-flex align-items-center gap-3 p-3 border rounded">
                            <Mail className="text-primary" size={20} />
                            <div>
                                <small className="text-muted d-block">Email liên hệ</small>
                                <span className="fw-bold">{partner.email}</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-center gap-3 p-3 border rounded">
                            <Phone className="text-primary" size={20} />
                            <div>
                                <small className="text-muted d-block">Số điện thoại</small>
                                <span className="fw-bold">{partner.phone}</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-center gap-3 p-3 border rounded">
                            <Percent className="text-primary" size={20} />
                            <div>
                                <small className="text-muted d-block">Mức chiết khấu</small>
                                <span className="fw-bold">{partner.commissionRate}%</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-center gap-3 p-3 border rounded">
                            <i className="bi bi-calendar3 text-primary fs-5"></i>
                            <div>
                                <small className="text-muted d-block">Ngày tạo</small>
                                <span className="fw-bold">
                                    {new Date(partner.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </Col>
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 p-3 border rounded">
                            <MapPin className="text-primary mt-1" size={20} />
                            <div>
                                <small className="text-muted d-block">Địa chỉ</small>
                                <span className="fw-bold">{partner.address || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default DriverList;