import { Role } from "common/enums";
import { useNavigate as useNavigateRouter } from "react-router-dom";
import { useAppSelector } from "store/config";
import { PATH_AUTH, PATH_USER } from "routes/paths";

function useNavigate() {
  const navigate = useNavigateRouter();
  const { userAuth, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleNavigateDashboard = () => {
    if (isAuthenticated) {
      if (userAuth?.roles?.includes(Role.OTTOBIT_USER)) {
        navigate(PATH_USER.homepage);
      } else {
        navigate(PATH_AUTH.login);
      }
    }
  };

  return { navigate, handleNavigateDashboard };
}

export default useNavigate;
