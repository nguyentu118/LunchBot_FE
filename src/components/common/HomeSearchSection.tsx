import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

const HomeSearchSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const navigate = useNavigate();

    const handleQuickSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (searchQuery.trim()) {
            navigate(`/dishes/search?name=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <Row className="justify-content-center mb-4">
            <Col xs={12} lg={10} xl={9}>
                <Card className="p-2 shadow-lg rounded-4 border-0">
                    <Form
                        className="d-flex flex-column flex-md-row gap-2 align-items-stretch"
                        onSubmit={handleQuickSearch}
                    >
                        <div className="d-flex gap-2 flex-grow-1">
                            <InputGroup className="bg-light rounded-3 p-1 flex-grow-1">
                                <InputGroup.Text className="bg-light border-0">
                                    <Search size={20} className="text-muted"/>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm món ăn: phở, cơm, bún..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 bg-light"
                                />
                            </InputGroup>
                        </div>
                        <Button
                            variant="danger"
                            type="submit"
                            className="fw-bold px-5 shadow-sm"
                            style={{minWidth: '120px'}}
                            disabled={!searchQuery.trim()}
                        >
                            Tìm kiếm
                        </Button>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default HomeSearchSection;