import { BrowserRouter } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "routes/router";
import ThemeProvider from "theme";
import { ottobit } from "store/config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { setupAxiosInterceptors } from "axiosClient";

// Create an internal AppContent component to use hooks
const AppContent = () => {
  // Initialize axios interceptors
  useEffect(() => {
    setupAxiosInterceptors(ottobit);
  }, []);

  // Your Google OAuth Client ID
  const googleClientId =
    "986468886606-knqemnsdc3h29ehpv7iiovbfk13arbn8.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <HelmetProvider>
            <ThemeProvider>
              <AppRouter />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                limit={1}
              />
            </ThemeProvider>
          </HelmetProvider>
        </LocalizationProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

function App() {
  return (
    <Provider store={ottobit}>
      <AppContent />
    </Provider>
  );
}

export default App;
