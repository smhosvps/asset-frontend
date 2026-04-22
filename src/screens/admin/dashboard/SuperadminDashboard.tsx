import { Users, List, Megaphone, Box, Wrench, Cog } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useGetAllUsersQuery } from "@/redux/features/user/userApi"
import { useGetAssetsQuery } from "@/redux/features/assets/assetsApi"
import { useGetItemsQuery } from "@/redux/features/property/itemsApi"
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApi"
import { useGetRequestsQuery } from "@/redux/features/requests/requestEquipmentApi"
import { useGetEquipmentRequestsQuery } from "@/redux/features/requests/requestMaintenanceApi"

export default function Dashboard() {
  const {data:dataUsers, isLoading } = useGetAllUsersQuery({})
  const {data:dataAsset, isLoading:isLoadingAssets } = useGetAssetsQuery({})
  const {data:dataItems, isLoading:isLoadingItems } = useGetItemsQuery({})
  const {data:dataProperties, isLoading:isLoadingProperties } = useGetPropertiesQuery({})
  const {data:dataEquipment, isLoading:isLoadingEquipment } = useGetRequestsQuery({})
  const {data:dataService, isLoading:isLoadingService } = useGetEquipmentRequestsQuery({})

  const filteredResponse = {
    ...dataEquipment,
    data: dataEquipment?.data?.filter((item:any) => item.status === 'approved')
  }

  const filteredResponse2 = {
    ...dataService,
    data: dataService?.data?.filter((item:any) => item.status === 'approved')
  }

  if (isLoading ||isLoadingAssets || isLoadingItems || isLoadingProperties ||isLoadingEquipment ||isLoadingService ) return <div>Loading <datalist></datalist>...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        
        {/* Top Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">Total Users</h3>
                <p className="text-4xl font-semibold">{dataUsers?.users?.length}</p>
              </div>
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">Total Assets</h3>
                <p className="text-4xl font-semibold">{dataAsset?.data?.length}</p>
              </div>
              <List className="w-6 h-6 text-teal-600" />
            </div>
          </Card>

          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">Total Properties</h3>
                <p className="text-4xl font-semibold">{dataProperties?.count}</p>
              </div>
              <Megaphone className="w-6 h-6 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">Total Items</h3>
                <p className="text-4xl font-semibold">{dataItems?.length}</p>
              </div>
              <Box className="w-6 h-6 text-cyan-500" />
            </div>
          </Card>
        </div>

        {/* Bottom Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">
                  Approved Maintenance
                  <br />
                  Requests
                </h3>
                <p className="text-4xl font-semibold">{filteredResponse2?.data?.length}</p>
              </div>
              <Wrench className="w-6 h-6 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 border-blue-500 border-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-medium">Approved Equipment Requests</h3>
                <p className="text-4xl font-semibold">{filteredResponse?.data?.length}</p>
              </div>
              <Cog className="w-6 h-6 text-pink-500" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

