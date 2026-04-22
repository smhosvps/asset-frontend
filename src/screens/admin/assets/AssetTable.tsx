"use client"

import { useState, useEffect } from "react"
import { Eye, Trash2, ArrowUpDown, PlusCircle, Loader2, CheckCircle, XCircle, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Link } from "react-router-dom"
import {
  useDeleteAssetMutation,
  useDeprecatedAssetsMutation,
  useDisposedAssetMutation,
  useGetAssetsQuery,
} from "@/redux/features/assets/assetsApi"
import { toast } from "react-toastify"

interface Asset {
  _id: string
  assetName: string
  purchased_date: string
  status: string
  depreciation_date: string
  asset_documents: any // Adjust this type as needed
}

// Helper function to format dates
const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A"

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

export default function AssetTable() {
  const { data: datax, isLoading, refetch } = useGetAssetsQuery({})
  const [deprecatedAssets, { isLoading: isApproving }] = useDeprecatedAssetsMutation()
  // State for handling request actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [disposedAsset, { isLoading: isCancelling }] = useDisposedAssetMutation()
  const [deleteAsset, { isLoading: loading, error, isSuccess }] = useDeleteAssetMutation()
  const [data, setData] = useState<Asset[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Asset
    direction: "asc" | "desc" | null
  }>({
    key: "_id",
    direction: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Update data when datax changes
  useEffect(() => {
    if (datax?.data) {
      setData(datax.data)
    }
  }, [datax])

  // Handle sorting
  const handleSort = (key: keyof Asset) => {
    let direction: "asc" | "desc" | null = "asc"

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc"
      else if (sortConfig.direction === "desc") direction = null
    }

    setSortConfig({ key, direction })

    if (direction === null) {
      setData([...datax?.data])
      return
    }

    const sortedData = [...data].sort((a, b) => {
      // Special handling for date fields
      if (key === "purchased_date" || key === "depreciation_date") {
        const dateA = new Date(a[key]).getTime()
        const dateB = new Date(b[key]).getTime()

        // Handle invalid dates
        if (isNaN(dateA) && isNaN(dateB)) return 0
        if (isNaN(dateA)) return direction === "asc" ? 1 : -1
        if (isNaN(dateB)) return direction === "asc" ? -1 : 1

        return direction === "asc" ? dateA - dateB : dateB - dateA
      }

      // Regular string comparison for other fields
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1
      return 0
    })

    setData(sortedData)
  }

  // Filter data based on search term and status filter
  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length)
  const currentData = filteredData.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredData.length / entriesPerPage)

  // Handle delete click
  const handleDeleteClick = (asset: Asset) => {
    setDeletingAsset(asset)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return
    const id = deletingAsset._id
    try {
      // Pass the asset ID correctly to the mutation
      await deleteAsset(id).unwrap()
    } catch (error) {
      console.error("Error deleting Asset:", error)
      toast.error((error as any)?.data?.message || "Failed to delete asset")
    } finally {
      // Reset state and close dialog
      setDeletingAsset(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Function to handle request cancellation
  const handleCancel = async (id: string) => {
    setActionLoading(id)
    try {
      await disposedAsset({ id, data: { status: "disposed" } }).unwrap()
      toast.success("Asset set as disposed successfully")
      refetch()
    } catch (error) {
      console.error("Failed to set as disposed:", error)
      toast.error("Failed to set as disposed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      await deprecatedAssets({
        id: requestId,
        data: { status: "deprecated" },
      }).unwrap()
      toast.success("Asset set as deprecated successfully")
      refetch()
    } catch (error) {
      console.error("Failed to approve request:", error)
      toast.error("Failed to set asset as deprecated")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success("Asset successfully deleted.")
      refetch()
      setIsDeleteDialogOpen(false)
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any
        toast.error(errorData.data.message)
      }
    }
  }, [isSuccess, error, refetch])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, entriesPerPage])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-700">Loading assets...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3">
        <div className="flex-end flex justify-end gap-3">
          <Link to="/dashboard/add-assets">
            <button className="bg-green-700 p-2 rounded-md text-white font-medium text-sm flex flex-row items-center gap-2">
              <PlusCircle className="text-sm h-5" />
              Add Asset
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full p-4 space-y-4 bg-white rounded-md">
        <div className="w-full p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => setEntriesPerPage(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue>{entriesPerPage}</SelectValue>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>
                      {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span>Search:</span>
                <Input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                  placeholder="Search assets..."
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">
                      <button onClick={() => handleSort("_id")} className="flex items-center gap-1 hover:text-primary">
                        S.No <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <button
                        onClick={() => handleSort("assetName")}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Asset Name <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <button
                        onClick={() => handleSort("purchased_date")}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Purchase Date <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Status <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <button
                        onClick={() => handleSort("depreciation_date")}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Depreciation Date <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <tr key={item._id} className={index % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                        <td className="py-3 px-4">{startIndex + index + 1}</td>
                        <td className="py-3 px-4">{item.assetName}</td>
                        <td className="py-3 px-4">{formatDate(item.purchased_date)}</td>
                        <td className="py-3 px-4">
                          <div
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "active"
                                ? "bg-green-100 text-green-800"
                                : item.status === "deprecated"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(item.depreciation_date)}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/dashboard/view-asset/${item._id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Asset">
                                <Eye className="h-4 w-4 text-purple-600" />
                              </Button>
                            </Link>
                            <Link to={`/dashboard/edit-asset/${item._id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Asset">
                                <Pencil className="h-4 w-4 text-green-600" />
                              </Button>
                            </Link>
                            {item.status === "active" && (
                              <button
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm rounded-md hover:bg-yellow-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => handleApprove(item._id)}
                                disabled={actionLoading === item._id || isApproving}
                                title="Mark as Deprecated"
                              >
                                {actionLoading === item._id && isApproving ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Deprecate
                              </button>
                            )}
                            {item.status === "deprecated" && (
                              <button
                                className="px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => handleCancel(item._id)}
                                disabled={actionLoading === item._id || isCancelling}
                                title="Mark as Disposed"
                              >
                                {actionLoading === item._id && isCancelling ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-1" />
                                )}
                                Dispose
                              </button>
                            )}
                            {item.status === "disposed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteClick(item)}
                                title="Delete Asset"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        No assets found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
              <span className="font-medium">{filteredData.length}</span> entries
            </div>

            {totalPages > 1 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <div className="sm:hidden">
                  <span className="px-3 py-1 text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset "{deletingAsset?.assetName}" and
              remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

