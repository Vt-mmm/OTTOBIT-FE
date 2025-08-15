import { axiosClient } from "axiosClient/axiosClient";
import {
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./utils";

const setSession = (accessToken: string | null, refreshToken: string) => {
  if (accessToken) {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    removeAccessToken();
    removeRefreshToken();
    delete axiosClient.defaults.headers.common.Authorization;
  }
};

const removeSession = () => {
  removeAccessToken();
  removeRefreshToken();
  delete axiosClient.defaults.headers.common.Authorization;
};

export { removeSession, setSession };
