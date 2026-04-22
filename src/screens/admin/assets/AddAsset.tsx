"use client";

import { useCreateAssetMutation, useGetAssetsQuery } from "@/redux/features/assets/assetsApi";
import { PlusCircle, X, Upload, ArrowBigLeft } from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface AssetFormData {
  assetName: string;
  purchased_date: string;
  depreciation_date: string;
  status: string;
  asset_pictures: string[];
  asset_documents: string | null;
}

// Valid status options that match the backend validation
const VALID_STATUSES = ["active", "inactive", "maintenance", "deprecated"];

export default function AddAsset() {
  const navigate = useNavigate();
  const { refetch } = useGetAssetsQuery({})
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [createAsset, { isLoading, isSuccess, error }] =
    useCreateAssetMutation();
    
  const [assetData, setAssetData] = useState<AssetFormData>({
    assetName: "",
    purchased_date: "",
    depreciation_date: "",
    status: "",
    asset_pictures: [],
    asset_documents: null,
  });

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imageFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [imageFiles]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }
    
    // Validate total number of images
    if (files.length + imageFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    
    setImageFiles((prev) => [...prev, ...files]);
    setUploadProgress((prev) => [...prev, ...files.map(() => 0)]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;
          img.crossOrigin = "anonymous"; // Add crossOrigin to avoid CORS issues

          await new Promise((resolve) => (img.onload = resolve));

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Start with higher quality and reduce if needed
          let quality = 0.8;
          let base64 = canvas.toDataURL("image/jpeg", quality);

          // Ensure image is under 1MB (matching backend validation)
          while (base64.length > 1 * 1024 * 1024 && quality > 0.2) {
            quality -= 0.1;
            base64 = canvas.toDataURL("image/jpeg", quality);
          }

          if (base64.length > 1 * 1024 * 1024) {
            reject(new Error("Image is too large even after compression"));
            return;
          }

          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertDocumentToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert document to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateDates = () => {
    const purchaseDate = new Date(assetData.purchased_date);
    const depreciationDate = new Date(assetData.depreciation_date);
    
    if (isNaN(purchaseDate.getTime())) {
      toast.error("Invalid purchase date format");
      return false;
    }
    
    if (isNaN(depreciationDate.getTime())) {
      toast.error("Invalid depreciation date format");
      return false;
    }
    
    if (depreciationDate < purchaseDate) {
      toast.error("Depreciation date cannot be earlier than purchase date");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    const requiredFields = {
      assetName: "Asset name is required",
      purchased_date: "Purchase date is required",
      depreciation_date: "Depreciation date is required",
      status: "Status is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!assetData[field as keyof AssetFormData]) {
        toast.error(message);
        return;
      }
    }
    
    // Validate status matches backend expectations
    if (!VALID_STATUSES.includes(assetData.status.toLowerCase())) {
      toast.error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      return;
    }
    
    // Validate dates
    if (!validateDates()) {
      return;
    }

    try {
      // Show loading state
      setUploadProgress(imageFiles.map(() => 10));
      
      // Process images
      const optimizedImages = await Promise.all(
        imageFiles.map(async (file, index) => {
          try {
            setUploadProgress((prev) => {
              const newProgress = [...prev];
              newProgress[index] = 30;
              return newProgress;
            });
            
            const base64 = await optimizeImage(file);
            
            setUploadProgress((prev) => {
              const newProgress = [...prev];
              newProgress[index] = 100;
              return newProgress;
            });
            
            return base64;
          } catch (error) {
            toast.error(`Failed to process image ${index + 1}: ${(error as Error).message}`);
            throw error;
          }
        })
      );

      // Process document if exists
      let documentBase64 = null;
      if (documentFile) {
        try {
          documentBase64 = await convertDocumentToBase64(documentFile);
        } catch (error) {
          toast.error(`Failed to process document: ${(error as Error).message}`);
          return;
        }
      }

      const finalData = {
        ...assetData,
        // Ensure status is lowercase to match backend expectations
        status: assetData.status.toLowerCase(),
        asset_pictures: optimizedImages,
        asset_documents: documentBase64
      };

      await createAsset(finalData).unwrap();
      refetch()
      toast.success("Asset created successfully");
      navigate("/dashboard/assets");
    } catch (error: any) {
      const errorMessage = error?.data?.message || 
                          "Failed to create asset. Please check your inputs and try again.";
      toast.error(errorMessage);
      
      // Reset progress on error
      setUploadProgress(imageFiles.map(() => 0));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAssetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Asset successfully added.");
      navigate("/dashboard/assets");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message || "An error occurred");
      }
    }
  }, [isSuccess, error, navigate]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, and DOCX files are supported");
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document size should be less than 5MB");
      return;
    }
    
    setDocumentFile(file);
  };

  return (
    <div className="p-6 min-h-screen">
          <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowBigLeft className="mr-2" /> Back
        </button>
      <div className="mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Add New Asset</h2>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            type="button"
            className={`pb-2 px-4 ${
              activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Asset Details
          </button>
          <button
            type="button"
            className={`pb-2 px-4 ${
              activeTab === "images"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("images")}
          >
            Images ({imageFiles.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="assetName"
                  required
                  value={assetData.assetName}
                  onChange={handleInputChange}
                  placeholder="Enter asset name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="purchased_date"
                    required
                    value={assetData.purchased_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depreciation Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="depreciation_date"
                    required
                    value={assetData.depreciation_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="status"
                  required
                  value={assetData.status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="disposed">Disposed</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document (Optional)
                </label>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white hover:bg-gray-50">
                  <Upload className="w-5 h-5 mr-2 text-gray-700" />
                  <span className="text-sm">Select Document</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </label>
                {documentFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {documentFile.name}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  PDF, DOC, DOCX supported (Max 5MB)
                </p>
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Max 10)
                </label>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white hover:bg-gray-50">
                  <PlusCircle className="w-5 h-5 mr-2 text-gray-700" />
                  <span className="text-sm">Select Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  JPEG, PNG, WEBP supported (Max 1MB per image)
                </p>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Asset preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <span className="text-white text-sm font-medium">
                            {uploadProgress[index]}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Asset..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}