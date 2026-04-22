import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const api = createApi({
    baseQuery: fetchBaseQuery({
        // baseUrl: `${API_BASE_URL}/api/v1/`,
        baseUrl: `http://localhost:9000/api/v1`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'logout',
                method: 'POST',
            }),
        }),
        getUser: builder.query({
            query: () => 'user',
        }), 
        
        searchListings: builder.query({
            query: (params) => ({
                url: '/search-listings',
                params,
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useGetUserQuery, useSearchListingsQuery } = api;