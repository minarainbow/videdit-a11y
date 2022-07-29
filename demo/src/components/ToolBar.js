import React from "react";
import _ from "lodash";
import { Search, Grid, Header, Segment } from "semantic-ui-react";
import { Dropdown, Menu, Icon, Button } from "semantic-ui-react";
import IconButton from "@mui/material/IconButton";
import SpeedIcon from "@mui/icons-material/Speed";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AddCommentIcon from "@mui/icons-material/AddComment";
import TextField from "@mui/material/TextField";
import { FormControlUnstyledContext } from "@mui/base";
import Comment from './Comment';
import { Toolbar } from "@mui/material";
import {connect, useDispatch, useSelector} from "react-redux";

const results = [
  {
    keyword: "Socks",
    type: "visual",
  },
  {
    keyword: "Socks",
    type: "text",
  },
  {
    keyword: "Kitchen",
    type: "text",
  },
];

class ToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      results: [],
      value: "",
      activeItem: null,
      rangeClick: false,
      invalidRange: false,
      noneSelected: false,
      trimStartTime: "",
      trimEndTime: "",
      commentOpen: false,
      selectedDivs: []
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.timeoutRef = React.createRef();
    this.dispatch = this.dispatch.bind(this);
    this.startRef = React.createRef();
    this.endRef = React.createRef();
    this.changeCommentState = this.changeCommentState.bind(this);
  }

  initialState = {
    loading: false,
    results: [],
    value: "",
  };

  changeCommentState() {
    this.setState({ commentOpen: !this.state.commentOpen})

    setTimeout(()=>this.setState({selectedDivs: this.props.selectedDivs}), 200);
    setTimeout(()=>console.log(this.state.selectedDivs), 300);
  }

  dispatch(action) {
    console.log("dispatch: ", action);
    switch (action.type) {
      case "CLEAN_QUERY":
        this.setState(this.initialState);
        return;
      case "START_SEARCH":
        this.setState({ loading: true, value: action.query });
        return;
      case "FINISH_SEARCH":
        this.setState({ loading: false, results: action.results });
        return;
      case "UPDATE_SELECTION":
        this.setState({ value: action.selection });
        return;
      default:
        throw new Error();
    }
  }

  timeoutRef = (timeoutRef) => {
    this.timeoutRef = timeoutRef;
  };

  handleSearchChange = (e, data) => {
    clearTimeout(this.timeoutRef.current);
    this.dispatch({ type: "START_SEARCH", query: data.value });

    this.timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        this.dispatch({ type: "CLEAN_QUERY" });
        return;
      }

      const re = new RegExp(_.escapeRegExp(data.value), "i");
      const isMatch = (result) => re.test(result.keyword);

      this.dispatch({
        type: "FINISH_SEARCH",
        results: _.filter(results, isMatch),
      });
    }, 300);
  };

  handleSliderChange = (e) => {};

  handleItemClick = (e, { name }) => {
    if (!this.props.selectedDivs){
      this.setState({noneSelected: true})
      setTimeout(()=>this.setState({ noneSelected: false }), 1500);
      return
    }
    this.setState({ activeItem: name });
  };

  

  formatTime(time) {
    const integer = Math.floor(time);
    const underSecs = (time - integer).toFixed(2).toString().substring(2);

    var minutes = Math.floor(integer / 60),
      seconds = integer - minutes * 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return minutes + ":" + seconds + ":" + underSecs;
  }

  calculateTime(time) {
    const formatTime = time.split(":");
    const totalSecs =
      parseInt(formatTime[0]) * 60 +
      parseInt(formatTime[1]) +
      parseFloat("0." + formatTime[2]);
    return totalSecs;
  }

  onClickReset = () => {
    const currSpan = document.querySelector(
      `span.Word[data-start="${this.props.currWordStart}"]`
    );
    if (currSpan) {
      const defaultStartTime = parseFloat(
        currSpan.getAttribute("data-default-start")
      );
      const defaultEndTime = parseFloat(
        currSpan.getAttribute("data-default-end")
      );
      currSpan.setAttribute("data-start", defaultStartTime);
      currSpan.setAttribute("data-end", defaultEndTime);
      currSpan.setAttribute("trim-start", "false");
      currSpan.setAttribute("trim-start", "false");
    }
  };

  handleTrimClick = () => {
    if (!this.props.selectedDivs){
      this.setState({noneSelected: true})
      return
    }
    const [startDiv, endDiv] = this.props.selectedDivs;
    const startTime = startDiv
      .querySelectorAll("span.Word")[0]
      .getAttribute("data-start");
    const divs = endDiv.querySelectorAll("span.Word");
    const endTime = divs[divs.length - 1].getAttribute("data-end");
    this.setState({
      rangeClick: !this.state.rangeClick,
      trimStartTime: startTime,
      trimEndTime: endTime,
    });
  };

  onClickTrim = () => {
    console.log(this.props.selectedDivs);
    const [startDiv, endDiv] = this.props.selectedDivs;
    const defaultStartTime = parseFloat(
      startDiv
        .querySelectorAll("span.Word")[0]
        .getAttribute("data-default-start")
    );
    const divs = endDiv.querySelectorAll("span.Word");
    const defaultEndTime = parseFloat(
      divs[divs.length - 1].getAttribute("data-default-end")
    );
    const oldStartTime = this.state.trimStartTime;
    const oldEndTime = this.state.trimEndTime;
    const startTime = this.calculateTime(this.startRef.current.value);
    const endTime = this.calculateTime(this.endRef.current.value);
    if (startTime < defaultStartTime || endTime > defaultEndTime) {
      this.setState({ invalidRange: true });
      setTimeout(()=>this.setState({ invalidRange: false }), 300)
    } else {
      if (startTime !== oldStartTime) {
        startDiv
          .querySelectorAll("span.Word")[0]
          .setAttribute("data-start", startTime);
        startDiv
          .querySelectorAll("span.Word")[0]
          .setAttribute("trim-start", "true");
      }
      if (endTime !== oldEndTime) {
        divs[divs.length - 1].setAttribute("data-end", endTime);
        divs[divs.length - 1].setAttribute("trim-end", "true");
      }
      this.setState({ rangeClick: !this.state.rangeClick });
      this.props.onStartPlay();
    }
  };

  handleChangeSpeed = (rate) => {
    
    const [startDiv, endDiv] = this.props.selectedDivs;
    const startIdx = startDiv.getAttribute("word-index");
    const endIdx = endDiv.getAttribute("word-index");
    console.log(this.props.scriptData)
  };

  render() {
    const { loading, results, value } = this.state;
    const resRender = ({ type, keyword }) => (
      <span key="keyword">
        {type}: {keyword}
      </span>
    );
    return (
      <div
        className="tool-bar"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
      >
        <Menu icon="labeled" className="tool-icon">

          <Comment
            commentButton={
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                }}>
            <Menu.Item role="menuitem" tabIndex="0" name="comment" onClick={this.changeCommentState}>
              <AddCommentIcon style={{ fontSize: "30px" }} />
              Comment
            </Menu.Item>
            </div>}
            isOpen={this.state.commentOpen}
            changeCommentState={this.changeCommentState}
            selectedDivs={this.state.selectedDivs}
          ></Comment>
          <Dropdown
            icon={null}
            name="speed"
            aria-label="speed"
            trigger={
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                  // this.handleItemClick();
                }}
              >
                <Menu.Item onClick={this.handleItemClick}>
                  <SpeedIcon style={{ fontSize: "30px" }} />
                  Speed
                </Menu.Item>
              </div>
            }
          >
            <Dropdown.Menu >
              <div>
                <Dropdown.Item
                  text="x 0.5"
                  onClick={() => this.handleChangeSpeed(0.5)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                />
              </div>
              <div
              >
                <Dropdown.Item
                  text="x 1.0"
                  onClick={() => this.handleChangeSpeed(1.0)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}    
                />
              </div>
              <div
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              >
                <Dropdown.Item
                  text="x 1.5"
                  onClick={() => this.handleChangeSpeed(1.5)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}    
                />
              </div>
              <div
              >
                <Dropdown.Item
                  text="x 2.0"
                  onClick={() => this.handleChangeSpeed(2.0)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}    
                />
              </div>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            name="trim"
            aria-label="trim"
            icon={null}
            trigger={
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
              >
                <Menu.Item onClick={this.handleTrimClick}>
                  <ContentCutIcon style={{ fontSize: "30px" }} />
                  Trim
                </Menu.Item>
              </div>
            }
          ></Dropdown>
        </Menu>
        {this.state.rangeClick ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <TextField
                  id="start-number"
                  label="Start"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="filled"
                  defaultValue={this.formatTime(this.state.trimStartTime)}
                  size="small"
                  style={{ width: "100px" }}
                  inputRef={this.startRef}
                />
                <TextField
                  id="end-number"
                  label="End"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="filled"
                  defaultValue={this.formatTime(this.state.trimEndTime)}
                  size="small"
                  style={{ width: "100px" }}
                  inputRef={this.endRef}
                />
              </div>

              <Button
                onClick={this.onClickTrim}
                style={{
                  width: "60px",
                  height: "40px",
                  marginLeft: "10px",
                }}
              >
                OK
              </Button>
              <Button
                onClick={this.onClickReset}
                style={{
                  width: "80px",
                  height: "40px",
                  marginLeft: "10px",
                }}
              >
                Reset
              </Button>
            </div>
            {this.state.invalidRange ? (
              <div style={{ color: "red" }}>Invalid range</div>
            ) : (
              <></>
            )}{" "}
          </div>
        ) : (
          <></>
        )}
        {this.state.noneSelected ? (
          <div style={{ color: "red" }}>No range selected</div>
        ) : (
          <></>
        )}{" "}
      </div>
    );
  }
}
export default connect((reduxState, ownProps)=>{
  return {
    ...ownProps,
    videoTime: reduxState.playedSeconds,
    scriptData: reduxState.scriptData,
  }
})(ToolBar);
