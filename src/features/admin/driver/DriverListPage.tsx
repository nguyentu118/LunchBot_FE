import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { Eye, Lock, Mail, Plus, Star, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DriverCreateModal from './components/DriverCreateModal';
import { ShippingPartnerResponse } from './types/driver';
import { getAllShippingPartners, setDefaultPartner, toggleDriverLock } from './api/driverApi';
import toast from 'react-hot-toast';

const DriverListPage: React.FC = () => {
    const [drivers, setDrivers] = useState<ShippingPartnerResponse[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // ✅ State cho modal lý do khóa
    const [showLockReasonModal, setShowLockReasonModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<ShippingPartnerResponse | null>(null);
    const [lockReason, setLockReason] = useState('');
    const [submittingLock, setSubmittingLock] = useState(false);

    const fetchDrivers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllShippingPartners();
            console.log("Fetched data length:", data.length);
            setDrivers(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đối tác", error);
            setDrivers([]);
            toast.error("Không thể tải danh sách đối tác");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    // ✅ Mở modal yêu cầu lý do
    const openLockReasonModal = (driver: ShippingPartnerResponse) => {
        setSelectedDriver(driver);
        setLockReason('');
        setShowLockReasonModal(true);
    };

    // ✅ Đóng modal lý do
    const closeLockReasonModal = () => {
        setShowLockReasonModal(false);
        setSelectedDriver(null);
        setLockReason('');
    };

    // ✅ Xử lý toggle lock với lý do
    const handleToggleLockWithReason = async () => {
        if (!lockReason.trim()) {
            toast.error('Vui lòng nhập lý do');
            return;
        }

        if (!selectedDriver) {
            toast.error('Không tìm thấy đối tác');
            return;
        }

        try {
            setSubmittingLock(true);
            setLoadingId(selectedDriver.id);

            // Gọi API với lý do khóa
            await toggleDriverLock(selectedDriver.id, lockReason);

            // Cập nhật state drivers
            setDrivers(prevDrivers =>
                prevDrivers.map(d =>
                    d.id === selectedDriver.id ? { ...d, isLocked: !d.isLocked } : d
                )
            );

            // Hiển thị toast thành công
            if (selectedDriver.isLocked) {
                toast.success("Tài khoản đã được mở khóa. Email thông báo được gửi!");
            } else {
                toast.success("Tài khoản đã bị khóa. Email thông báo được gửi!");
            }

            // Đóng modal và reset form
            closeLockReasonModal();
        } catch (error: any) {
            console.error("Lỗi khi khóa/mở khóa:", error);

            // Hiển thị thông báo lỗi chi tiết
            const errorMessage = error?.response?.data?.message || "Thao tác thất bại";
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setSubmittingLock(false);
            setLoadingId(null);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            setLoadingId(id);
            await setDefaultPartner(id);

            setDrivers(prevDrivers =>
                prevDrivers.map(d => ({
                    ...d,
                    isDefault: d.id === id ? true : false
                }))
            );
            toast.success("Đã thay đổi đối tác mặc định");
        } catch (error) {
            console.error("Lỗi khi set default:", error);
            toast.error("❌ Không thể thay đổi mặc định");
        } finally {
            setLoadingId(null);
        }
    };

    console.log("Render with drivers.length:", drivers.length);

    return (
        <div className="driver-management p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0 text-dark">Quản lý đối tác vận chuyển</h4>
                    <p className="text-muted small mb-0">Hệ thống quản lý thông tin các đơn vị giao hàng</p>
                </div>
                <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Thêm đối tác
                </Button>
            </div>

            {/* ✅ LOADING STATE */}
            {isLoading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 mb-0 text-muted">Đang tải dữ liệu...</p>
                </div>
            )}

            {/* ✅ HAS DATA STATE */}
            {!isLoading && drivers.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light border-bottom">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase small fw-bold">ID</th>
                                <th className="py-3 text-uppercase small fw-bold">Tên đối tác</th>
                                <th className="py-3 text-uppercase small fw-bold">Email</th>
                                <th className="py-3 text-uppercase small fw-bold">Số điện thoại</th>
                                <th className="py-3 text-uppercase small fw-bold">Chiết khấu</th>
                                <th className="py-3 text-uppercase small fw-bold">Trạng thái</th>
                                <th className="text-end pe-4 py-3 text-uppercase small fw-bold">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {drivers.map((driver) => (
                                <tr key={driver.id} className="align-middle border-bottom">
                                    <td className="ps-4 text-muted">#{driver.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-bold text-dark">{driver.name}</span>
                                                    {driver.isDefault && (
                                                        <Badge
                                                            bg="warning"
                                                            text="dark"
                                                            className="d-flex align-items-center gap-1 px-2"
                                                            style={{ fontSize: '0.7rem' }}
                                                        >
                                                            <Star size={10} fill="currentColor" /> Mặc định
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div
                                                    className="small text-muted text-truncate"
                                                    style={{ maxWidth: '200px' }}
                                                >
                                                    {driver.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Mail size={14} className="text-muted" />
                                            <span className="small">{driver.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-monospace">{driver.phone}</span>
                                    </td>
                                    <td>
                                        <Badge bg="light" className="text-dark border fw-normal">
                                            {driver.commissionRate}%
                                        </Badge>
                                    </td>
                                    <td>
                                        {driver.isLocked ? (
                                            <Badge bg="danger" className="text-white fw-medium px-2 py-1">
                                                Đang khóa
                                            </Badge>
                                        ) : (
                                            <Badge bg="success" className="text-white fw-medium px-2 py-1">
                                                Hoạt động
                                            </Badge>
                                        )}
                                    </td>

                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2 align-items-center">
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none"
                                                onClick={() => !driver.isDefault && handleSetDefault(driver.id)}
                                                title={driver.isDefault ? "Đang là mặc định" : "Đặt làm mặc định"}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: driver.isDefault ? 'default' : 'pointer'
                                                }}
                                                disabled={driver.isDefault || loadingId === driver.id}
                                            >
                                                {loadingId === driver.id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <Star
                                                        size={20}
                                                        fill={driver.isDefault ? "#ffc107" : "none"}
                                                        color={driver.isDefault ? "#ffc107" : "#6c757d"}
                                                    />
                                                )}
                                            </Button>

                                            <Link
                                                to={`/admin/drivers/${driver.id}`}
                                                className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                                                title="Xem chi tiết"
                                                style={{ width: '32px', height: '32px' }}
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            {/* ✅ Gọi modal thay vì gọi trực tiếp */}
                                            <Button
                                                variant={driver.isLocked ? "outline-success" : "outline-danger"}
                                                size="sm"
                                                className="d-flex align-items-center justify-content-center"
                                                onClick={() => openLockReasonModal(driver)}
                                                title={driver.isLocked ? "Mở khóa" : "Khóa"}
                                                style={{ width: '32px', height: '32px' }}
                                                disabled={loadingId === driver.id}
                                            >
                                                {loadingId === driver.id ? (
                                                    <Spinner size="sm" />
                                                ) : driver.isLocked ? (
                                                    <Unlock size={16} />
                                                ) : (
                                                    <Lock size={16} />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Card.Body>

                    <Card.Footer className="bg-light border-top py-2 px-4">
                        <small className="text-muted">
                            Tổng số: <strong>{drivers.length}</strong> đối tác
                            {' | '}
                            Hoạt động: <strong className="text-success">
                            {drivers.filter(d => d.status === 'ACTIVE').length}
                        </strong>
                            {' | '}
                            Mặc định: <strong className="text-warning">
                            {drivers.filter(d => d.isDefault).length}
                        </strong>
                        </small>
                    </Card.Footer>
                </Card>
            )}

            {/* ✅ EMPTY STATE */}
            {!isLoading && drivers.length === 0 && (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                        <div className="text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                            <p className="mb-0">Chưa có đối tác nào trong danh sách.</p>
                            <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => setShowModal(true)}
                            >
                                Thêm đối tác đầu tiên
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* ✅ MODAL LÝ DO KHÓA/MỞ KHÓA */}
            <Modal show={showLockReasonModal} onHide={closeLockReasonModal} centered>
                <Modal.Header closeButton className={selectedDriver?.isLocked ? 'bg-success' : 'bg-danger'}>
                    <Modal.Title className="text-white fw-bold">
                        {selectedDriver?.isLocked ? '✅ Mở khóa tài khoản' : '🔒 Khóa tài khoản'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDriver && (
                        <>
                            <div className="alert alert-warning d-flex gap-2 align-items-start" role="alert">
                                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                <div>
                                    <strong>Lưu ý:</strong> Vui lòng nhập lý do {selectedDriver.isLocked ? 'mở khóa' : 'khóa'} tài khoản.
                                    <br />
                                    <small>Đối tác sẽ nhận email thông báo với nội dung lý do này.</small>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="text-muted mb-2">
                                    <strong>Đối tác:</strong> {selectedDriver.name} ({selectedDriver.email})
                                </p>
                                <p className="text-muted mb-3">
                                    <strong>Trạng thái hiện tại:</strong>{' '}
                                    <Badge bg={selectedDriver.isLocked ? 'danger' : 'success'} className="ms-2">
                                        {selectedDriver.isLocked ? 'Đang khóa' : 'Hoạt động'}
                                    </Badge>
                                </p>
                            </div>

                            <Form.Group className="mb-0">
                                <Form.Label className="fw-bold mb-2">
                                    {selectedDriver.isLocked ? 'Lý do mở khóa' : 'Lý do khóa'} <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder={
                                        selectedDriver.isLocked
                                            ? 'VD: Tài khoản đã được xác minh lại, có thể hoạt động bình thường...'
                                            : 'VD: Giao hàng chậm, nhiều khiếu nại từ khách hàng...'
                                    }
                                    value={lockReason}
                                    onChange={(e) => setLockReason(e.target.value)}
                                    disabled={submittingLock}
                                />
                                <small className="text-muted d-block mt-2">
                                    Nội dung này sẽ được gửi trong email thông báo cho đối tác
                                </small>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={closeLockReasonModal}
                        disabled={submittingLock}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant={selectedDriver?.isLocked ? 'success' : 'danger'}
                        onClick={handleToggleLockWithReason}
                        disabled={submittingLock || !lockReason.trim()}
                    >
                        {submittingLock ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Đang xử lý...
                            </>
                        ) : selectedDriver?.isLocked ? (
                            'Mở khóa'
                        ) : (
                            'Khóa'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <DriverCreateModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={fetchDrivers}
            />
        </div>
    );
};

export default DriverListPage;