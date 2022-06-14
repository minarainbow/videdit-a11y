import React from "react";
import { Button } from "semantic-ui-react";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned-sents.jsx";
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
import firebase from "firebase/app";
import "firebase/database";
import { ref } from "firebase/database";

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
      scriptData: scriptData["words"],
      editorState: EditorState.createEmpty(),
      current_heading: 0,
      cuts: [],
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
    // fetch( `${databaseURL+'/scriptdata'}/.json`).then(res => {
    //   if (res.status !== 200) {
    //       throw new Error(res.statusText);
    //   }
    //   return res.json();
    // }).then(res => {
    //     //console.log(res)
    //     this.setState({
    //         scriptData: res["words"],
    //     })
    // })
    const blocks = this.sttJsonAdapter(this.state.scriptData);
    const contentState = convertFromRaw(blocks);
    const editorState = EditorState.createWithContent(contentState, decorator);
    this.setState({ editorState: editorState });
  }

  updateVideoScript(deleted_element) {
    var scriptData = this.state.scriptData;
    const deleted_script_element = scriptData.filter(function (data) {
      return data.index == deleted_element.index;
    })[0];
    const deleted_index = scriptData.indexOf(deleted_script_element);

    // when deleted_element is heading
    if (
      deleted_script_element.new_heading &&
      deleted_index < scriptData.length - 1 &&
      !scriptData[deleted_index + 1].new_heading
    ) {
      scriptData[deleted_index + 1].new_heading =
        deleted_script_element.new_heading;
    }
    scriptData.splice(deleted_index, 1);

    // update backend
    fetch(
      `${
        databaseURL +
        "/sessions/" +
        sessionStorage.getItem("sessionID") +
        "/scriptdata/"
      }/.json`,
      {
        method: "POST",
        body: JSON.stringify(scriptData),
      }
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then(() => {
        //console.log("Dummy data succesfully sent!")
      });

    return scriptData;
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
        this.props.playVideo();
        this.updateCursor(this.state.editorState);
      } else {
        return "play";
      }
    }
    // if (e.keyCode === rightArrow) {
    //   console.log("customKeyBindingFn");

    //   return "next-sentence";
    // }
    // if (e.keyCode === leftArrow) {
    //   console.log("customKeyBindingFn");

    //   return "prev-sentence";
    // }
    // if (e.keyCode === deleteKey) {
    //   console.log("customKeyBindingFn");

    //   return "delete-sentence";
    // }
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
          .getAttribute("data-start");
        this.props.jumpVideo(BlockStart, true);
        this.props.playVideo();
      }

      return "handled";
    } else if (command === "pause") {
      return "handled";
    } else if (command === "next-sentence") {
      const currentSentenceEnd = this.getCurrentSent().end;
      this.props.jumpVideo(currentSentenceEnd, true);
    } else if (command === "prev-sentence") {
      const currentSentenceStart = this.getCurrentSent().start;
      if (this.props.videoTime < currentSentenceStart + 2) {
        const prevSentenceStart = this.getCurrentSent().prevStart;
        this.props.jumpVideo(prevSentenceStart, true);
      } else {
        this.props.jumpVideo(currentSentenceStart, true);
      }
    } else if (command === "split-paragraph") {
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
        setEditorNewContentStateSpeakersUpdate:
          this.props.setEditorNewContentStateSpeakersUpdate,
        onWordClick: this.handleWordClick,
        isEditable: false,
      },
    };
  };

  getCurrentSent = () => {
    var currentSentIndex = 0;
    if (scriptData) {
      const contentState = this.state.editorState.getCurrentContent();
      const contentStateConvertEdToRaw = convertToRaw(contentState);
      const entityMap = contentStateConvertEdToRaw.entityMap;

      for (var entityKey in entityMap) {
        const entity = entityMap[entityKey];
        const word = entity.data;
        if (word.start <= this.props.videoTime) {
          if (word.end > this.props.videoTime) {
            currentSentIndex = word.sent_index;
          }
        }
      }
    }

    const currentSent = this.state.scriptData[currentSentIndex];
    if (currentSent.start !== "NA") {
      const currentSentElement = document.querySelector(
        `span.Word[data-start="${currentSent.start}"]`
      );
      if (this.props.isScrollIntoViewOn) {
        currentSentElement.scrollIntoView({
          block: "nearest",
          inline: "center",
        });
      }
    }
    return currentSent;
  };

  getNextSent = () => {
    const nextSent = {
      start: "NA",
      end: "NA",
      index: "NA",
      heading: "NA",
    };
    if (scriptData) {
      const contentState = this.state.editorState.getCurrentContent();
      const contentStateConvertEdToRaw = convertToRaw(contentState);
      const entityMap = contentStateConvertEdToRaw.entityMap;

      for (var entityKey in entityMap) {
        const entity = entityMap[entityKey];
        const word = entity.data;

        if (word.start >= this.props.videoTime) {
          if (word.end >= this.props.videoTime) {
            nextSent.start = word.start;
            nextSent.end = word.end;
            nextSent.index = word.index;
            nextSent.heading = word.heading;
            return nextSent;
          }
        }
      }
    }
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
        this.onChange(
          EditorState.push(newEditorState, newContentState, "delete-character")
        ),
      200
    );
  };

  handleDoubleClick = (event) => {
    console.log(this.state.editorState.getSelection());
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
export default Scripts;
