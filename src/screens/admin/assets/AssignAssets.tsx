"use client";

import { useState, useEffect } from "react";
import { ArrowBigLeft, ArrowUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetAssetsQuery } from "@/redux/features/assets/assetsApi";
import {
  useGetPropertyQuery,
  useUpdatePropertyMutation,
} from "@/redux/features/property/propertyApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Asset } from "../../../components/types/asset";

interface AssignmentFormData {
  assign_assets: { assetId: string }[];
  categoryName: string;
  subCategoryName: string;
  flatNumber: string;
}

export default function AssignAssets() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activeData, isLoading, refetch } = useGetAssetsQuery([]);

  const [assetsData, setActiveAssets] = useState({
    success: false,
    count: 0,
    data: [],
  });

  useEffect(() => {
    if (activeData && activeData.data) {
      // Filter assets with active status
      const filteredAssets = {
        success: assetsData?.success,
        count: 0,
        data: activeData?.data?.filter(
          (asset: any) => asset?.status === "active"
        ),
      };

      // Update count to match filtered length
      filteredAssets.count = filteredAssets?.data?.length;

      setActiveAssets(filteredAssets);
    }
  }, [activeData]);

  const { data: propertyDetail, refetch: refetchProperty } =
    useGetPropertyQuery(id || "");
  const [updateProperty, { isLoading: isAssigning, isSuccess, error }] =
    useUpdatePropertyMutation();

  // State management
  const [data, setData] = useState<Asset[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Asset;
    direction: "asc" | "desc" | null;
  }>({ key: "_id", direction: null });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    entriesPerPage: 10,
    searchTerm: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    assign_assets: [],
    categoryName: "",
    subCategoryName: "",
    flatNumber: "",
  });

  // Data initialization
  useEffect(() => {
    if (assetsData?.data) setData(assetsData?.data);
    if (propertyDetail?.data) {
      setFormData({
        ...propertyDetail.data,
        propertyCategory: propertyDetail?.data?.propertyCategory || "",
      });
    }
  }, [assetsData, propertyDetail]);

  // Sorting functionality
  const handleSort = (key: keyof Asset) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key ? (prev.direction === "asc" ? "desc" : null) : "asc",
    }));

    const sorted = [...data].sort((a: any, b: any) => {
      if (!sortConfig.direction) return 0;
      return sortConfig.direction === "asc"
        ? a[key] > b[key]
          ? 1
          : -1
        : a[key] < b[key]
        ? 1
        : -1;
    });

    setData(sortConfig.direction ? sorted : assetsData?.data || []);
  };

  // Pagination calculations
  const filteredData = data.filter((asset) =>
    Object.values(asset).some((value) =>
      value
        ?.toString()
        .toLowerCase()
        .includes(pagination.searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / pagination.entriesPerPage);
  const currentData = filteredData.slice(
    (pagination.currentPage - 1) * pagination.entriesPerPage,
    pagination.currentPage * pagination.entriesPerPage
  );

  // Modal handlers
  const handleOpenModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      assign_assets: [{ assetId: asset._id || "" }],
      categoryName: propertyDetail?.data?.categoryName,
      subCategoryName: propertyDetail?.data?.subCategoryName,
      flatNumber: propertyDetail?.data?.flatNumber,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) throw new Error("Property ID missing");
      if (!selectedAsset) throw new Error("No asset selected");

      await updateProperty({
        id,
        ...formData,
      }).unwrap();
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to assign asset");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Aseet added successfully");
      navigate("/dashboard/properties");
      refetchProperty();
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message || "An error occurred");
      }
    }
  }, [error, isSuccess]);

  // Pagination controls
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={pagination.currentPage === i ? "default" : "outline"}
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: i }))}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex gap-1">
        <Button
          variant="outline"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: Math.max(1, prev.currentPage - 1),
            }))
          }
          disabled={pagination.currentPage === 1}
        >
          Previous
        </Button>
        {pageNumbers}
        <Button
          variant="outline"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: Math.min(totalPages, prev.currentPage + 1),
            }))
          }
          disabled={pagination.currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (isLoading) return <div className="p-4">Loading assets...</div>;

  return (
    <div className="space-y-4 p-4 bg-white">
      {/* Search and filter controls */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowBigLeft className="mr-2" /> Back
      </button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <Select
            value={pagination?.entriesPerPage?.toString()}
            onValueChange={(value) =>
              setPagination((prev) => ({
                ...prev,
                entriesPerPage: Number(value),
                currentPage: 1,
              }))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={size?.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        <Input
          type="search"
          placeholder="Search assets..."
          value={pagination.searchTerm}
          onChange={(e) =>
            setPagination((prev) => ({
              ...prev,
              searchTerm: e.target.value,
              currentPage: 1,
            }))
          }
          className="max-w-xs"
        />
      </div>

      {/* Assets table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  "S.No",
                  "Asset Name",
                  "Purchase Date",
                  "Status",
                  "Depreciation Date",
                  "Actions",
                ].map((header, index) => (
                  <th key={index} className="p-4 text-left">
                    {header === "S.No" ? (
                      header
                    ) : (
                      <button
                        onClick={() =>
                          handleSort(
                            header
                              .toLowerCase()
                              .replace(" ", "_") as keyof Asset
                          )
                        }
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        {header}
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((asset, index) => (
                <tr
                  key={asset._id}
                  className="hover:bg-muted/50 even:bg-muted/10"
                >
                  <td className="p-4">
                    {(pagination.currentPage - 1) * pagination.entriesPerPage +
                      index +
                      1}
                  </td>
                  <td className="p-4">{asset.assetName}</td>
                  <td className="p-4">
                    {new Date(asset.purchased_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 capitalize">{asset.status}</td>
                  <td className="p-4">
                    {new Date(asset.depreciation_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(asset)}
                      title="Assign to property"
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.entriesPerPage + 1}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.entriesPerPage,
            filteredData.length
          )}{" "}
          of {filteredData.length} entries
        </span>
        {renderPagination()}
      </div>

      {/* Assignment modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Assign {selectedAsset?.assetName} to Property
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Property Name</Label>
              <Input
                required
                name="propertyName"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    propertyName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Property Category</Label>
              <Input
                required
                name="propertyCategory"
                value={formData.subCategoryName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    propertyCategory: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Flat Number</Label>
              <Input
                required
                name="flatNumber"
                value={formData.flatNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    flatNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
