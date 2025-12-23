import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const AnalyticsPage: React.FC = () => {
    return (
        <div>
            {/* Sub Navigation Tabs */}
            <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                    <NavLink
                        to="/merchant/analytics/revenue"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Doanh số
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/merchant/analytics/dishes"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Theo món
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/merchant/analytics/customers"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Theo khách hàng
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/merchant/analytics/coupons"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Theo mã giảm giá
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/merchant/analytics/order-status"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Trạng thái
                    </NavLink>
                </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default AnalyticsPage;