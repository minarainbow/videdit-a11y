import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned-sents.jsx";
import Words from "./Words.js";
import Word from "./Word.js";
import WrapperBlock from "./WrapperBlock.js";
import {
  Editor,
  EditorState,
  SelectionState,
  CompositeDecorator,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  Modifier,
} from "draft-js";
import stt2Draft from "../packages/stt2draft";
import gcpSttToDraft from "../packages/google-stt2draft";
import createEntityMap from "../packages/createEntityMap";
import ForumIcon from "@mui/icons-material/Forum";

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
      deleted_index: [],
    };
    this.onChange = (editorState) => {
      this.setState(editorState)
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
    const blocks = this.sttJsonAdapter(scriptData["words"]);
    const contentState = convertFromRaw(blocks);
    const editorState = EditorState.createWithContent(contentState, decorator);
    this.setState({ editorState: editorState });
  }

  updateVideoScript(deleted_element) {
    var video_script = this.state.video_script;
    const deleted_script_element = video_script.filter(function (data) {
      return data.index == deleted_element.index;
    })[0];
    const deleted_index = video_script.indexOf(deleted_script_element);
    // when deleted_element is heading
    if (
      deleted_script_element.new_heading &&
      deleted_index < video_script.length - 1 &&
      !video_script[deleted_index + 1].new_heading
    ) {
      video_script[deleted_index + 1].new_heading =
        deleted_script_element.new_heading;
    }
    video_script.splice(deleted_index, 1);
    return video_script;
  }
  
  getBlockAndOffset = (
    editorState,
    selection,
    offset,
    startFromEnd = false,
    limitedToSingleBlock = false,
) => {
    const noValue = {block: null, newOffset: null};
    const content = editorState.getCurrentContent();
    let newOffset;
    let block;

    if (startFromEnd) {
        newOffset = selection.getEndOffset() + offset;
        block = content.getBlockForKey(selection.getEndKey());
    } else {
        newOffset = selection.getStartOffset() + offset;
        block = content.getBlockForKey(selection.getStartKey());
    }

    if (block == null) {
        return noValue;
    }

    if (limitedToSingleBlock === true) {
        const offsetWithinBlock = startFromEnd === true
            ? Math.min(newOffset, block.getLength())
            : Math.max(newOffset, 0);

        return {block: block, newOffset: offsetWithinBlock};
    }

    while (newOffset < 0) {
        block = content.getBlockBefore(block.getKey());
        if (block == null) {
            return noValue;
        }
        newOffset = block.getLength() + newOffset + 1;
    }

    while (newOffset > block.getLength()) {
        newOffset = newOffset - block.getLength() - 1;
        block = content.getBlockAfter(block.getKey());
        if (block == null) {
            return noValue;
        }
    }

    return {block, newOffset};
};


  changeEditorSelection(editorState, startOffset, endOffset, force) {


    
    const selection = editorState.getSelection();
    const {block: startBlock, newOffset: newStartOffset} = this.getBlockAndOffset(
        editorState, selection, startOffset, false);
    const {block: endBlock, newOffset: newEndOffset} = this.getBlockAndOffset(
        editorState, selection, endOffset, true);
    //   console.log(startBlock, endBlock)
    // if (startBlock == null || endBlock == null) {
    //     return editorState;
    // }
    console.log(selection)
    const newSelection = selection.merge({
        anchorOffset: 1,
        anchorKey: '4nekh',
        focusOffset: 6,
        focusKey: '4nekh',
        isBackward: false,
    });

    if (force) {
      
      const newState = EditorState.forceSelection(this.state.editorState, newSelection)
      
      const content = newState.getCurrentContent();
      const decorator = new CompositeDecorator([
        {
          strategy: getEntityStrategy("MUTABLE"),
          component: Word,
        },
      ]);
      const newEditorState = EditorState.createWithContent(content, decorator);
      this.setState({ editorState: newEditorState });
      console.log(newEditorState)
    }

    return EditorState.acceptSelection(editorState, newSelection);
}

  /**
   * Listen for draftJs custom key bindings
   */
  customKeyBindingFn = (e) => {
    const enterKey = 13;
    const spaceKey = 32;
    const leftArrow = 37;
    const rightArrow = 39;
    const deleteKey = 8;

    if (e.keyCode === spaceKey) {
      console.log("customKeyBindingFn");

      return "play/pause";
    }
    if (e.keyCode === rightArrow) {
      console.log("customKeyBindingFn");

      return "next-sentence";
    }
    if (e.keyCode === leftArrow) {
      console.log("customKeyBindingFn");

      return "prev-sentence";
    }
    if (e.keyCode === deleteKey) {
      console.log("customKeyBindingFn");

      // return "delete-sentence";
    }
    if (e.keyCode === enterKey) {
      console.log("customKeyBindingFn");

      return "split-paragraph";
    }

    // if alt key is pressed in combination with these other keys
    if (e.altKey && (e.keyCode === spaceKey || e.keyCode === spaceKey)) {
      e.preventDefault();

      return "keyboard-shortcuts";
    }

    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = (command) => {
    if (command === "play/pause") {
      this.props.playVideo();
    } else if (command === "next-sentence") {
      const currentSentenceEnd = this.getCurrentWord().end;
      this.props.jumpVideo(currentSentenceEnd, true);
    } else if (command === "prev-sentence") {
      const currentSentenceStart = this.getCurrentWord().start;
      if (this.props.videoTime < currentSentenceStart + 2) {
        const prevSentenceStart = this.getCurrentWord().prevStart;
        this.props.jumpVideo(prevSentenceStart, true);
      } else {
        this.props.jumpVideo(currentSentenceStart, true);
      }
    } else if (command === "delete-sentence") {
      const deleted_element = this.getCurrentWord();
      var video_script = this.updateVideoScript(deleted_element);

      const blocks = this.sttJsonAdapter(video_script);
      const contentState = convertFromRaw(blocks);
      const editorState = EditorState.createWithContent(
        contentState,
        decorator
      );

      this.setState((prevState) => ({
        deleted_index: [...prevState.deleted_index, deleted_element.index],
        video_script: video_script,
        editorState: editorState,
      }));

      const newWordStart = this.getCurrentWord().end;
      this.props.jumpVideo(newWordStart, true);
    }

    else if (command === "split-paragraph") {
      
      // this.changeEditorSelection(this.state.editorState, 2, 3, true);
    }

    if (command === "keyboard-shortcuts") {
      return "handled";
    }
    return "not-handled";
  };

  renderBlockWithTimecodes = () => {
    return {
      component: WrapperBlock,
      editable: true,
      // blockProps
      props: {
        showHeadings: true,
        showTimecodes: true,
        timecodeOffset: this.props.timecodeOffset,
        editorState: this.state.editorState,
        setEditorNewContentStateSpeakersUpdate: this.props.setEditorNewContentStateSpeakersUpdate,
        onWordClick: this.handleWordClick,
        isEditable: true,
      },
    };
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

        if (word.start <= this.props.videoTime) {
          if (word.end >= this.props.videoTime) {
            currentWord.start = word.start;
            currentWord.end = word.end;
            currentWord.index = word.index;
            currentWord.now = "true";
          } else {
            currentWord.prevStart = word.start;
          }
        }
      }
    }
    if (currentWord.start !== "NA") {
      const currentWordElement = document.querySelector(
        `span.Word[data-start="${currentWord.start}"]`
      );
      if (this.props.isScrollIntoViewOn) {
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

          {`span.Word[data-review="true"] { background-color: lightsalmon; color: black;}}`}
          {`span.Word[data-prev-times~="${time}"] { color: ${unplayedColor} }`}
          {`span.Word[data-confidence="low"] { border-bottom: ${correctionBorder} }`}
          {`span.Word[data-index="${currentWord.index}"]`}
          {`span.Word[data-moving="${currentWord.moving}"]`}
          {`span.Word[data-type="${currentWord.type}"]`}
          {`span.Word[data-heading="${currentWord.heading}"]`}
        </style>
        <Editor
          ref={this.props.ref}
          editorState={this.state.editorState}
          onChange={this.onChange}
          handleKeyCommand={this.handleKeyCommand}
          blockRendererFn={this.renderBlockWithTimecodes}
          keyBindingFn={this.customKeyBindingFn}
        />
      </section>
    );
  }
}
export default Scripts;