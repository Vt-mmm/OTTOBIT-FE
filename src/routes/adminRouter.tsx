import { useState, useEffect } from 'react';
import { Role } from 'common/enums';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from 'reduxStore/config';
import { getAccessToken } from 'utils';
import { PATH_AUTH } from './paths';

// Loading component
const AdminLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    fontSize: '18px',
    color: '#333',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{ marginBottom: '16px' }}>Đang tải trang quản trị...</div>
    <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #6ACCD9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function AdminRouter() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null);
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);

  // Đảm bảo token được load từ localStorage mỗi khi component mount
  // và khi url location thay đổi
  useEffect(() => {
    const token = getAccessToken();
    setLocalAccessToken(token || null);
    
    // Đặt một timeout ngắn để đảm bảo Redux store đã được hydrate
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    return <AdminLoading />;
  }

  // Nếu có token trong localStorage và user có role admin, hiển thị nội dung admin
  const hasAdminAccess = isAuthenticated && localAccessToken && userAuth?.roles?.includes(Role.OTTOBIT_ADMIN);
  
  if (hasAdminAccess) {
    return <Outlet />;
  } else {
    // Redirect to login instead of 403 page
    return <Navigate to={PATH_AUTH.login} state={{ from: location }} replace />;
  }
}

export default AdminRouter;
