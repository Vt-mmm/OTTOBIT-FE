import { NavigateFunction } from "react-router-dom";

export interface OptionParams {
  keySearchName?: string | null;
  searchValue?: string | null;
  searchName?: string | null;
  itemsPerPage?: number | null | string;
  currentPage?: number | null | string;
  isGetAll?: boolean | null | string;
  status?: boolean | null | string;
  type?: boolean | null | string;
  sortBy?: string | null;
  keySortName?: string | null;
  keySortCode?: string | null;
  keySortStatus?: string | null;
  keySortCommission?: string | null;
  systemStatus?: string | null;
  partnerOrderStatus?: string | null;
  isUpdateStatus?: boolean;
  searchDateFrom?: Date | string | null;
  searchDateTo?: Date | string | null;
  searchDate?: Date | string | null;
  exchangeType?: string | null;
  paymentMethod?: string | null;
  confirmedBy?: boolean | null | string;
  isDetailList?: boolean | null;
  email?: string | null;
}

export interface IdParams {
  kitchenCenterId?: number;
  brandId?: number;
  storeId?: number;
  categoryId?: number;
  productId?: number;
  partnerId?: number;
  accountId?: number;
  cashierId?: number;
  bankingAccountId?: number;
  orderId?: number;
}

export interface ListParams {
  pathname?: string;
  optionParams: OptionParams;
  navigate: NavigateFunction;
}

export interface OneModelParams {
  idParams: IdParams;
  navigate: NavigateFunction;
}

export interface Params<T> {
  data?: T;
  pathname?: string;
  idParams?: IdParams;
  optionParams?: OptionParams;
  navigate?: NavigateFunction;
  callback?: {
    onSuccess?: () => void;
    onError?: (errorMessage: string) => void;
  };
}

export interface LoginResponse {
  userId: string;
  username?: string;
  email: string;
  fullName: string;
  roles: string[]; // Array để phản ánh nhiều vai trò
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface MessageResponse {
  message: string;
}

export interface ListResponse<T> {
  totalPages: number;
  numberItems: number;
  data: T[];
}

export interface ListResponseAddress<T> {
  results: T[];
}

export interface WordLimited {
  wordString: string;
  lengthLimit: number;
  end?: string;
}

export interface OptionSelect {
  value: string;
  label: string;
  id: string;
}

export interface ErrorResponse {
  errorMessage: string;
  fieldNameError: string;
  statusCode: number;
}

export interface EmailValidateResponse {
  email: string;
  user: string;
  domain: string;
  status: string;
  reason: string;
  disposable: boolean;
}

export interface ActionPayloadErrorData {
  Message: {
    FieldNameError: string;
    DescriptionError: string[];
  }[];
  StatusCode: number;
}
