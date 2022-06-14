import React, { Component, createRef, useRef} from "react";
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
import Speech from "speak-tts";
import ToolBar from "./ToolBar";
import Scripts from "./Scripts";
import Instruction from "./Instruction";
import firebase from "firebase/app";
import "firebase/database";
import Navigation from "./Navigation";
import VideoComposition from "./MyVideo";
import { Player, PlayerRef } from "@remotion/player";
import { getVideoMetadata } from "@remotion/media-utils";



class Home extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      originalDuration: 1,
      durationInFrames: 1,
      playing: false,
      playbackRate: 1.0,
      modalOpen: true,
      hover: false,
      message: false,
      videoID: "ZaQtx54N6iU",
      listening: false,
      time: "00:00",
      playedSeconds: 0,
      currSpan: "",
      started: false,
      currWordStart: 0,
      currWordEnd: 0,
      timecodeOffset: 0,
      modalOpen: true,
      firstEntered: true,
      currHeading: "",
      currSentenceIdx: "",
      children: []
    };
    this.setDomEditorRef = (ref) => {
      this.script = ref;
    };
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.jumpVideo = this.jumpVideo.bind(this);
    // this.onPause = this._onPause.bind(this);
    this.updatePlaybackRate = this.updatePlaybackRate.bind(this);
    this.onStartPlay = this.onStartPlay.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
    this.navigateScript = this.navigateScript.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.updateDuration = this.updateDuration.bind(this);
    this.playerRef = React.createRef();

  }

  componentDidMount() {

    getVideoMetadata(
        "https://storage.googleapis.com/videdita11y/sample.mp4"
      )
    .then(({ durationInSeconds }) => {
        this.setState({durationInFrames: Math.round(durationInSeconds * 30), originalDuration: Math.round(durationInSeconds * 30)});
    })
    .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
    });
    const { current } = this.playerRef;
    if (!current) {
      return;
    }

    // this.setState({current: current});

    // this.playerRef = useRef<PlayerRef>(null);

    const handlePlay = () => {
      // console.log("play triggered");
      
      const children = document.querySelectorAll("span.Word");
      this.setState({
        playing: true,
        children: children
      })
    };
   
    this.playerRef.current.addEventListener("play", handlePlay);
    const intervalId = setInterval(() => this.handleProgress(), 100);
    this.setState({ intervalId })

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
    this.setState({ speech: speech });
    this.handleSubmit("ZaQtx54N6iU");
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  updateDuration = () =>{
    console.log("here")
    const children = document.querySelectorAll("span.Word");
    var currIndex, nextIndex, currSpan, nextSpan, currEnd, nextStart;
    var durationChange = 0
    for (var i=0; i < children.length - 1; i++){
      currSpan = children[i];
      nextSpan = children[i+1]
      currIndex = parseInt(currSpan.getAttribute("word-index"));
      nextIndex = parseInt(nextSpan.getAttribute("word-index"));
      const currEndTrim = currSpan.getAttribute("trim-end");
      const nextStartTrim = nextSpan.getAttribute("trim-start");
      // if jump is needed (because a sentence in between was deleted)
      if (nextIndex > currIndex + 1 ) {
          currEnd = parseFloat(currSpan.getAttribute("data-end"));
          nextStart = parseFloat(nextSpan.getAttribute("data-start"));
          durationChange += parseInt(nextStart*30) - parseInt(currEnd*30)
      }
    }
    this.setState({ durationInFrames: this.state.originalDuration - durationChange });
  }


  updatePlaybackRate = (rate) => {
    this.setState({ playbackRate: rate });
  };

  onStartPlay = () => {
    this.setState({ playing: true });
  };

  navigateScript(time) {
    this.script &&  this.script.focus();
    this.jumpVideo(time, true);
    if (!this.state.playing) this.playVideo();
  }


  handleProgress = () => {
    // const { current } = this.playerRef;
    // We only want to update time slider if we are not currently seeking
    const currTime = (this.playerRef.current.getCurrentFrame()/30).toFixed(2);
    this.setState({playedSeconds: currTime})

    // const speech = this.state.speech;
  };



  scriptRef = (ref) => {
    this.scriptRef = ref;
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };
  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  downloadVideo = (mimeType) => {
    var elHtml = document.getElementById("videoScriptSection").innerHTML;
    var link = document.createElement("a");
    mimeType = mimeType || "text/plain";

    link.setAttribute("download", "video.html");
    link.setAttribute(
      "href",
      "data:" + mimeType + ";charset=utf-8," + encodeURIComponent(elHtml)
    );
    link.click();
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

  getSelected(divs) {
    this.setState({
      selectedDivs: divs,
    });
  }


  onClickPlay = () => {
    console.log("onClickPlay")
    this.setState({ playing: true });

    const children = document.querySelectorAll("span.Word");
    var i = 0;
    for (i = 0; i < children.length - 1; i++) {
      if (
        parseFloat(children[i].getAttribute("data-start")) <=
          this.state.playedSeconds &&
        this.state.playedSeconds <
          parseFloat(children[i + 1].getAttribute("data-start"))
      ) {
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
        currWordStart: parseInt(children[i].getAttribute("data-start")),
        currWordEnd: newEnd,
      });
    }
  };

  // onClickPause = () => {
  //   this.setState({ playing: false });
  // };

  // _onPause = () => {
  //   //update script cursor
  // };

  // _onPlay = () => {
  //   if (!this.state.started) {
  //     this.onClickPlay();
  //     this.setState({ started: true });
  //   }
  // };

  render() {
    const { videoID, playing, playbackRate,  modalOpen , commentOpen} = this.state;
    return (
      <div className="Home">
        {/* <Instruction
          open={modalOpen}
          closeModal={this.closeModal}
        ></Instruction> */}
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
          <Container className="left-page">
            <Container className="video-container">
              <Player
                ref={this.playerRef}
                style={{ width: "100%", height: "100%" }}
                component={VideoComposition}
                durationInFrames={this.state.durationInFrames}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                inputProps={{children: this.state.children}}
                framesPerLambda={4}
              />
            </Container>
            {/* <Button onClick={this.onClickPlay}>play</Button>
            <Button onClick={this.onClickPause}>pause</Button> */}
            <Timeline
              videoTime={this.state.playedSeconds}
              duration={this.state.durationInFrames/30}
            ></Timeline>
            <Container className="navigation-container">
              <Navigation navigateScript={this.navigateScript} />
            </Container>
          </Container>
          <Container className="script-page">
            <ToolBar
              updatePlaybackRate={this.updatePlaybackRate}
              currSpan={this.state.currSpan}
              currWordStart={this.state.currWordStart}
              currWordEnd={this.state.currWordEnd}
              onStartPlay={this.onStartPlay}
              selectedDivs={this.state.selectedDivs}
              focusScript={this.focusScript}
            ></ToolBar>
            <Scripts
              setDomEditorRef={this.setDomEditorRef}
              playVideo={this.playVideo}
              jumpVideo={this.jumpVideo}
              videoTime={this.state.playedSeconds}
              playing={this.state.playing}
              getSelected={this.getSelected}
              updateDuration={this.updateDuration}
            ></Scripts>
          </Container>
        </Container>
        <div className="download-button" >
        <Button onClick={this.downloadVideo}>Download the video</Button>
        </div>
      </div>
    );
  }
}

export default Home;
