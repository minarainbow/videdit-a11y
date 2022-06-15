import {createSlice} from "@reduxjs/toolkit";

const mainScreenSlice = createSlice({
    name: "mainScreen",
    initialState: {
        playedSeconds: 0,
        durationInFrames: 1
    },

    reducers: {
        setPlayedSeconds: (state, action) => {
            state.playedSeconds = action.payload
        },

        setDuration: (state, action) => {
            state.durationInFrames = action.payload
        }
    }
})

export default mainScreenSlice.reducer

export const {
    setPlayedSeconds,
    setDuration
} = mainScreenSlice.actions
