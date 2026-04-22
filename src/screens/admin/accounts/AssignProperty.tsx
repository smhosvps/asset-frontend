"use client";

import { useState, useEffect } from "react";
import { ArrowBigLeft, ArrowUpDown, Building2, Eye } from "lucide-react";
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
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Asset } from "../../../components/types/asset";
import {
  useAddUserPropertyMutation,
  useGetAllUsersQuery,
  useGetDetailUserQuery,
} from "@/redux/features/user/userApi";

interface AssignmentFormData {
  user_property: { propertyId: string }[];
  categoryName: string;
  subCategoryName: string;
  flatNumber: string;
}

export default function AssignProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refetch: refetchUsers } = useGetAllUsersQuery({});
  const { data: assetsData, isLoading, refetch } = useGetPropertiesQuery([]);
  const [addUserProperty, { isLoading: isAssigning, isSuccess, error }] =
    useAddUserPropertyMutation();

  const { data: propertyDetail, refetch: refetchProperty } =
    useGetDetailUserQuery(id || "");

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
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    user_property: [],
    categoryName: "",
    subCategoryName: "",
    flatNumber: "",
  });

  // Data initialization
  useEffect(() => {
    if (assetsData?.data) setData(assetsData.data);
    if (propertyDetail?.data) {
      setFormData({
        ...propertyDetail.data,
        propertyCategory: propertyDetail.data.propertyCategory || "",
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
  const handleOpenModal = (asset: any) => {
    setSelectedAsset(asset);
    setFormData({
      user_property: [{ propertyId: asset._id || "" }],
      categoryName: asset?.categoryName,
      subCategoryName: asset?.subCategoryName,
      flatNumber: asset?.flatNumber,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) throw new Error("Property ID missing");
      if (!selectedAsset) throw new Error("No asset selected");

      addUserProperty({ userId: id, property: selectedAsset._id }).unwrap();
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to assign property");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Property added successfully");
      navigate("/dashboard/accounts");
      refetchProperty();
      refetchUsers();
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

  if (isLoading) return <div className="p-4">Loading properties...</div>;

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
            value={pagination.entriesPerPage.toString()}
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
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        <Input
          type="search"
          placeholder="Search properties..."
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
                  "Property Name",
                  "Subcategory",
                  "Flat Number",
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
              {currentData.map((asset: any, index: number) => (
                <tr
                  key={asset._id}
                  className="hover:bg-muted/50 even:bg-muted/10"
                >
                  <td className="p-4">
                    {(pagination.currentPage - 1) * pagination.entriesPerPage +
                      index +
                      1}
                  </td>
                  <td className="p-4">{asset.categoryName}</td>
                  <td className="p-4">{asset.subCategoryName}</td>
                  <td className="p-4 capitalize">{asset.flatNumber}</td>
                  <td className="p-4 gap-3 flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(asset)}
                      title="Assign to user"
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Link to={`/dashboard/view-property/${asset._id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(asset)}
                        title="See Assigned Assets"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    </Link>
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
              Assign{" "}
              <strong className="text-green-700 font-medium">
                {selectedAsset?.categoryName}
              </strong>{" "}
              to{" "}
              <strong className="text-blue-500 font-medium">
                {propertyDetail?.name}
              </strong>
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
