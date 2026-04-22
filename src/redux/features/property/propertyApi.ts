import { api } from "@/redux/api/apiSlice";

export const propertyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: () => 'get-properties',
    }),
    getProperty: builder.query({
      query: (id) => `get-properties/${id}`,
    }),
    createProperty: builder.mutation({
      query: (newProperty) => ({
        url: 'create-properties',
        method: 'POST',
        body: newProperty,
      }),
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `update-properties/${id}`,
        method: 'PUT',
        body: updates,
      }),
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `delete-properties/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;