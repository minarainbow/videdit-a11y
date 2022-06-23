import React from "react";
import Word from "./Word.js";
import WrapperBlock from "./WrapperBlock.js";
import {
  Editor,
  EditorState,
  SelectionState,
  CompositeDecorator,
  convertFromRaw,
  getDefaultKeyBinding,
  Modifier,
} from "draft-js";
import stt2Draft from "../packages/stt2draft";
import createEntityMap from "../packages/createEntityMap";
import firebase from "firebase/app";
import "firebase/database";
import {connect} from "react-redux";
import {setScriptData} from "../redux/mainScreenReducer";
import { current } from "@reduxjs/toolkit";
import scriptData from "../scripts/ZaQtx54N6iU-aligned-sents.jsx";

const databaseURL = "https://videdita11y-default-rtdb.firebaseio.com/";

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
      editorState: EditorState.createEmpty(),
      current_heading: 0,
      cuts: [],
      last_length: 0,
      last_spans: [],
    };
    this.onChange = (editorState) => {
      this.setState({ editorState });
      const divs = this.getSelectedBlockElement();
      this.props.getSelected(divs);
      const currentContentState = this.state.editorState.getCurrentContent()
      const newContentState = editorState.getCurrentContent()

      if (currentContentState !== newContentState && ['backspace-character', 'remove-range', 'undo'].includes(editorState.getLastChangeType())) {
        setTimeout(()=>this.props.updateDuration(), 300);
      } 
    };
    this.updateCursor = this.updateCursor.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.customKeyBindingFn = this.customKeyBindingFn.bind(this);
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
    const blocks = this.sttJsonAdapter(this.props.scriptData);
    const contentState = convertFromRaw(blocks);
    const editorState = EditorState.createWithContent(contentState, decorator);
    this.setState({ editorState: editorState});
    setTimeout(()=> {
      const words =  Array.from(document.querySelectorAll("span.Word"));
      var last_spans = []
      for (var i=0; i<words.length; i++){
        last_spans.push(words[i].getAttribute("word-index"))
      }
      this.setState({last_spans: last_spans, last_length: words.length})
    }, 200)
    
  }

  updateVideoScript() {
    // update span timecodes 1) deleted element/character check 2) calculate how much was deleted 3) update the timecode of later spans
    var spans_objects = Array.from(document.querySelectorAll("span.Word"))
    var spans=[];
    for (var i=0; i<spans_objects.length; i++){
      spans.push(spans_objects[i].getAttribute("word-index"))
    }
    const deleted_spans = this.state.last_spans.filter(x=> !spans.includes(x));
    var deleted_sent_start, deleted_sent_end, deleted_word_start, deleted_word_end, deleted_start, deleted_end;
    for (var i=0; i<this.props.scriptData.length; i++){
      for (var j=0; j<this.props.scriptData[i]["words"].length; j++){
        if (this.props.scriptData[i]["words"][j]["word_index"] == deleted_spans[0]){
          deleted_sent_start = this.props.scriptData[i]["words"][j]["sent_index"]
          deleted_word_start = deleted_spans[0];
          deleted_start = this.props.scriptData[i]["words"][j]["start"]
        }
        else if (this.props.scriptData[i]["words"][j]["word_index"] == deleted_spans[deleted_spans.length-1]){
          deleted_sent_end = this.props.scriptData[i]["words"][j]["sent_index"];
          deleted_word_end = deleted_spans[deleted_spans.length-1];
          deleted_end = this.props.scriptData[i]["words"][j]["end"]
        }
      }
    }
    var deleted_duration = deleted_end - deleted_start;
    var scriptData = JSON.parse(JSON.stringify(this.props.scriptData));
    var words;
    // last sentence
    if (deleted_sent_start === scriptData.length) return;
    // for deleted sentences
    for (var i = deleted_sent_start; i <= deleted_sent_end; i++){
      var sent_start = -1; var sent_end = -1;
      for (var j=0; j<scriptData[i]["words"].length; j++){
        var word = scriptData[i]["words"][j]
        if (word["word_index"] >= deleted_word_start && word["word_index"] <= deleted_word_end){
          word["default_start"] = word["start"];
          word["default_end"] = word["end"];
          word["start"] = -1;
          word["end"] = -1;
        }
        else{
          if (word["word_index"] > deleted_word_end){
            word["default_start"] = word["start"];
            word["default_end"] = word["end"];
            word["start"] -= deleted_duration;
            word["end"] -= deleted_duration;
          }
          if (sent_start == -1) sent_start = word["start"];
          if (word["end"] !== -1) sent_end = word["end"];
        }
      }
      scriptData[i]["default_start"] = scriptData[i]["start"];
      scriptData[i]["default_end"] = scriptData[i]["end"];
      scriptData[i]["start"] = sent_start;
      scriptData[i]["end"] = sent_end;
    }

    // for later sentences
    for (i = deleted_sent_end+1; i < scriptData.length; i++){
      words = scriptData[i]["words"]
      for (var j=0; j<words.length; j++){
        if (words[j]["word_index"] > deleted_word_end){
          words[j]["start"] -= deleted_duration;
          words[j]["end"] -= deleted_duration;
        }
      }
      scriptData[i]["start"] = words[0]["start"];
      scriptData[i]["end"] = words[words.length-1]["end"];
    }
    
    this.setState({last_spans: spans, last_length: spans.length});
    console.log("here")
    this.props.dispatch(setScriptData(scriptData))
    // for (var i=0; i < words.length; i++){
    //   var word = words[i];
    //   var word_start = parseFloat(word.getAttribute("data-start"));
    //   var word_end = parseFloat(word.getAttribute("data-end"));
    //   if (word_end <=  deleted_start){
    //     continue;
    //   }
    //   else if (word_start >= deleted_end){
    //     word.setAttribute("data-start", word_start-deleted_duration);
    //     word.setAttribute("data-end", word_end-deleted_duration);
    //     continue;
    //   }
    // }
  }

  getBlockAndOffset = (
    editorState,
    selection,
    offset,
    startFromEnd = false,
    limitedToSingleBlock = false
  ) => {
    const noValue = { block: null, newOffset: null };
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
      const offsetWithinBlock =
        startFromEnd === true
          ? Math.min(newOffset, block.getLength())
          : Math.max(newOffset, 0);

      return { block: block, newOffset: offsetWithinBlock };
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


getCursorBlockElement = () => {
  var selection = window.getSelection()
  if (selection.rangeCount == 0) return null
  var node = selection.getRangeAt(0).startContainer
  do {
    if (node.getAttribute && node.getAttribute('data-block') == 'true')
      return node
    node = node.parentElement
  } while (node != null)
  return null
  
};


  getSelectedBlockElement = () => {
    var selection = window.getSelection();
    if (selection.rangeCount == 0) return null;
    var node;

    if (selection.type === "Caret") {
      node = selection.getRangeAt(0).startContainer;
      do {
        if (node.getAttribute && node.getAttribute("data-block") == "true")
          return [node, node];
        node = node.parentNode;
      } while (node != null);
      return null;
    } else {
      // type === Range
      var startNode = selection.getRangeAt(0).startContainer;
      do {
        if (
          startNode.getAttribute &&
          startNode.getAttribute("data-block") == "true"
        )
          break;
        startNode = startNode.parentNode;
      } while (startNode != null);
      var endNode = selection.getRangeAt(0).endContainer;
      do {
        if (
          endNode.getAttribute &&
          endNode.getAttribute("data-block") == "true"
        )
          break;
        endNode = endNode.parentNode;
      } while (endNode != null);
      return [startNode, endNode];
    }
  };

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
      if (this.props.playing) {
        this.props.playPauseVideo();
        this.updateCursor(this.state.editorState);
      } else {
        return "play";
      }
    }
    if (e.keyCode === deleteKey) {

      setTimeout(() => {
        if (document.querySelectorAll("span.Word").length != this.state.last_length){
          this.updateVideoScript()
        }
      }, (300));
    }
    // if (e.keyCode === enterKey) {
    //   console.log("customKeyBindingFn");

    //   return "split-paragraph";
    // }

    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = (command) => {
    if (command === "play") {
      if (!this.props.playing) {
        const cursorBlock = this.getCursorBlockElement();
        var BlockStart = cursorBlock
          .querySelectorAll("span.Word")[0]
          .getAttribute("sent-index");
        const startTime = this.props.scriptData[BlockStart]["start"];
        this.props.jumpVideo(startTime, true);
        this.props.playPauseVideo();
      }

      return "handled";
    } else if (command === "pause") {
      this.updateCursor(this.state.editorState);
      this.props.playPauseVideo();
      return "handled";
    } else if (command === "delete") {
      setTimeout(() => {
        if (document.querySelectorAll("span.Word").length != this.state.last_length){
          this.updateVideoScript()
        }
      }, (300));
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
        setEditorNewContentStateSpeakersUpdate:
          this.props.setEditorNewContentStateSpeakersUpdate,
        onWordClick: this.handleWordClick,
        isEditable: false,
      },
    };
  };

  getCurrentSent = () => {
    var currentSentIndex = 0;
    for (var i=0; i < this.props.scriptData.length; i++){
      const sent_start = this.props.scriptData[i]["start"];
      const sent_end = this.props.scriptData[i]["end"]
      // if (i<10){
      //   console.log(sent_start, sent_end)
      // }
      if (sent_start <= this.props.videoTime){
        if (sent_end >= this.props.videoTime){
          currentSentIndex = this.props.scriptData[i]["sent_index"]
          break;
        }
      }
    }

    setTimeout(()=>{const currentSentElement = document.querySelector(
      `span.Word[sent-index="${currentSentIndex}"]`
    );
    if (currentSentElement && this.props.playing && this.props.isScrollIntoViewOn ) {
      currentSentElement.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    }}, 200)
    return this.props.scriptData[currentSentIndex];
  };

  updateCursor = (editorState) => {
    var currentSentIndex = this.getCurrentSent().sent_index;
    const contentState = editorState.getCurrentContent();
    const blocksArray = contentState.getBlocksAsArray();
    const selectionState = this.state.editorState.getSelection();
    const currentBlock = blocksArray.filter(function (block) {
      return block.getData().get('sent_index') == currentSentIndex;
    })[0];
    const newSelectionState = selectionState.merge({
      anchorOffset: 0,
      focusOffset: 0,
      anchorKey: currentBlock.getKey(),
      focusKey: currentBlock.getKey(),
    });
    const newEditorState = EditorState.forceSelection(
      this.state.editorState,
      newSelectionState
    );
    this.onChange(newEditorState);
    const newSelectionState2 = new SelectionState({
      anchorOffset: 0,
      focusOffset: 0,
      anchorKey: currentBlock.getKey(),
      focusKey: currentBlock.getKey(),
    });
    const newContentState = Modifier.replaceText(
      contentState,
      newSelectionState2,
      "",
      null,
      null
    );
    setTimeout(
      () =>
        {this.onChange(
          EditorState.push(newEditorState, newContentState, "delete-character")
        )},
      200
    );
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
  };


  render() {
    const currentSent = this.getCurrentSent();
    const highlightColour = "#69e3c2";
    const unplayedColor = "#767676";
    const time = Math.round(this.props.videoTime * 4.0) / 4.0;
    const correctionBorder = "1px dotted blue";
    return (
      <section id="videoScriptSection" onDoubleClick={this.handleDoubleClick} className="script" aria-disabled="true" >
        
        <style scoped>
          {`span.Word[sent-index="${currentSent.sent_index}"] { background-color: ${highlightColour}; text-shadow: 0 0 0.01px black }`}
          {`span.Word[sent-index="${currentSent.sent_index}"]+span { background-color: ${highlightColour} }`}
          {`span.Word[data-prev-times~="${Math.floor(
            time
          )}"] { color: ${unplayedColor} }`}

          {`span.Word[data-moving="true"]+span { background-color: #ffc6b3;}}`}
          {`span.Word[data-confidence="low"] { border-bottom: ${correctionBorder} }`}
          {`span.Word[data-moving="true"] { background-color: #ffc6b3; color: black;}}`}
          {`span.Word[data-index="${currentSent.index}"]`}
          {`span.Word[data-type="${currentSent.type}"]`}
          {`span.Word[data-heading="${currentSent.heading}"]`}
        </style>
        <style scoped>
          {`span.Word[data-type="pause"] { background-color: #cce0ff; color: black;}}`}
        </style>
        <Editor
          ref={this.props.setDomEditorRef}
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
export default connect((reduxState, ownProps)=>{
  return {
    ...ownProps,
    videoTime: reduxState.playedSeconds,
    playing: reduxState.playing,
    scriptData: reduxState.scriptData,
  }
})(Scripts);

