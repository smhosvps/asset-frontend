import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, PlusCircle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  useDeleteItemMutation,
  useGetItemsQuery,
  useUpdateItemMutation,
} from "@/redux/features/property/itemsApi";

interface Item {
  _id: string;
  itemName: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManageCategory() {
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetItemsQuery({});


  const [
    deleteItems,
    { isLoading: isDeleting, isSuccess: sucessdelete, error: errorD },
  ] = useDeleteItemMutation();
  const [updateItem, { isLoading: isUpdating, isSuccess, error }] =
    useUpdateItemMutation();

  const categories = categoriesResponse || [];

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Item;
    direction: "asc" | "desc" | null;
  }>({
    key: "itemName",
    direction: null,
  });


  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Item | null>(null);
  const [editedItemName, setEditedItemName] = useState("");

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
    category.itemName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Pagination calculations
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filteredData?.slice(startIndex, endIndex);

  console.log(paginatedData, "paginated data")

  const getSortIcon = (key: keyof Item) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleSort = (key: keyof Item) => {
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
    if (window.confirm("Are you sure you want to delete this Item?")) {
      try {
        await deleteItems(id).unwrap();
      } catch (err) {
        alert("Error deleting category");
      }
    }
  };

  const handleOpenEditModal = (item: Item) => {
    setSelectedCategory(item);
    setEditedItemName(item.itemName);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    setEditedItemName("");
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      await updateItem({
        id: selectedCategory._id,
        itemName: editedItemName,
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
      toast.success("Item successfully updated.");
      refetch();
      setIsEditModalOpen(false);
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
    if (sucessdelete) {
      refetch();
    }
    if (errorD) {
      if ("data" in errorD) {
        const errorData = errorD as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error, sucessdelete, errorD]);

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories</div>;

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Items</h1>
        <Link to="/dashboard/add-items">
          <Button className="gap-2 bg-green-700 hover:bg-green-800">
            <PlusCircle className="h-5 w-5" />
            Add Item
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort("itemName")}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    Item Name {getSortIcon("itemName")}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button className="flex items-center gap-1 hover:text-primary">
                    Edit Item
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Delete Item</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(startIndex, endIndex).map((item) => (
                <tr key={item._id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">{item.itemName}</td>
                  <td className="py-3 px-4 text-sm">
                    <Button
                      onClick={() => handleOpenEditModal(item)}
                      variant="secondary"
                      className="text-sm bg-green-700 text-white hover:bg-green-800"
                    >
                      Edit Item
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Button
                      onClick={() => handleDelete(item._id)}
                      variant="destructive"
                      className="text-sm"
                    >
                      {isDeleting ? "Editing" : "Delete Item"}
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
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Item Name
              </Label>
              <Input
                id="categoryName"
                value={editedItemName}
                onChange={(e) => setEditedItemName(e.target.value)}
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
              onClick={handleUpdateCategory}
              disabled={
                !editedItemName.trim() ||
                editedItemName === selectedCategory?.itemName
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
