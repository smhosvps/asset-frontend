import type React from "react";
import { useGetUserQuery } from "@/redux/api/apiSlice";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetItemsQuery,
} from "@/redux/features/property/itemsApi";
import { useCreateRequestMutation } from "@/redux/features/requests/requestEquipmentApi";


export default function EquipmentRequestForm() {
  const { id } = useParams();
  const { data, isLoading } = useGetItemsQuery({});

  const navigate = useNavigate();
  // Get user data from Redux
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserQuery({});
  // Create request mutation hook
  const [
    createRequest,
    { isLoading: isSubmitting, error, isSuccess },
  ] = useCreateRequestMutation();

  // Form state
  const [formData, setFormData] = useState({
    itemName: "",
    issueDetails: "",
    requestDate: new Date().toISOString().split("T")[0],
    property_id: id,
    user_id: "",
    status: "pending",
  });

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Update user_id when user data is loaded
  useEffect(() => {
    if (userData?.user?._id) {
      setFormData((prev) => ({ ...prev, user_id: userData.user._id }));
    }
  }, [userData]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.itemName) {
      setStatusMessage({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    try {
      await createRequest(formData).unwrap();

      // Reset form while maintaining user_id and property_id
      setFormData((prev) => ({
        ...prev,
        itemName: "",
        issueDetails: "",
        requestDate: new Date().toISOString().split("T")[0],
      }));

      setStatusMessage({
        type: "success",
        message: "Equipment request created!",
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      console.error("Failed to create equipment request:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to create equipment request. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Success.");
      navigate("/user-dashboard");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  // Show loading state while fetching user data
  if (isUserLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-700">Loading data...</span>
      </div>
    );
  }

  // Show error if user data couldn't be loaded
  if (userError) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center text-red-700 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Unable to load user data</h3>
        </div>
        <p className="text-red-600">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
      Request Equipment Form
      </h2>

      {/* Status message */}
      {statusMessage.type && (
        <div
          className={`mb-6 p-4 rounded-md ${
            statusMessage.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {statusMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <p
              className={
                statusMessage.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {statusMessage.message}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Item Name <span className="text-red-500">*</span>
          </label>
          <select
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-describedby="service-name-description"
          >
            <option value="">Select Item</option>
            {data && data.map((option:any) => (
              <option key={option.itemName} value={option.itemName}>
                {option.itemName}
              </option>
            ))}
          </select>
          <p
            id="service-name-description"
            className="mt-1 text-sm text-gray-500"
          >
            Select the type of service you need
          </p>
        </div>

        <div>
          <label
            htmlFor="issueDetails"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Equipment Name (Optional) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="issueDetails"
            name="issueDetails"
            value={formData.issueDetails}
            onChange={handleChange}
            rows={4}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="If not available type here..."
            aria-describedby="issue-details-description"
          />
          <p
            id="issue-details-description"
            className="mt-1 text-sm text-gray-500"
          >
            List more equipment
          </p>
        </div>

        <div>
          <label
            htmlFor="requestDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Request Date
          </label>
          <input
            type="date"
            id="requestDate"
            name="requestDate"
            value={formData.requestDate}
            onChange={handleChange}
            disabled
            className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
            aria-describedby="request-date-description"
          />
          <p
            id="request-date-description"
            className="mt-1 text-sm text-gray-500"
          >
            Current date is automatically set
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !userData?.user?._id}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </span>
          ) : (
            "Submit Request"
          )}
        </button>

        {/* {isSubmitError && !statusMessage.message && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Error submitting request. Please try again.
          </p>
        )} */}
      </form>
    </div>
  );
}
