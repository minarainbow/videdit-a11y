import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned-sents.jsx";
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
      current_heading: 0,
      current_sentence: 0,
    };
    this.onChange = (editorState) => {
      // console.log(editorState);
      this.setState({ editorState });
    };
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

  /**
   * Listen for draftJs custom key bindings
   */
   customKeyBindingFn = e => {
    const enterKey = 13;
    const spaceKey = 32;
    const leftArrow = 37;
    const rightArrow =39;

    if (e.keyCode === spaceKey) {
      console.log('customKeyBindingFn');

      return "play/pause";
    }
    if (e.keyCode === rightArrow) {
      console.log('customKeyBindingFn');

      return "next-sentence";
    }
    if (e.keyCode === leftArrow) {
      console.log('customKeyBindingFn');

      return "prev-sentence";
    }
    // if alt key is pressed in combination with these other keys
    if (
      e.altKey &&
      (e.keyCode === spaceKey ||
        e.keyCode === spaceKey )
    ) {
      e.preventDefault();

      return "keyboard-shortcuts";
    }

    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = command => {
    if (command === 'play/pause') {
      this.props.playVideo();
    }

    else if (command === 'next-sentence') {
      const currentSentenceEnd = this.getCurrentWord().end;
      this.props.jumpVideo(currentSentenceEnd, true);
    }

    else if (command === 'prev-sentence') {
      const currentSentenceStart = this.getCurrentWord().start;
      if (this.props.videoTime < currentSentenceStart+ 2){
        const prevSentenceStart = this.getCurrentWord().prevStart;
        this.props.jumpVideo(prevSentenceStart, true);
      }
      else{
        this.props.jumpVideo(currentSentenceStart, true);
      }
    }

    if (command === "keyboard-shortcuts") {
      return "handled";
    }
    return 'not-handled';
  };


  // change to getcurrentsentence
  getCurrentWord = () => {
    const currentWord = {
      start: "NA",
      end: "NA",
      index: "NA",
      now: "NA",
      prevStart: "0",
    };
    if (scriptData) {
      const contentState = this.state.editorState.getCurrentContent();
      const contentStateConvertEdToRaw = convertToRaw(contentState);
      const entityMap = contentStateConvertEdToRaw.entityMap;

      for (var entityKey in entityMap) {
        const entity = entityMap[entityKey];
        const word = entity.data;

        if (
          word.start <= this.props.videoTime
        ) {
        
          if (
            word.end >= this.props.videoTime
          ) {
            currentWord.start = word.start;
            currentWord.end = word.end;
            currentWord.index = word.index;
            currentWord.now = "true";
          }
          else {
            currentWord.prevStart = word.start;
          }
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

  handleDoubleClick = (event) => {
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

    // while (!element.hasAttribute("data-index") && element.parentElement) {
    //   element = element.parentElement;
    // }

    // if (element.hasAttribute("data-index")) {
    //   const index = parseInt(element.getAttribute("data-index"));
    //   this.props.updateSnippetIndex(index);
    //   this.props.updateCurrSpan(element);
    // }
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
        <Editor 
          editorState={this.state.editorState} 
          onChange={this.onChange} 
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={this.customKeyBindingFn}
        />
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
