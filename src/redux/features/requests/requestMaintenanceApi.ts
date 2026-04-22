import { api } from "@/redux/api/apiSlice";

export const equipmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEquipmentRequests: builder.query({
      query: () => "request-m",
    }),
    getEquipmentRequestById: builder.query({
      query: ({ id }) => `request-m/${id}`,
    }),
    createEquipmentRequest: builder.mutation({
      query: (data) => ({
        url: "request-m",
        method: "POST",
        body: data,
      })
    }),
    updateEquipmentRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `request-m/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    cancelEquipmentRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `request-m/${id}`,
        method: "PUT",
        body: { ...data, status: "cancelled" },
      })
    }),
    approveEquipmentRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `approve-request-m/${id}`,
        method: "PUT",
        body: { ...data, status: "approved" },
      })
    }),
    deleteEquipmentRequest: builder.mutation({
      query: ({ id }) => ({
        url: `request-m/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetEquipmentRequestsQuery,
  useGetEquipmentRequestByIdQuery,
  useCreateEquipmentRequestMutation,
  useUpdateEquipmentRequestMutation,
  useCancelEquipmentRequestMutation,
  useDeleteEquipmentRequestMutation,
  useApproveEquipmentRequestMutation
} = equipmentApi;
