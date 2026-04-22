import {
  CalendarDays,
  Building,
  FileText,
  Box,
  ArrowBigLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetAssetsQuery } from "@/redux/features/assets/assetsApi";
import { useGetPropertyQuery } from "@/redux/features/property/propertyApi";

export default function PropertyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assetsData, isLoading } = useGetAssetsQuery([]);
  const { data: propertyDetail, isLoading: loading } = useGetPropertyQuery(
    id || ""
  );

  if (isLoading) return <div className="p-4">Loading assets...</div>;
  if (loading) return <div className="p-4">Loading property...</div>;
  // Get assigned assets
  const assignedAssetIds = propertyDetail?.data?.assign_assets?.map(
    (a: any) => a.assetId
  );
  const assignedAssets = assetsData?.data?.filter((asset: any) =>
    assignedAssetIds.includes(asset._id)
  );

  // Date formatting utility
  const formatDate = (dateString: any) => {
    const options: any = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge styling
  const getStatusStyle = (status: any) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowBigLeft className="mr-2" /> Back
      </button>
      <div className="mx-auto">
        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            {propertyDetail.data.categoryName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Flat: {propertyDetail.data.flatNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Box className="h-5 w-5 text-blue-500" />
              <span>Subcategory: {propertyDetail.data.subCategoryName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <span>Created: {formatDate(propertyDetail.data.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <span>
                Last Updated: {formatDate(propertyDetail.data.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Assets Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Box className="h-6 w-6 text-blue-600" />
              Assigned Assets ({assignedAssets.length})
            </h2>
          </div>

          {assignedAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Asset Name",
                      "Purchase Date",
                      "Depreciation Date",
                      "Status",
                      "Documents",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-medium text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedAssets.map((asset: any) => (
                    <tr key={asset._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {asset.assetName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(asset.purchased_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(asset.depreciation_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${getStatusStyle(
                            asset.status
                          )} px-3 py-1 rounded-full text-sm`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {asset.asset_documents?.url && (
                          <a
                            href={asset.asset_documents.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            View Document
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <div className="mb-4">📭</div>
              <p className="text-lg">No assets assigned to this property</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <Link to={`/dashboard/asign-asset/${id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Box className="h-4 w-4" />
              Assign New Asset
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
