import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import endpoints from "../../../constants/env.dev";

const initialState = {
    loading: false,
    error: {},
    orgDrivePerYr: [],
    orgPatientPerYr: [],
    orgDrivePatientPerDay: []
}

export const fetchDrivesPerYear = createAsyncThunk('dashboard/fetchDrivesPerYear', async (payload) => {
    return axios.post(endpoints.dashboardPOSTBaseUrl + endpoints.dashboard.getDrivesPerYear, payload).then((res) => res.data);
});

export const fetchPatientsPerYear = createAsyncThunk('dashboard/fetchPatientsPerYear', async (payload) => {
    return axios.post(endpoints.dashboardPOSTBaseUrl + endpoints.dashboard.getPatientsPerYear, payload).then((res) => res.data);
});

export const fetchDrivePatientsPerDay = createAsyncThunk('dashboard/fetchDrivePatientsPerDay', async (payload) => {
    return axios.post(endpoints.dashboardPOSTBaseUrl + endpoints.dashboard.getPatientsPerDay, payload).then((res) => res.data);
});



const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchDrivesPerYear
        builder.addCase(fetchDrivesPerYear.pending, (state) => {
            state.loading = true;
            return state;
        });
        builder.addCase(fetchDrivesPerYear.fulfilled, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgDrivePerYr = action.payload;
            return state;
        });
        builder.addCase(fetchDrivesPerYear.rejected, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgDrivePerYr = [];
            state.error = action.error.message;
            return state;
        });

        // fetchPatientsPerYear
        builder.addCase(fetchPatientsPerYear.pending, (state) => {
            state.loading = true;
            return state;
        });
        builder.addCase(fetchPatientsPerYear.fulfilled, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgPatientPerYr = action.payload;
            return state;
        });
        builder.addCase(fetchPatientsPerYear.rejected, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgPatientPerYr = [];
            state.error = action.error.message;
            return state;
        });

        // fetchDrivePatientsPerDay
        builder.addCase(fetchDrivePatientsPerDay.pending, (state) => {
            state.loading = true;
            return state;
        });
        builder.addCase(fetchDrivePatientsPerDay.fulfilled, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgDrivePatientPerDay = action.payload;
            return state;
        });
        builder.addCase(fetchDrivePatientsPerDay.rejected, (state, action) => {
            state = { ...state };
            state.loading = false;
            state.orgDrivePatientPerDay = [];
            state.error = action.error.message;
            return state;
        });
    }
});

export default dashboardSlice.reducer;