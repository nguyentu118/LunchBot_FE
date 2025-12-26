import React from 'react';
import { Form } from 'react-bootstrap';
import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
    selectedMonth: string; // Format: "2025-12"
    onChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onChange }) => {
    // Generate danh sách tháng (12 tháng gần nhất)
    const generateMonthOptions = () => {
        const options: { value: string; label: string }[] = [];
        const today = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const value = `${year}-${month}`;
            const label = `Tháng ${month}/${year}`;
            options.push({ value, label });
        }

        return options;
    };

    return (
        <div className="d-flex align-items-center gap-2">
            <Calendar size={20} className="text-primary" />
            <Form.Select
                value={selectedMonth}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: '200px' }}
            >
                {generateMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};