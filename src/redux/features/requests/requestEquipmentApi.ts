import { api } from "@/redux/api/apiSlice";

export const maintenanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRequests: builder.query({
      query: () => "request-e",
    }),
    getRequestById: builder.query({
      query: ({ id }) => `request-e/${id}`,
    }),
    createRequest: builder.mutation({
      query: (data) => ({
        url: "request-e",
        method: "POST",
        body: data,
      })
    }),
    updateRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `request-e/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    cancelRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `request-e/${id}`,
        method: "PUT",
        body: { ...data, status: "cancelled" },
      })
    }),
    approveERequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `approve-request-e/${id}`,
        method: "PUT",
        body: { ...data, status: "approved" },
      })
    }),
    deleteRequest: builder.mutation({
      query: ({ id }) => ({
        url: `request-e/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetRequestsQuery,
  useGetRequestByIdQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useCancelRequestMutation,
  useDeleteRequestMutation,
  useApproveERequestMutation
} = maintenanceApi;
