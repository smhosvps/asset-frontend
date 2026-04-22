"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Loader2, ArrowLeft, X } from "lucide-react"
import { useUpdateAssetMutation, useGetAssetQuery, useGetAssetsQuery } from "@/redux/features/assets/assetsApi"
import { validateDates } from "@/components/utils/assetHelpers"
import { type AssetFormData, type AssetStatus, VALID_STATUSES } from "../../../components/types/asset"

export default function EditAsset() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refetch } = useGetAssetsQuery({})

  // State management
  const [assetForm, setAssetForm] = useState<AssetFormData>({
    assetName: "",
    purchased_date: "",
    depreciation_date: "",
    status: "",
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({})

  // API hooks
  const [updateAsset, { isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateAssetMutation()
  const { data: assetData, isLoading: isAssetLoading, error: assetError } = useGetAssetQuery(id)

  // Load asset data when available
  useEffect(() => {
    if (assetData?.data) {
      const asset = assetData.data
      setAssetForm({
        assetName: asset.assetName || "",
        purchased_date: asset.purchased_date ? new Date(asset.purchased_date).toISOString().split("T")[0] : "",
        depreciation_date: asset.depreciation_date ? new Date(asset.depreciation_date).toISOString().split("T")[0] : "",
        status: asset.status || "",
      })
    }
  }, [assetData])

  // Handle update success/error
  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success("Asset successfully updated")
      navigate("/dashboard/assets")
    }

    if (updateError) {
      if ("data" in updateError) {
        const errorData = updateError as any
        toast.error(errorData.data?.message || "Failed to update asset")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }, [isUpdateSuccess, updateError, navigate])

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setAssetForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field if it exists
    if (formErrors[name as keyof AssetFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Format dates for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) return dateString

      // Format to "MMM DD YYYY"
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      }

      return date.toLocaleDateString("en-US", options)
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AssetFormData, string>> = {}

    // Check required fields
    if (!assetForm.assetName.trim()) {
      errors.assetName = "Asset name is required"
    }

    if (!assetForm.purchased_date) {
      errors.purchased_date = "Purchase date is required"
    }

    if (!assetForm.depreciation_date) {
      errors.depreciation_date = "Depreciation date is required"
    }

    if (!assetForm.status) {
      errors.status = "Status is required"
    } else if (!VALID_STATUSES.includes(assetForm.status.toLowerCase() as AssetStatus)) {
      errors.status = `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
    }

    // Validate dates
    if (assetForm.purchased_date && assetForm.depreciation_date) {
      if (!validateDates(assetForm.purchased_date, assetForm.depreciation_date)) {
        errors.depreciation_date = "Depreciation date must be after purchase date"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      // Show first error
      const firstError = Object.values(formErrors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      return
    }

    try {
      // Prepare final data
      const finalData = {
        ...assetForm,
        status: assetForm.status.toLowerCase() as AssetStatus,
      }

      // Submit update
      await updateAsset({ id, ...finalData }).unwrap()
      refetch()
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to update asset. Please try again."
      toast.error(errorMessage)
    }
  }

  // Loading and error states
  if (isAssetLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg font-medium">Loading asset data...</p>
        </div>
      </div>
    )
  }

  if (assetError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <X className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Asset</h2>
          <p className="text-gray-600 mb-6">We couldn't load the asset data. Please try again or contact support.</p>
          <button
            onClick={() => navigate("/dashboard/assets")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Update Asset</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard/assets")}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="assetName">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                id="assetName"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.assetName ? "border-red-500" : "border-gray-300"
                }`}
                name="assetName"
                value={assetForm.assetName}
                onChange={handleInputChange}
                placeholder="Enter asset name"
              />
              {formErrors.assetName && <p className="mt-1 text-sm text-red-500">{formErrors.assetName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="purchased_date">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="purchased_date"
                  type="date"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.purchased_date ? "border-red-500" : "border-gray-300"
                  }`}
                  name="purchased_date"
                  value={assetForm.purchased_date}
                  onChange={handleInputChange}
                />
                {assetForm.purchased_date && (
                  <p className="mt-1 text-sm text-gray-500">Formatted: {formatDate(assetForm.purchased_date)}</p>
                )}
                {formErrors.purchased_date && <p className="mt-1 text-sm text-red-500">{formErrors.purchased_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="depreciation_date">
                  Depreciation Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="depreciation_date"
                  type="date"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.depreciation_date ? "border-red-500" : "border-gray-300"
                  }`}
                  name="depreciation_date"
                  value={assetForm.depreciation_date}
                  onChange={handleInputChange}
                />
                {assetForm.depreciation_date && (
                  <p className="mt-1 text-sm text-gray-500">Formatted: {formatDate(assetForm.depreciation_date)}</p>
                )}
                {formErrors.depreciation_date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.depreciation_date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.status ? "border-red-500" : "border-gray-300"
                }`}
                name="status"
                value={assetForm.status}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                {VALID_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {formErrors.status && <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>}
            </div>
          </div>

          <div className="pt-6 border-t flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard/assets")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Asset"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

