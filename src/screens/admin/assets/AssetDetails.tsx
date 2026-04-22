import { useGetAssetQuery } from "@/redux/features/assets/assetsApi";
import { useParams } from "react-router-dom";

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>()

  const { data: assetData, isLoading: isAssetLoading, error: assetError } = useGetAssetQuery(id)


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date?.toISOString().split("T")[0];
  };

  // Status styling configuration
  const statusStyles = {
    active: { color: "bg-green-500", text: "Active" },
    inactive: { color: "bg-red-500", text: "Inactive" },
    maintenance: { color: "bg-yellow-500", text: "Under Maintenance" },
    deprecated: { color: "bg-gray-500", text: "Deprecated" },
  };

  if (isAssetLoading) {
    return <div>Loading asset data...</div>
  }


  if (assetError) {
    return <div>Error loading asset data. Please try again.</div>
  }


  return (
    <div className="min-h-screen p-2">
      <div className="mx-auto max-w-6xl">

        {/* Asset Information Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Asset Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Asset Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Asset Name
                </label>
                <p className="mt-1 text-gray-900">{assetData?.data?.assetName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Purchase Date
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(assetData?.data?.purchased_date)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Deprecation Date
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(assetData?.data?.depreciation_date)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1 flex items-center">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${
                      statusStyles[assetData?.data?.status as keyof typeof statusStyles]
                        ?.color
                    }`}
                  ></span>
                  <span
                    className={`font-medium ${statusStyles[
                      assetData?.data?.status as keyof typeof statusStyles
                    ]?.color?.replace("bg", "text")}-700`}
                  >
                    {
                      statusStyles[assetData?.data?.status as keyof typeof statusStyles]
                        ?.text
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Photos Section */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Asset Photos
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {assetData?.data?.asset_pictures?.map((picture:any) => (
              <div
                key={picture?._id}
                className="aspect-square rounded-lg bg-gray-100 p-2"
              >
                <img
                  src={picture?.url}
                  alt={picture?.public_id}
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
