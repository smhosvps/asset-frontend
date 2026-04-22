import { api } from "@/redux/api/apiSlice";

export const assetApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: () => "assets",
    }),
    getAsset: builder.query({
      query: (id) => `assets-single/${id}`,
    }),
    createAsset: builder.mutation({
      query: (newAsset) => ({
        url: "assets",
        method: "POST",
        body: newAsset,
      }),
    }),
    updateAsset: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `assets/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({
        url: `assets/${id}`,
        method: "DELETE",
      }),
    }),
    deprecatedAssets: builder.mutation({
      query: ({ id, data }) => ({
        url: `deprecated-asset/${id}`,
        method: "PUT",
        body: { ...data, status: "deprecated" },
      }),
    }),
    disposedAsset: builder.mutation({
      query: ({ id, data }) => ({
        url: `disposed-asset/${id}`,
        method: "PUT",
        body: { ...data, status: "disposed" },
      }),
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useDeprecatedAssetsMutation,
  useDisposedAssetMutation
} = assetApi;
