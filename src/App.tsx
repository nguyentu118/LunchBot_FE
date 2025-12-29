import { AppRouter } from './routes/AppRouter';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { useEffect } from 'react';

function App() {
    const { toasts } = useToasterStore();

    // Giới hạn số lượng toast hiển thị
    const TOAST_LIMIT = 1;

    useEffect(() => {
        toasts
            .filter((t) => t.visible) // Chỉ tính những toast đang hiện
            .filter((_, i) => i >= TOAST_LIMIT) // Những cái vượt quá giới hạn
            .forEach((t) => toast.dismiss(t.id)); // Tắt chúng đi
    }, [toasts]);

    return (
        <>
            <Toaster
                containerStyle={{ top: 40 }}
                position="top-center"
                toastOptions={{
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