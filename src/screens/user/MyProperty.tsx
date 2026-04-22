import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useGetPropertyQuery } from "@/redux/features/property/propertyApi";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PropertyLoader() {
  const { user } = useSelector((state: RootState) => state.auth);
  const id = user?.user?.user_property;

  const {
    data: propertyData,
    isLoading: propertyLoading,
    isError,
  } = useGetPropertyQuery(id);

  if (propertyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg font-medium">Loading property data...</p>
        </div>
      </div>
    );
  }
  if (!propertyData)
    return <div className="text-center p-8">No property assigned</div>;
  if (isError)
    return <div className="text-red-500 p-8">Error loading property</div>;

  const property = propertyData?.data;

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">
          {user.user.name} - {property.categoryName}
        </h1>
        <p className="text-lg text-blue-600 font-semibold">
          {user.user?.email}
        </p>

        <div className="mt-5 flex flex-row gap-3">
          {property.assign_assets.map((asset: any) => (
            <>
              <Link
                key={asset._id}
                to={`/user-dashboard/service-request-form/${asset.assetId}`}
              >
                <Button className="text-sm bg-blue-700 hover:bg-blue-900">
                  Request Maintenance
                </Button>
              </Link>
              <Link to={`/user-dashboard/equipment-request-form/${asset.assetId}`}>
                <Button className="text-sm bg-green-700 hover:bg-green-900">
                  Request Equipment
                </Button>
              </Link>
            </>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Property Details
          </h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Property Name:</span>{" "}
              {property.categoryName}
            </p>
            <p>
              <span className="font-medium">Wing:</span>{" "}
              {property.subCategoryName}
            </p>
            <p>
              <span className="font-medium">Flat:</span> {property.flatNumber}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Assigned Assets
          </h2>
          {property.assign_assets.map((asset: any) => (
            <Link
              key={asset._id}
              to={`/user-dashboard/view-asset/${asset.assetId}`}
            >
              <Button>
                <Eye className="text-lg font-bold text-white" />
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4 border-t pt-4">
        <p>Created: {new Date(property.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(property.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
