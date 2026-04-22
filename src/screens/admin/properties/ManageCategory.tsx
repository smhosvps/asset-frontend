"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, PlusCircle, ArrowBigLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/features/category/categoryApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface Category {
  _id: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManageCategory() {
  const navigate = useNavigate()
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetCategoriesQuery({});
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, isSuccess, error }] =
    useUpdateCategoryMutation();

  const categories = categoriesResponse || [];

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Category;
    direction: "asc" | "desc" | null;
  }>({
    key: "categoryName",
    direction: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState("");

  // Sorting functionality
  const sortedData = [...categories].sort((a, b) => {
    if (!sortConfig.direction) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filtering functionality
  const filteredData = sortedData.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getSortIcon = (key: keyof Category) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleSort = (key: keyof Category) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        alert("Error deleting category");
      }
    }
  };

  const handleOpenEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditedCategoryName(category.categoryName);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    setEditedCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      await updateCategory({
        id: selectedCategory._id,
        categoryName: editedCategoryName,
      }).unwrap();

      handleCloseEditModal();
    } catch (err) {
      alert("Error updating category");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Category successfully updated.");
      refetch();
      setIsEditModalOpen(false);
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories</div>;

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
        <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowBigLeft className="mr-2" /> Back
            </button>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Categories</h1>
        <Link to="/dashboard/add-category">
          <Button className="gap-2 bg-green-700 hover:bg-green-800">
            <PlusCircle className="h-5 w-5" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
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
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("categoryName")}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    Category Name {getSortIcon("categoryName")}
                  </button>
                </th>
                <th className="p-4 text-left">Created At</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((category) => (
                <tr key={category._id} className="border-t hover:bg-muted/50">
                  <td className="p-4">{category.categoryName}</td>
                  <td className="p-4">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEditModal(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
        </div>

        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Category Name
              </Label>
              <Input
                id="categoryName"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-green-700 hover:bg-green-800"
              onClick={handleUpdateCategory}
              disabled={
                !editedCategoryName.trim() ||
                editedCategoryName === selectedCategory?.categoryName
              }
            >
              {isUpdating ? "Updating" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
