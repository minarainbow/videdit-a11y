import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned.jsx";
import Words from "./Words.js";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  Modifier
} from "draft-js";
import stt2Draft from "../packages/stt2draft";
import createEntityMap from "../packages/createEntityMap"

class Scripts extends React.Component {
  // const Scripts = (jumpVideo) => {
  // const [text, setText] = React.useState();
  // console.log(scriptData["words"]);
  constructor(props) {
    super(props);
    this.state = {
      video_script: scriptData["words"],
      editorState: EditorState.createEmpty()
    };
    this.onChange = editorState => this.setState({editorState});
  }

  componentDidMount() {
    this.loadData();
  }

  sttJsonAdapter(scriptData) {
    let blocks = stt2Draft(scriptData);
    return { blocks, entityMap: createEntityMap(blocks) }; 
  }

  loadData() {
    const blocks = this.sttJsonAdapter(scriptData);
    console.log("here loading data: ", blocks)
    // this.setState({ editorState: convertFromRaw(blocks)});
    const contentState = convertFromRaw(blocks);
    const editorState = EditorState.createWithContent(contentState);
    this.setState({ editorState: editorState });
  }

  handle = (time) => {
    if (this.props.player) {
      this.props.jumpVideo(time, true);
    }
  };

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
      // <div>
      //   {Object.keys(this.state.video_script).map((key, idx) => (
      //     // console.log(video_script[key]["word"])
      //     <Words
      //       word={this.state.video_script[key]["word"]}
      //       start={this.state.video_script[key]["start"]}
      //       end={this.state.video_script[key]["end"]}
      //       handle={this.handle}
      //     ></Words>
      //   ))}
      // </div>
    );
  }
}
export default Scripts;
