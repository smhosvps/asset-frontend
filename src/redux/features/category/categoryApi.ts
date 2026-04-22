import { api } from "@/redux/api/apiSlice";


export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "asset-categories",
    }),
    createCategory: builder.mutation({
      query: (body) => ({
        url: "asset-categories",
        method: "POST",
        body,
      }),
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `asset-categories/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `asset-categories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { 
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categoryApi;