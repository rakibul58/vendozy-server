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

export interface AdminDashboardData {
  analytics: {
    totalRevenue: number;
    activeVendors: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  vendorMetrics: {
    activeVendors: number;
    pendingOnboarding: number;
    blacklisted: number;
  };
  revenueChart: {
    month: string;
    amount: number;
  }[];
  topVendors: {
    id: string;
    name: string;
    revenue: number;
    totalOrders: number;
    averageRating: number;
  }[];
  customerMetrics: {
    active: number;
    inactive: number;
  };
  recentOrders: {
    id: string;
    customer: string;
    vendor: string;
    amount: number;
    status: string;
    date: Date;
  }[];
}

export type TVendorFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
};