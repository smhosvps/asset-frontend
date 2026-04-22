export interface AssetFormData {
    assetName: string
    purchased_date: string
    depreciation_date: string
    status: string
  }
  
  export const VALID_STATUSES = ["active", "inactive", "maintenance", "deprecated"] as const
  export type AssetStatus = (typeof VALID_STATUSES)[number]
  
  export interface AssetImage {
    url: string
  }
  
  export interface AssetDocument {
    url: string
  }
  
  export interface Asset extends Omit<AssetFormData, "asset_pictures" | "asset_documents"> {
    _id: string
    asset_pictures: AssetImage[]
    asset_documents: AssetDocument | null
  }
  
  