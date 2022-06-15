import '../App.css';
import {Progress} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { css } from "@emotion/react";
import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";


function formatTime(time) {
    time = Math.round(time);
  
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

  const override = css`
  position: absolute;
  font-size: 5px;
  height: 5px;
  left: 69vw; 
  margin-top: -3.8vh;
`;



export default () => {
    const videoTime = useSelector(state => state.playedSeconds)
    const duration = useSelector(state => state.durationInFrames/30)

    const [hoverPreview, setHoverPreview] = useState(false)

    const showPreview = useCallback((index) => {
        setHoverPreview(index);
    }, [])

    return <div className="progressBar-container">
                <div className="progressBar">
                    <Progress percent={Math.floor(videoTime/duration*100)}color='grey' />
                    <div className="time-progress">{formatTime(videoTime)}</div>
                </div>
            </div>
        }