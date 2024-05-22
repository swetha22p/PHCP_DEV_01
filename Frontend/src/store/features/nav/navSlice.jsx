import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isNavExp: false,
    title: localStorage.getItem("pageTitle") || "Home",
    language: "en"
};

const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        toggle: (state) => {
            state.isNavExp = !state.isNavExp;
        },
        changeTitle: (state, action) => {
            state.title = action.payload;
            localStorage.setItem("pageTitle", state.title);
        },
        updateLanguage: (state, action) => { // Define updateLanguage with arrow function syntax
            state.language = action.payload;
            // Optionally, you can also store the selected language in localStorage
            localStorage.setItem("language", state.language);
        },
    }
});

export default navSlice.reducer;
export const { toggle, changeTitle, updateLanguage } = navSlice.actions;
