import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../store/slices/index';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
})