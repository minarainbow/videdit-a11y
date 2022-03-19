import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned.jsx";
import Words from "./Words.js";
import Word from "./Word.js";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  Modifier,
} from "draft-js";
import stt2Draft from "../packages/stt2draft";
import createEntityMap from "../packages/createEntityMap";

// DraftJs decorator to recognize which entity is which
// and know what to apply to what component
const getEntityStrategy =
  (mutability) => (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity();
      if (entityKey === null) {
        return false;
      }

      return contentState.getEntity(entityKey).getMutability() === mutability;
    }, callback);
  };

// decorator definition - Draftjs
// defines what to use to render the entity
const decorator = new CompositeDecorator([
  {
    strategy: getEntityStrategy("MUTABLE"),
    component: Word,
  },
]);

class Scripts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      video_script: scriptData["words"],
      editorState: EditorState.createEmpty(),
    };
    this.onChange = (editorState) => this.setState({ editorState });
  }

  componentDidMount() {
    this.loadData();
  }
  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps !== this.props) return true;

    if (nextState !== this.state) return true;

    return false;
  };

  sttJsonAdapter(scriptData) {
    let blocks = stt2Draft(scriptData);
    return { blocks, entityMap: createEntityMap(blocks) };
  }

  loadData() {
    const blocks = this.sttJsonAdapter(scriptData);
    const contentState = convertFromRaw(blocks);
    const editorState = EditorState.createWithContent(contentState, decorator);
    this.setState({ editorState: editorState });
  }

  // handle = (time) => {
  //   if (this.props.player) {
  //     this.props.jumpVideo(time, true);
  //   }
  // };

  getCurrentWord = () => {
    const currentWord = {
      start: "NA",
      end: "NA",
      index: "NA",
    };
    if (scriptData) {
      const contentState = this.state.editorState.getCurrentContent();
      const contentStateConvertEdToRaw = convertToRaw(contentState);
      const entityMap = contentStateConvertEdToRaw.entityMap;

      for (var entityKey in entityMap) {
        const entity = entityMap[entityKey];
        const word = entity.data;

        if (
          word.start <= this.props.videoTime &&
          word.end >= this.props.videoTime
        ) {
          currentWord.start = word.start;
          currentWord.end = word.end;
          currentWord.index = word.index;
        }
      }
    }
    if (currentWord.start !== "NA") {
      if (this.props.isScrollIntoViewOn) {
        const currentWordElement = document.querySelector(
          `span.Word[data-start="${currentWord.start}"]`
        );
        currentWordElement.scrollIntoView({
          block: "nearest",
          inline: "center",
        });
      }
    }
    return currentWord;
  };

  handleDoubleClick = event => {
    // nativeEvent --> React giving you the DOM event
    let element = event.nativeEvent.target;
    // find the parent in Word that contains span with time-code start attribute
    while (!element.hasAttribute("data-start") && element.parentElement) {
      element = element.parentElement;
    }

    if (element.hasAttribute("data-start")) {
      const t = parseFloat(element.getAttribute("data-start"));
      this.props.jumpVideo(t, true);
    }
  };

  // Helper function to re-render this component
  // used to re-render WrapperBlock on timecode offset change
  // or when show / hide preferences for speaker labels and timecodes change
  forceRenderDecorator = () => {
    const contentState = this.state.editorState.getCurrentContent();
    const decorator = this.state.editorState.getDecorator();
    const newState = EditorState.createWithContent(contentState, decorator);
    const newEditorState = EditorState.push(newState, contentState);
    this.setState({ editorState: newEditorState });
  };

  render() {
    const currentWord = this.getCurrentWord();
    const highlightColour = "#69e3c2";
    const unplayedColor = "#767676";
    const time = Math.round(this.props.videoTime * 4.0) / 4.0;
    const correctionBorder = "1px dotted blue";
    return (
      <section onDoubleClick={this.handleDoubleClick} className="script">
        <style scoped>
          {`span.Word[data-start="${currentWord.start}"] { background-color: ${highlightColour}; text-shadow: 0 0 0.01px black }`}
          {`span.Word[data-start="${currentWord.start}"]+span { background-color: ${highlightColour} }`}
          {`span.Word[data-prev-times~="${Math.floor(
            time
          )}"] { color: ${unplayedColor} }`}
          {`span.Word[data-prev-times~="${time}"] { color: ${unplayedColor} }`}
          {`span.Word[data-confidence="low"] { border-bottom: ${correctionBorder} }`}
          {`span.Word[data-index="${currentWord.index}"]`}
        </style>
        <Editor editorState={this.state.editorState} onChange={this.onChange} />
      </section>

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
