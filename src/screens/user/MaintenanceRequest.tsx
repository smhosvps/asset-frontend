"use client";

import { useGetUserQuery } from "@/redux/api/apiSlice";
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApi";
import {
  useCancelEquipmentRequestMutation,
  useGetEquipmentRequestsQuery,
} from "@/redux/features/requests/requestMaintenanceApi";
import { Loader2, XCircle, AlertCircle } from "lucide-react";
type Props = {};

// Define types for our data structures
interface MaintenanceRequest {
  _id: string;
  serviceName: string;
  issueDetails: string;
  requestDate: string;
  property_id: string;
  status: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  user_property: string;
  [key: string]: any;
}

interface Property {
  _id: string;
  categoryName: string;
  subCategoryName: string;
  flatNumber: string;
  assign_assets: Array<{
    assetId: string;
    _id: string;
  }>;
  [key: string]: any;
}

export default function MaintenanceRequest({}: Props) {
  // Fetch data using RTK Query hooks
  const {
    data: maintenanceData,
    isLoading: isMaintenanceLoading,
    error: maintenanceError,
    refetch,
  } = useGetEquipmentRequestsQuery({});
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserQuery({});
  const {
    data: propertyData,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useGetPropertiesQuery({});
  const [cancelRequest, { isLoading: isCancelling }] =
    useCancelEquipmentRequestMutation();

  // Function to get property details by asset ID
  const getPropertyDetailsByAssetId = (
    assetId: string
  ): Property | undefined => {
    if (!propertyData?.data) return undefined;

    return propertyData.data.find((property: Property) =>
      property.assign_assets.some((asset) => asset.assetId === assetId)
    );
  };

  // Function to format property display string
  const formatPropertyString = (property: Property | undefined): string => {
    if (!property) return "Unknown Property";
    return `${property.categoryName} › ${property.subCategoryName} › ${property.flatNumber}`;
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest({ id, data: { status: "cancelled" } }).unwrap();
      alert("Request cancelled successfully");
      refetch();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      alert("Failed to cancel request");
    }
  };

  // Show loading state
  if (isMaintenanceLoading || isUserLoading || isPropertyLoading) {
    return (
      <div className="flex justify-center items-center h-64 p-6 bg-white rounded-lg shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-700">Loading data...</span>
      </div>
    );
  }

  // Show error state
  if (maintenanceError || userError || propertyError) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center text-red-700 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Error loading data</h3>
        </div>
        <p className="text-red-600">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  // Get the maintenance requests
  const maintenanceRequests: MaintenanceRequest[] = maintenanceData?.data || [];

  const currentUser: User = userData?.user;

  // Filter maintenance requests where user_id matches current user's _id
  const userRequests = maintenanceRequests.filter(
    (request) => request.user_id === currentUser?._id
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Maintenance Requests
      </h2>

      {userRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No maintenance requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Request Info
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status/Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userRequests.map((request, index) => {
                const property = getPropertyDetailsByAssetId(
                  request.property_id
                );

                return (
                  <tr key={request._id}>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.serviceName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {request.requestDate}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-xs overflow-hidden text-ellipsis">
                        {request.issueDetails}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {formatPropertyString(property)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </div>

                        <div className="flex items-center space-x-2">
                          {request.status === "pending" && (
                            <button
                              className="px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              onClick={() =>
                                handleCancel(request._id as string)
                              }
                              disabled={isCancelling}
                            >
                              {isCancelling ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
