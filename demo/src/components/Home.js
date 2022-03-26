import React, { Component } from "react";
import ReactPlayer from "react-player";
import { Header, Button, Image, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import classNames from "classnames";
import "../App.css";
import axios from "axios";
import Timeline from "./Timeline";
// import Segments from './Segments';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Divider from "@material-ui/core/Divider";
import { clips } from "../scripts";
import KeyboardEventHandler from "react-keyboard-event-handler";
import Speech from "speak-tts";
import ToolBar from "./ToolBar";
import Scripts from "./Scripts";
import scriptData from "./../scripts/ZaQtx54N6iU-aligned-sents.jsx";
import { convertToRaw } from "draft-js";

function formatTime(time) {
  time = Math.round(time);
  var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;
  var time = minutes + ":" + seconds;
  if (time.length < 5) time = 0 + time;
  return time;
}

function deformatTime(string) {
  const arr = string.split(":");
  var minutes = parseInt(arr[0]) * 60;
  var seconds = parseInt(arr[1]);
  return minutes + seconds;
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      playbackRate: 1.0,
      modalOpen: true,
      hover: false,
      message: false,
      videoID: "ZaQtx54N6iU",
      listening: false,
      transcript: "",
      time: "00:00",
      playedSeconds: 0,
      snippetIndex: 0,
      currSpan: "",
      started: false,
      currWordStart: 0,
      currWordEnd: 0,
      isJumping: false,
      timecodeOffset: 0,
    };
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.jumpVideo = this.jumpVideo.bind(this);
    this.updateSnippetIndex = this.updateSnippetIndex.bind(this);
    this.updateCurrSpan = this.updateCurrSpan.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.onPause = this._onPause.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.inspectFrame = this.inspectFrame.bind(this);
    this.updateCurrWordEnd = this.updateCurrWordEnd.bind(this);
    this.updatePlaybackRate = this.updatePlaybackRate.bind(this);
  }

  componentDidMount() {
    const speech = new Speech();
    if (speech.hasBrowserSupport()) {
      // returns a boolean
      // console.log("speech synthesis supported");
    }
    speech.init({
      volume: 1,
      lang: "en-GB",
      rate: 1.3,
      pitch: 1,
      voice: "Google US English",
      splitSentences: true,
      listeners: {
        onvoiceschanged: (voices) => {
          //  console.log("Event voiceschanged", voices)
        },
      },
    });
    this.handleSubmit("ZaQtx54N6iU");
  }

  updatePlaybackRate = (rate) => {
    this.setState({ playbackRate: rate });
  };

  handleProgress = (state) => {
    // We only want to update time slider if we are not currently seeking
    this.setState(state);
    const currTime = this.state.playedSeconds;
    if (this.state.currSpan) {
      const currRate = parseFloat(
        this.state.currSpan.getAttribute("data-playback")
      );
      this.setState({ playbackRate: currRate });
      if (
        (this.state.currWordEnd - 0.5 <= currTime &&
        currTime <= this.state.currWordEnd)
      ) {
        this.setState({ isJumping: true });
        var nextSpan;
        if (!this.state.currSpan.nextSibling) {
          nextSpan = this.state.currSpan.parentElement.parentElement.parentElement.parentElement.firstChild.lastChild.firstChild.firstChild;
        }
        else if (this.state.currSpan.nextSibling.hasAttribute("data-start")) {
          nextSpan = this.state.currSpan.nextSibling;
        } else if (this.state.currSpan.nextSibling.nextSibling) {
          nextSpan = this.state.currSpan.nextSibling.nextSibling;
        }
        console.log("here next span", nextSpan);

        if (nextSpan) {
          const nextIndex = parseInt(nextSpan.getAttribute("data-index"));
          const currIndex = parseInt(
            this.state.currSpan.getAttribute("data-index")
          );

          console.log("curr", currIndex);
          console.log("next", nextIndex);

          if (nextIndex > currIndex + 1) {
            const nextStart = parseFloat(nextSpan.getAttribute("data-start"));
            const nextEnd = parseFloat(nextSpan.getAttribute("data-end"));
            const nextPlayback = parseFloat(
              nextSpan.getAttribute("data-playback")
            );
            console.log("next: ", nextStart);
            this.setState(
              {
                currSpan: nextSpan,
                currWordStart: nextStart,
                currWordEnd: nextEnd,
                playing: true,
                // playbackRate: nextPlayback,
              },
              () => this.jumpVideo(nextStart, true)
            );
            const rate = parseFloat(
              this.state.currSpan.getAttribute("data-playback")
            );
            this.updatePlaybackRate(rate);
          } else {
          }
        }
      } else if (
        this.state.currWordEnd < currTime ||
        currTime < this.state.currWordStart
      ) {
        const children = document.querySelectorAll("span.Word");
        var i = 0;
        const theFirstWordElement = children[0]
        if (
          currTime < parseFloat(theFirstWordElement.getAttribute("data-end"))
        ) {
          this.setState({
            currSpan: theFirstWordElement,
            currWordStart: parseFloat(
              theFirstWordElement.getAttribute("data-start")
            ),
            currWordEnd: parseFloat(
              theFirstWordElement.getAttribute("data-end")
            ),
          });
        } else {
          for (i = 0; i < children.length - 1; i++) {
            if (
              parseFloat(children[i].getAttribute("data-start")) < currTime &&
              currTime < parseFloat(children[i + 1].getAttribute("data-start"))
            ) {
              const newEnd = parseFloat(children[i].getAttribute("data-end"));
              this.setState({
                currSpan: children[i],
                currWordStart: parseFloat(
                  children[i].getAttribute("data-start")
                ),
                currWordEnd: newEnd,
                // playbackRate: nextPlayback,
              });
              break;
            }
          }
          if (i === children.length - 1) {
            console.log("the end?");
            const newEnd = parseFloat(children[i].getAttribute("data-end"));
            const nextPlayback = parseFloat(
              children[i].getAttribute("data-playback")
            );
            this.setState({
              currSpan: children[i],
              currWordStart: parseFloat(children[i].getAttribute("data-start")),
              currWordEnd: newEnd,
              // playbackRate: nextPlayback,
            });
          }
        }
      }
    }
  };

  updateCurrWordEnd = (time) => {
    this.setState({ currWordEnd: time });
  };

  handleDuration = (duration) => {
    this.setState({ duration });
  };

  ref = (player) => {
    this.player = player;
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };
  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleSubmit(videoID) {
    this.setState({ start: 0, videoID: videoID, playing: false });
    this.handleDrawerClose();
  }

  playVideo = () => {
    if (!this.state.playing) {
      this.onClickPlay();
    } else {
      this.onClickPause();
    }
  };

  jumpVideo(time, abs = false) {
    if (abs) {
      this.player.seekTo(time);
    } else {
      this.player.seekTo(this.state.playedSeconds + time);
    }
    // this.setState({playing: true});
  }

  updateSnippetIndex(index) {
    this.setState({ snippetIndex: index });
  }

  updateCurrSpan(element) {
    this.setState({ currSpan: element });
  }

  onTimeChange(event, value) {
    const newTime = value.replace(/-/g, ":");
    const time = newTime.substr(0, 5);

    this.setState({ time });
  }

  onClickPlay = () => {
    this.setState({ playing: true });
    // if (!this.state.started) {
    //   const currentWordElement = document.querySelector(
    //     `span.Word[data-start="0"]`
    //   );
    //   const startTime = parseFloat(
    //     currentWordElement.getAttribute("data-start")
    //   );
    //   const endTime = parseFloat(currentWordElement.getAttribute("data-end"));
    //   this.setState({
    //     started: true,
    //     currSpan: currentWordElement,
    //     currWordStart: startTime,
    //     currWordEnd: endTime,
    //   });
    // }

    const children = document.querySelectorAll("span.Word");
    var i = 0;
    for (i = 0; i < children.length - 1; i++) {
      if (
        parseFloat(children[i].getAttribute("data-start")) <=
          this.state.playedSeconds &&
        this.state.playedSeconds <
          parseFloat(children[i + 1].getAttribute("data-start"))
      ) {
        console.log("set up - in the middle");
        const newEnd = parseFloat(children[i].getAttribute("data-end"));
        this.setState({
          currSpan: children[i],
          currWordStart: parseFloat(children[i].getAttribute("data-start")),
          currWordEnd: newEnd,
        });
        break;
      }
    }
    if (i === children.length - 1) {
      console.log("set up - at the end");
      const newEnd = parseFloat(children[i].getAttribute("data-end"));
      this.setState({
        currSpan: children[i],
        currWordStart: parseFloat(children[i].getAttribute("data-start")),
        currWordEnd: newEnd,
      });
    }
  };

  onClickPause = () => {
    this.setState({ playing: false });
  };

  _onPause = () => {
    console.log(sessionStorage.getItem("sessionID"));
  };


  handleKey = (key) => {
    const [current_idx, current_mid_idx] = this.align_segment();
    this.setState({
      current_idx: current_idx,
      current_mid_idx: current_mid_idx,
    });
    const {
      scene_starts,
      mid_indexes,
      dynamic,
      current_level,
      speech,
      mid_contents,
    } = this.state;
    var time = deformatTime(this.state.time);
    switch (key) {
      case "enter":
        this.jumpVideo(time, true);
        this.setState({ entered_time: time });
        break;
      case "space":
        this.setState({ playing: !this.state.playing });
        break;
      case "tab":
        this.inspectFrame();
    }
    var new_idx;
    if (current_level === 1) {
      switch (key) {
        case "left":
          new_idx = current_idx <= 0 ? 0 : current_idx - 1;
          var time = scene_starts[mid_indexes[new_idx]];
          this.jumpVideo(time, true);
          break;
        case "right":
          new_idx = current_idx === len ? current_idx : current_idx + 1;
          var len = mid_indexes.length;
          var time = scene_starts[mid_indexes[new_idx]];

          this.jumpVideo(time, true);
          break;
        case "down":
          this.setState({ current_level: 0 });
          return;
      }
      speech.cancel();
      speech
        .speak({
          text: mid_contents[new_idx].toString(),
        })
        .then(() => {
          console.log("Success !");
        })
        .catch((e) => {
          console.error("An error occurred :", e);
        });
    } else {
      switch (key) {
        case "left":
          new_idx = current_idx - 1;
          var time = scene_starts[new_idx];
          speech.cancel();
          speech
            .speak({
              text:
                "Go back" +
                Math.round(scene_starts[current_idx] - time).toString() +
                "seconds",
            })
            .then(() => {
              console.log("Success !");
            })
            .catch((e) => {
              console.error("An error occurred :", e);
            });
          this.jumpVideo(time, true);
          break;
        case "right":
          new_idx = current_idx + 1;
          var time = scene_starts[new_idx];
          speech.cancel();
          speech
            .speak({
              text:
                "Skipped" +
                Math.round(time - scene_starts[current_idx]).toString() +
                "seconds",
            })
            .then(() => {
              console.log("Success !");
            })
            .catch((e) => {
              console.error("An error occurred :", e);
            });
          speech
            .speak({
              text: dynamic[new_idx].toString(),
            })
            .then(() => {
              console.log("Success !");
            })
            .catch((e) => {
              console.error("An error occurred :", e);
            });
          this.jumpVideo(time, true);
          break;
        case "up":
          this.setState({ current_level: 1 });
          return;
      }
    }
  };

  inspectFrame() {
    const { videoID, current_idx, speech } = this.state;
    var json = require("../" + videoID + ".json");
    var scene = json[current_idx];
    var object, label;
    if (scene["texts"].length) {
      speech.cancel();
      console.log(scene["texts"]);
      speech
        .speak({
          text: "Detected text" + scene["texts"].join(", "),
        })
        .then(() => {
          console.log("Success !");
        })
        .catch((e) => {
          console.error("An error occurred :", e);
        });
    }
    if (Object.keys(scene["objects"]).length) {
      for (var object_key in scene["objects"]) {
        object = scene["objects"][object_key];
        speech
          .speak({
            text:
              "Detected" +
              object_key +
              "on" +
              object["pos"] +
              "size" +
              object["size"],
          })
          .then(() => {
            console.log("Success !");
          })
          .catch((e) => {
            console.error("An error occurred :", e);
          });
      }
    } else if (Object.keys(scene["labels"]).length) {
      speech
        .speak({
          text: "This frame may contain" + scene["labels"].join(", "),
        })
        .then(() => {
          console.log("Success !");
        })
        .catch((e) => {
          console.error("An error occurred :", e);
        });
    } else {
      speech
        .speak({
          text: "Nothing detected",
        })
        .then(() => {
          console.log("Success !");
        })
        .catch((e) => {
          console.error("An error occurred :", e);
        });
    }
  }

  render() {
    const { videoID, playing, playbackRate, playedSeconds, snippetIndex } =
      this.state;
    return (
      <div className="Home">
        <KeyboardEventHandler
          handleKeys={["space", "tab", "left", "up", "right", "down"]}
          onKeyEvent={(key, e) => this.handleKey(key)}
        ></KeyboardEventHandler>
        <div className="header-bar">
          <div className="header-title">
            <Header as="h2">Videdit A11y</Header>
          </div>
          <IconButton aria-label="Open drawer" onClick={this.handleDrawerOpen}>
            <MenuIcon style={{ fontSize: "30px" }} />
          </IconButton>
          <Drawer
            classes={{
              paper: classNames(
                "drawerPaper",
                !this.state.open && "drawerPaperClose"
              ),
            }}
            open={this.state.open}
            anchor="right"
          >
            <div>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronRightIcon />
              </IconButton>
            </div>
            <Divider />
            {clips.map((clip, index) => (
              <div key={index}>
                <Button
                  style={{
                    fontSize: "15px",
                    width: "100%",
                    paddingTop: "10%",
                    paddingBottom: "12%",
                  }}
                  key={clip}
                  onClick={() => this.handleSubmit(clip.videoID)}
                >
                  <div style={{ position: "absolute" }}>{clip.title}</div>
                </Button>
              </div>
            ))}
          </Drawer>
        </div>
        <Container className="main-page">
          <Container className="script-page">
            <ToolBar
              updatePlaybackRate={this.updatePlaybackRate}
              currSpan={this.state.currSpan}
              currWordStart={this.state.currWordStart}
            ></ToolBar>
            <Scripts
              playVideo={this.playVideo}
              jumpVideo={this.jumpVideo}
              player={this.player}
              videoTime={this.state.playedSeconds}
              updateSnippetIndex={this.updateSnippetIndex}
              updateCurrSpan={this.updateCurrSpan}
              updateCurrWordEnd={this.updateCurrWordEnd}
            ></Scripts>
            {/* <ScriptEditor transcriptData={this.state.transcriptData}></ScriptEditor> */}
          </Container>
          <Container className="right-page">
            <Container className="video-container">
              <ReactPlayer
                ref={this.ref}
                playing={this.state.playing}
                playbackRate={playbackRate}
                id="video"
                width="100%"
                height="100%"
                controls
                url={`https://www.youtube.com/watch?v=${videoID}`}
                onPause={this._onPause}
                onPlay={this._onPlay}
                onReady={this._onReady}
                onProgress={this.handleProgress}
                onDuration={this.handleDuration}
                onSeek={this._onSeek}
                progressInterval={100}
              ></ReactPlayer>
            </Container>

            <Button onClick={this.onClickPlay}>play</Button>
            <Button onClick={this.onClickPause}>pause</Button>
            <Timeline
              videoTime={this.state.playedSeconds}
              duration={this.state.duration}
            ></Timeline>
          </Container>
        </Container>
      </div>
    );
  }
}
export default Home;
