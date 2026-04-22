import { api } from "@/redux/api/apiSlice";


export const subcategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubCategories: builder.query({
      query: () => "asset-subcategories",
    }),
    createSubCategory: builder.mutation({
      query: (body) => ({
        url: "asset-create-subcategories", 
        method: "POST",
        body,
      }),
    }),
    updateSubCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `asset-subcategories/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteSubCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `asset-subcategories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { 
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation
} = subcategoryApi;