import { AppRouter } from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <>
            <Toaster
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