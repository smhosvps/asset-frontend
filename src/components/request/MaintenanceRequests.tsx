"use client";
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApi";
import {
  useCancelEquipmentRequestMutation,
  useGetEquipmentRequestsQuery,
  useApproveEquipmentRequestMutation,
  useDeleteEquipmentRequestMutation,
} from "@/redux/features/requests/requestMaintenanceApi";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

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
  user_property?: string;
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

const DetailsModal = ({
  isOpen,
  onClose,
  request,
  property,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: MaintenanceRequest | null;
  property: Property | undefined;
  user: User | undefined;
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Property</h4>
            <p className="text-gray-900">
              {property
                ? `${property.categoryName} › ${property.subCategoryName} › ${property.flatNumber}`
                : "Unknown Property"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Requested By
            </h4>
            <p className="text-gray-900">{user?.name || "Unknown User"}</p>
            <p className="text-gray-500 text-sm">{user?.email || ""}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Issue Details
            </h4>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
              {request.issueDetails}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(request.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MaintenanceRequest({}: Props) {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);

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
  } = useGetAllUsersQuery({});

  const {
    data: propertyData,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useGetPropertiesQuery({});

  const [cancelRequest, { isLoading: isCancelling }] =
    useCancelEquipmentRequestMutation();
  const [approveEquipmentRequest, { isLoading: isApproving }] =
    useApproveEquipmentRequestMutation();
  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteEquipmentRequestMutation();

  // State for handling request actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Function to get property details by asset ID
  const getPropertyDetailsByAssetId = (
    assetId: string
  ): Property | undefined => {
    if (!propertyData?.data) return undefined;

    return propertyData.data.find((property: Property) =>
      property.assign_assets.some((asset) => asset.assetId === assetId)
    );
  };

  // Function to get user details by user ID
  const getUserDetailsByUserId = (userId: string): User | undefined => {
    if (!userData?.users) return undefined;
    return userData.users.find((user: User) => user._id === userId);
  };

  // Function to format property display string
  const formatPropertyString = (property: Property | undefined): string => {
    if (!property) return "Unknown Property";
    return `${property.categoryName} › ${property.subCategoryName} › ${property.flatNumber}`;
  };

  // Function to handle request approval
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveEquipmentRequest({
        id,
        data: { status: "approved" },
      }).unwrap();
      alert("Request approved");
      refetch();
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  // Function to handle request cancellation
  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      await cancelRequest({ id, data: { status: "cancelled" } }).unwrap();
      alert("Request cancelled");
      refetch();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      alert("Failed to cancel request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteRequest({ id }).unwrap();
        refetch();
        alert("Request deleted");
      } catch (error) {
        console.error("Failed to delete request:", error);
        alert("Failed to delete request");
      }
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
  const maintenanceRequests: MaintenanceRequest[] =
    maintenanceData?.myservicedata || maintenanceData?.data || [];

  // Filter and search maintenance requests
  const filteredRequests = maintenanceRequests.filter((request) => {
    const matchesSearch =
      request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.issueDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatPropertyString(getPropertyDetailsByAssetId(request.property_id))
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Function to open modal with request details
  const openDetailsModal = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  // Function to close modal
  const closeDetailsModal = () => {
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Maintenance Requests
      </h2>

      {/* Search and filter controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>

        <div className="flex-shrink-0">
          <select
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex-shrink-0">
          <select
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No maintenance requests found.</p>
        </div>
      ) : (
        <>
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
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status/Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((request, index) => {
                  const property = getPropertyDetailsByAssetId(
                    request.property_id
                  );
                  const user = getUserDetailsByUserId(request.user_id);

                  return (
                    <tr key={request._id}>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.serviceName}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {request.requestDate}
                        </div>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => openDetailsModal(request)}
                            className="inline-flex items-center text-xs text-green-600 hover:text-green-800 focus:outline-none"
                          >
                            <Info className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {formatPropertyString(property)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {user?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.email || ""}
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
                              <>
                                {!isCancelling && (
                                  <button
                                    className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={() => handleApprove(request._id)}
                                    disabled={
                                      actionLoading === request._id ||
                                      isApproving
                                    }
                                  >
                                    {actionLoading === request._id &&
                                    isApproving ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Approve
                                  </button>
                                )}
                                {!isApproving && (
                                  <button
                                    className="px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={() => handleCancel(request._id)}
                                    disabled={
                                      actionLoading === request._id ||
                                      isCancelling
                                    }
                                  >
                                    {actionLoading === request._id &&
                                    isCancelling ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Cancel
                                  </button>
                                )}
                              </>
                            )}
                            {request.status !== "pending" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDelete(request._id as string)
                                }
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
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

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredRequests.length)}
              </span>{" "}
              of <span className="font-medium">{filteredRequests.length}</span>{" "}
              results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="hidden md:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="md:hidden">
                <span className="px-3 py-1 text-gray-700">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}

         {/* Details Modal */}
         <DetailsModal
        isOpen={isModalOpen}
        onClose={closeDetailsModal}
        request={selectedRequest}
        property={selectedRequest ? getPropertyDetailsByAssetId(selectedRequest.property_id) : undefined}
        user={selectedRequest ? getUserDetailsByUserId(selectedRequest.user_id) : undefined}
      />
    </div>
  );
}
