"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  PlusCircle,
  Layers,
  ListTree,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  useDeletePropertyMutation,
  useGetPropertiesQuery,
} from "@/redux/features/property/propertyApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

interface Property {
  _id: string;
  categoryName: string;
  subCategoryName: string;
  flatNumber: string;
}

export default function PropertyTable() {
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPropertiesQuery({});
  const [deleteProperty, { isSuccess, error }] = useDeletePropertyMutation();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Omit<Property, "_id">;
    direction: "asc" | "desc" | null;
  }>({
    key: "categoryName",
    direction: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Extract properties data safely
  const properties: Property[] = propertiesResponse?.data || [];

  // Sorting functionality
  const sortedData = [...properties].sort((a, b) => {
    if (!sortConfig.direction) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filtering functionality
  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination calculations
  const totalFilteredEntries = filteredData.length;
  const totalPages = Math.ceil(totalFilteredEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalFilteredEntries);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSort = (key: keyof Omit<Property, "_id">) => {
    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Omit<Property, "_id">) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    if (sortConfig.direction === "asc")
      return <ChevronUp className="w-4 h-4" />;
    if (sortConfig.direction === "desc")
      return <ChevronDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("ellipsis");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("ellipsis");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handleViewAssets = (id: string) => {
    console.log("View assets:", id);
    // Implement view assets functionality
  };

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteProperty(propertyToDelete).unwrap();
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error deleting property");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Property successfully deleted.");
      refetch();
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  const cancelDelete = () => {
    setPropertyToDelete(null);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading)
    return <div className="p-8 text-center">Loading properties...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading properties. Please try again later.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Property Management</h1>
        <div className="flex gap-3">
          <Link to="/dashboard/manage-category">
            <Button variant="secondary" className="gap-2">
              <Layers className="h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link to="/dashboard/manage-sub-category">
            <Button variant="outline" className="gap-2">
              <ListTree className="h-4 w-4" />
              Sub Categories
            </Button>
          </Link>
          <Link to="/dashboard/add-properties">
            <Button className="gap-2 bg-green-700 hover:bg-green-800">
              <PlusCircle className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span>Show</span>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => setEntriesPerPage(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span>Search:</span>
            <Input
              type="search"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("categoryName")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Category Name {getSortIcon("categoryName")}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("subCategoryName")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Sub Category {getSortIcon("subCategoryName")}
                    </button>
                  </th>
                  <th className="p-4 text-left">Flat No</th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("flatNumber")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Sub-Sub Category {getSortIcon("flatNumber")}
                    </button>
                  </th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item._id} className="border-t hover:bg-muted/50">
                      <td className="p-4 uppercase">{item.categoryName}</td>
                      <td className="p-4 uppercase">{item.subCategoryName}</td>
                      <td className="p-4 uppercase">{item.flatNumber}</td>
                      <td className="p-4">
                        <Link to={`/dashboard/asign-asset/${item._id}`}>
                          <Button
                            onClick={() => handleViewAssets(item._id)}
                            variant="outline"
                            size="sm"
                            className="gap-1 bg-green-700 text-white hover:bg-green-600 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Assign Asset
                            </span>
                          </Button>
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                        <Link to={`/dashboard/view-property/${item._id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              View Assets
                            </span>
                          </Button>
                          </Link>
                          <Button
                            onClick={() => confirmDelete(item._id)}
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                          >
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {totalFilteredEntries === 0 ? 0 : startIndex + 1} to{" "}
            {endIndex} of {totalFilteredEntries} entries
            {searchTerm &&
              ` (filtered from ${properties.length} total entries)`}
          </div>

          {totalPages > 0 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {getPageNumbers().map((page, index) =>
                page === "ellipsis" ? (
                  <Button
                    key={`ellipsis-${index}`}
                    variant="outline"
                    disabled
                    className="px-2"
                  >
                    ...
                  </Button>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(Number(page))}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={
                  currentPage === totalPages || totalFilteredEntries === 0
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!propertyToDelete}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
