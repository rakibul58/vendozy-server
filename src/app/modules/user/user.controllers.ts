import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.services";
import config from "../../../config";
import pick from "../../../shared/pick";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdminInDb(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Admin Registered successfully!",
    data: result,
  });
});

const createVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createVendorInDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor in successfully!",
    data: result,
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createCustomerInDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer in successfully!",
    data: result,
  });
});

const getProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getUserProfileFromDB(req.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile retrieved successfully!",
      data: result,
    });
  }
);

const updateAdminProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateAdminProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const updateVendorProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateVendorProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const updateCustomerProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateCustomerProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await UserServices.getAllCustomers(options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await UserServices.getAllVendors(options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendors retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const toggleVendorStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.toggleVendorStatus(req.params.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendors updated successfully",
    data: result,
  });
});

const toggleCustomerStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.toggleCustomerStatus(req.params.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer updated successfully",
    data: result,
  });
});

const getCustomerDashboard = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getCustomerDashboard(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard Retrieved successfully",
      data: result,
    });
  }
);

const getVendorDashboard = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getVendorDashboard(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard Retrieved successfully",
      data: result,
    });
  }
);

const getAdminDashboard = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getAdminDashboard();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard Retrieved successfully",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdmin,
  createVendor,
  createCustomer,
  getProfile,
  updateAdminProfile,
  updateVendorProfile,
  updateCustomerProfile,
  getAllVendors,
  getAllCustomers,
  toggleCustomerStatus,
  toggleVendorStatus,
  getCustomerDashboard,
  getVendorDashboard,
  getAdminDashboard,
};
