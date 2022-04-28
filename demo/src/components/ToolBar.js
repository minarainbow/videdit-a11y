import React from "react";
import _ from "lodash";
// import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
import { Search, Grid, Header, Segment } from "semantic-ui-react";
import { Dropdown, Menu, Icon, Button } from "semantic-ui-react";
import IconButton from "@mui/material/IconButton";
import SpeedIcon from "@mui/icons-material/Speed";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AddCommentIcon from "@mui/icons-material/AddComment";
import TextField from "@mui/material/TextField";
import { FormControlUnstyledContext } from "@mui/base";

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
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.timeoutRef = React.createRef();
    this.dispatch = this.dispatch.bind(this);
    this.startRef = React.createRef();
    this.endRef = React.createRef();
  }

  initialState = {
    loading: false,
    results: [],
    value: "",
  };

  // source = _.times(5, () => ({
  //   title: faker.company.companyName(),
  //   description: faker.company.catchPhrase(),
  //   image: faker.internet.avatar(),
  //   price: faker.finance.amount(0, 100, 2, '$'),
  // }))

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
    this.setState({ activeItem: name });
  };

  handleAddComment = () => {
    const currSpan = document.querySelector(
      `span.Word[data-start="${this.props.currWordStart}"]`
    );

    const comment = prompt("Add comments");
    if (comment !== "" && comment !== null && currSpan) {
      currSpan.setAttribute("data-comment", comment);
    }
  };

  handleTrimClick = () => {
    this.setState({ rangeClick: !this.state.rangeClick });
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

  onClickTrim = () => {
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
      const oldStartTime = parseFloat(currSpan.getAttribute("data-start"));
      const oldEndTime = parseFloat(currSpan.getAttribute("data-end"));
      const startTime = this.calculateTime(this.startRef.current.value);
      const endTime = this.calculateTime(this.endRef.current.value);
      console.log(oldStartTime, oldEndTime, startTime, endTime);
      if (startTime < defaultStartTime || endTime > defaultEndTime) {
        console.log("invalid");
        this.setState({ invalidRange: true });
      } else {
        if (startTime !== oldStartTime) {
          currSpan.setAttribute("data-start", startTime);
          currSpan.setAttribute("trim-start", "true");
        }
        if (endTime !== oldEndTime) {
          currSpan.setAttribute("data-end", endTime);
          currSpan.setAttribute("trim-end", "true");
        }
        this.setState({ rangeClick: !this.state.rangeClick });
        this.props.onStartPlay();
      }
    }
  };

  handleChangeSpeed = (rate) => {
    const currSpan = document.querySelector(
      `span.Word[data-start="${this.props.currWordStart}"]`
    );
    console.log(currSpan);
    if (currSpan) {
      currSpan.setAttribute("data-playback", rate);
    }
  };

  render() {
    const { loading, results, value } = this.state;
    const resRender = ({ type, keyword }) => (
      <span key="keyword">
        {type}: {keyword}
      </span>
    );
    return (
      <div className="tool-bar">
        <Menu icon="labeled" className="tool-icon">
          <Menu.Item name="comment" onClick={this.handleAddComment}>
            <AddCommentIcon style={{ fontSize: "30px" }} />
            Comment
          </Menu.Item>
          <Dropdown
            icon={null}
            trigger={
              <Menu.Item name="speed" onClick={this.handleItemClick}>
                <SpeedIcon style={{ fontSize: "30px" }} />
                Speed
              </Menu.Item>
            }
          >
            <Dropdown.Menu vertical>
              <Dropdown.Item
                text="x 0.5"
                onClick={() => this.handleChangeSpeed(0.5)}
              />
              <Dropdown.Item
                text="x 1.0"
                onClick={() => this.handleChangeSpeed(1.0)}
              />
              <Dropdown.Item
                text="x 1.5"
                onClick={() => this.handleChangeSpeed(1.5)}
              />
              <Dropdown.Item
                text="x 2.0"
                onClick={() => this.handleChangeSpeed(2.0)}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            icon={null}
            trigger={
              <Menu.Item name="trim" onClick={this.handleTrimClick}>
                <ContentCutIcon style={{ fontSize: "30px" }} />
                Trim
              </Menu.Item>
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
                  defaultValue={this.formatTime(this.props.currWordStart)}
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
                  defaultValue={this.formatTime(this.props.currWordEnd)}
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
        {/* <Search
          fluid
          icon="search"
          placeholder="Search..."
          results={results}
          resultRenderer={resRender}
          onSearchChange={this.handleSearchChange}
          onResultSelect={(e, data) =>
            this.dispatch({
              type: "UPDATE_SELECTION",
              selection: data.result.keyword,
            })
          }
          value={value}
        /> */}
      </div>
    );
  }
}
export default ToolBar;
