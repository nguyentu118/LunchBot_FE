import { AppRouter } from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <>
            {/* ✅ Đặt Toaster ở đây */}
            <Toaster
                position="top-center" // Ví dụ: Vị trí mặc định
                toastOptions={{
                    // Các tùy chọn hiển thị chung
                    duration: 4000,
                    style: {
                        fontSize: '14px',
                    },
                }}
            />
            {/* Nội dung ứng dụng */}
            <AppRouter />
        </>
    );
}

export default App;