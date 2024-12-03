export type TAdminPayload = {
  password: string;
  admin: {
    email: string;
    name: string;
    phone: string;
  };
};

export type TVendorPayload = {
  password: string;
  vendor: {
    name: string;
    email: string;
    phone: string;
    description?: string;
    logo?: string;
  };
};

export type TCustomerPayload = {
  password: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    profileImg: string;
  };
};
