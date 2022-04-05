import React from 'react';
import { 
  EditorBlock, 
  Modifier, 
  EditorState, 
  SelectionState,
  convertFromRaw,
  convertToRaw
 } from 'draft-js';
 import ForumIcon from '@mui/icons-material/Forum';
 import IconButton from "@material-ui/core/IconButton";
 import { Dropdown, Menu, Icon, Button } from "semantic-ui-react";



const updateHeadingName = (oldName, newName, state) => {
  const contentToUpdate = convertToRaw(state);

  contentToUpdate.blocks.forEach(block => {
    if (block.data.heading === oldName) {
      block.data.heading = newName;
    }
  })

  return convertFromRaw(contentToUpdate);
}

function formatTime(time) {
    time = Math.round(time);
  
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

class WrapperBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reviews: [],
      heading: '',
      start: 0,
      timecodeOffset: this.props.blockProps.timecodeOffset
    };
  }

  componentDidMount() {
    const { block } = this.props;
    const heading = block.getData().get('heading');
    const start = block.getData().get('start');
    const reviews = block.getData().get('reviews');

    this.setState({
      heading: heading,
      start: start,
      reviews: reviews
    });
  }
  // reducing unnecessary re-renders
  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps.block.getText() !== this.props.block.getText()) {
      return true;
    }

    if (nextProps.blockProps.showHeadings !== this.props.blockProps.showHeadings) {
      return true;
    }

    if (nextProps.blockProps.showTimecodes !== this.props.blockProps.showTimecodes) {
      return true;
    }

    if (nextProps.blockProps.timecodeOffset !== this.props.blockProps.timecodeOffset) {
      return true;
    }

    if (nextState.heading !== this.state.heading) {
      return true;
    }

    if (nextProps.blockProps.isEditable !== this.props.blockProps.isEditable) {
      return true;
    }

    if(nextProps.block.getData().get('heading') !== this.state.heading){
      return true;
    }
    return false;
  };

  componentDidUpdate  = (prevProps, prevState) =>{

    if(prevProps.block.getData().get('heading') !== prevState.heading){
        
        this.setState({
            heading: prevProps.block.getData().get('heading')
        })

        return true;
      }
  }

  handleOnClickEdit = () => {
    const oldHeadingName = this.state.heading;
    const newHeadingName = prompt('New Heading Name?', this.state.heading);
    if (newHeadingName !== '' && newHeadingName !== null) {
      this.setState({ heading: newHeadingName });
      const isUpdateAllHeadingInstances = window.confirm(`Would you like to replace all occurrences of ${oldHeadingName} with ${newHeadingName}?`);
     
      if (this.props.blockProps.handleAnalyticsEvents) {
        this.props.blockProps.handleAnalyticsEvents({
          category: 'WrapperBlock',
          // action: 'handleOnClickEdit',
          name: 'newHeadingName',
          value: newHeadingName
        });
      }

      if(isUpdateAllHeadingInstances){
        const ContentState = this.props.blockProps.editorState.getCurrentContent();
        const contentToUpdateWithSpekaers = updateHeadingName(oldHeadingName, newHeadingName, ContentState);
        this.props.blockProps.setEditorNewContentStateHeadingsUpdate(contentToUpdateWithSpekaers);
      }
      else{
       // From docs: https://draftjs.org/docs/api-reference-selection-state#keys-and-offsets
        // selection points are tracked as key/offset pairs,
        // where the key value is the key of the ContentBlock where the point is positioned
        // and the offset value is the character offset within the block.

        // Get key of the currentBlock
        const keyForCurrentCurrentBlock = this.props.block.getKey();
        // create empty selection for current block
        // https://draftjs.org/docs/api-reference-selection-state#createempty
        const currentBlockSelection = SelectionState.createEmpty(
          keyForCurrentCurrentBlock
        );
        const editorStateWithSelectedCurrentBlock = EditorState.acceptSelection(
          this.props.blockProps.editorState,
          currentBlockSelection
        );

        const currentBlockSelectionState = editorStateWithSelectedCurrentBlock.getSelection();
        const newBlockDataWithHeadingName = { heading: newHeadingName };

        // https://draftjs.org/docs/api-reference-modifier#mergeblockdata
        const newContentState = Modifier.mergeBlockData(
          this.props.contentState,
          currentBlockSelectionState,
          newBlockDataWithHeadingName
        );

        this.props.blockProps.setEditorNewContentStateHeadingsUpdate(newContentState);
      }
    }
  };

  handleTimecodeClick = () => {
    this.props.blockProps.onWordClick(this.state.start);
    if (this.props.blockProps.handleAnalyticsEvents) {
      this.props.blockProps.handleAnalyticsEvents({
        category: 'WrapperBlock',
        action: 'handleTimecodeClick',
        name: 'onWordClick',
        value: formatTime(this.state.start)
      });
    }
  };

  render() {
    let startTimecode = this.state.start;
    if (this.props.blockProps.timecodeOffset) {
      startTimecode += this.props.blockProps.timecodeOffset;
    }
    const headingElement = (
        <span className={ this.props.blockProps? ["heading", "headingEditable"].join(' '):  ["heading", "headingNotEditable"].join(' ')}
        title={ this.state.heading }
        onClick={ this.props.blockProps? this.handleOnClickEdit: null } >
        { "<" + this.state.heading + ">"}
      </span>
    );

    const timecodeElement = (
      <span className={ "time" } onClick={ this.handleTimecodeClick }>
        {formatTime(startTimecode)}
      </span>
    );

    const reviewElement = (

      // <IconButton aria-label="Review" onClick={null} size="small">
            
      // </IconButton>
      <Dropdown
            icon={null}
            trigger={
              <Menu.Item name="review" onClick={null}>
                <ForumIcon style={{ fontSize: "25px", marginTop: "3px", color: "gray" }} />
                <small><sup style={{color: "gray"}}>{this.state.reviews.length}</sup></small>
              </Menu.Item>
            }>
            <Dropdown.Menu>
            {this.state.reviews.map((review, index) => (
              <Dropdown.Item
              
              text={formatTime(review.start) + "  " + (review.moving? "moving": "long pause")}
              onClick={() => this.handleChangeSpeed(1.0)}
            />
            ))}
            </Dropdown.Menu>
          </Dropdown>
    );

    return (
      <div className={ "WrapperBlock" }>
        <div
          className={ [ "markers", "unselectable" ].join(' ') }
          contentEditable={ false }
        >
          {this.props.blockProps.showHeadings ? headingElement : ''}

          {this.props.blockProps.showTimecodes ? timecodeElement : ''}

          {this.state.reviews.length ? reviewElement : ''}
        </div>
        <div className={ "text" }>
          <EditorBlock { ...this.props } />
        </div>
      </div>
    );
  }
}

export default WrapperBlock;