import React from "react";
import '../App.css';
import {Progress} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Clickable } from 'react-clickable';
import { css } from "@emotion/react";
import ScaleLoader from "react-spinners/ScaleLoader";


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



export default class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverPreview: false,
        };

        this.showPreview = this.showPreview.bind(this);
    }

   


    showPreview = (index) => {
        this.setState({hoverPreview: index});
    }



    render() {
        const { videoTime, duration} = this.props;
        const { showPreview } = this;
        return (
            <div className="progressBar-container">
                <div className="progressBar">
                    <Progress percent={Math.floor(videoTime/duration*100)}color='light-grey' />
                    <div className="time-progress">{formatTime(videoTime)}</div>
                </div>
            </div>
        );
    }};