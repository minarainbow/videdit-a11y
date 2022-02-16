import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned.jsx";
import Words from "./Words.js";

class Scripts extends React.Component {
  // const Scripts = (jumpVideo) => {
  // const [text, setText] = React.useState();
  // console.log(scriptData["words"]);
  constructor(props) {
    super(props);
    this.state = {
      video_script: scriptData["words"],
    };
  }

  handle = (time) => {
    if (this.props.player) {
      this.props.jumpVideo(time, true);
    }
  };

  render() {
    return (
      <div>
        {Object.keys(this.state.video_script).map((key, idx) => (
          // console.log(video_script[key]["word"])
          <Words
            word={this.state.video_script[key]["word"]}
            start={this.state.video_script[key]["start"]}
            end={this.state.video_script[key]["end"]}
            handle={this.handle}
          ></Words>
        ))}
      </div>
    );
  }
}
export default Scripts;
