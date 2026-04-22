import { api } from "@/redux/api/apiSlice";

export const itemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => "asset-items",
    }),
    createItems: builder.mutation({
      query: (body) => ({
        url: "asset-items",
        method: "POST",
        body,
      }),
    }),
    updateItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `asset-items/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `asset-items/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { 
useCreateItemsMutation,
useDeleteItemMutation,
useGetItemsQuery,
useUpdateItemMutation
} = itemApi;