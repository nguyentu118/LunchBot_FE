import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { revenueService } from '../services/revenueService';

interface ExportRevenueReportProps {
    yearMonth: string;
    disabled?: boolean;
}

export const ExportRevenueReport: React.FC<ExportRevenueReportProps> = ({ yearMonth, disabled = false }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            const loadingToast = toast.loading('Đang tạo báo cáo...');

            // Gọi API backend để lấy file Excel
            const blob = await revenueService.exportRevenueReportToExcel(yearMonth);

            // Tạo link download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `BaoCao_DoanhThu_${yearMonth}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success(`✅ Đã xuất báo cáo thành công!`);
        } catch (error: any) {
            console.error('Error exporting Excel:', error);
            toast.error('Lỗi khi xuất báo cáo: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            variant="outline-success"
            size="sm"
            onClick={handleExportExcel}
            disabled={exporting || disabled}
            className="d-flex align-items-center gap-2"
        >
            {exporting ? (
                <>
                    <Spinner size="sm" animation="border" />
                    Đang xuất...
                </>
            ) : (
                <>
                    <Download size={18} />
                    Xuất Excel
                </>
            )}
        </Button>
    );
};