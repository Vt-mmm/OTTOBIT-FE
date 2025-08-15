import * as yup from 'yup';
import { LoginForm } from 'common/@types';

function useValidationForm() {

  const schemaLogin: yup.ObjectSchema<LoginForm> = yup.object({
    email: yup
      .string()
      .required('Sai định dạng')  // Sửa thông báo lỗi ở đây
      .email('Sai định dạng Email'),  // Sửa thông báo lỗi ở đây
    password: yup
      .string()
      .required('Sai định dạng')  // Sửa thông báo lỗi ở đây
  });

  return {
    schemaLogin,
  };
}

export default useValidationForm;
