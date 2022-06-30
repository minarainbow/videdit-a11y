import {createSlice} from "@reduxjs/toolkit";
import scriptData from "../scripts/ZaQtx54N6iU-aligned-sents";

const mainScreenSlice = createSlice({
    name: "mainScreen",
    initialState: {
        playedSeconds: 0,
        durationInFrames: 1,
        playing: false,
        scriptData: scriptData["words"],
        currentSent: 0,
    },

    reducers: {
        setPlayedSeconds: (state, action) => {
            state.playedSeconds = action.payload
        },

        setDuration: (state, action) => {
            state.durationInFrames = action.payload
        },

        setPlaying: (state, action) => {
            state.playing = action.payload
        },

        setScriptData: (state, action) => {
            state.scriptData = action.payload
        },
        setCurrentSent: (state, action) => {
            state.currentSent = action.payload
        }
        
    }
})

export default mainScreenSlice.reducer

export const {
    setPlayedSeconds,
    setDuration,
    setPlaying,
    setScriptData,
    setCurrentSent
} = mainScreenSlice.actions
