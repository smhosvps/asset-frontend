import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/apiSlice';

interface AuthState {
  user: any | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
      }
    );
  },

});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;