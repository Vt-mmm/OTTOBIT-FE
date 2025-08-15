import { Store } from '@reduxjs/toolkit';
import { RootState } from 'reduxStore/config';
import { axiosClient, axiosFormData, axiosServiceAddress, setHeaderAuth, resetAuthHeaders } from './axiosClient';
import setupAxiosClient from './setupClientInterceptors';
import setupAxiosFormData from './setupFormDataInterceptors';
import { resetInterceptorState } from './setupClientInterceptors';

// Initialize all interceptors at once
export const setupAxiosInterceptors = (store: Store<RootState>) => {
  setupAxiosClient(store);
  setupAxiosFormData(store);
};

// Export everything for use in the app
export {
  axiosClient, 
  axiosFormData, 
  axiosServiceAddress, 
  setHeaderAuth, 
  resetAuthHeaders,
  resetInterceptorState
};
