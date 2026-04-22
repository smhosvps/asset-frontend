import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export default function BookingLoader() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-blue-100 rounded-lg">
        <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-white p-2 rounded">
          <Search className="text-blue-500" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-white p-2 rounded">
          <Calendar className="text-blue-500" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex-1 min-w-[200px] flex items-center space-x-2 bg-white p-2 rounded">
          <Users className="text-blue-500" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-10 w-32 bg-blue-500" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <div className="w-full md:w-1/4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-32 my-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="w-full md:w-3/4 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 border p-4 rounded-lg">
              <Skeleton className="h-48 sm:h-32 sm:w-48 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center space-x-2">
                  <MapPin className="text-blue-500" size={16} />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-40 w-full rounded-lg mb-2" />
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}