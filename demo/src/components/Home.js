import React, {Component, createRef, forwardRef, useState, useEffect, useRef} from "react";
import { Header, Button, Image, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import classNames from "classnames";
import "../App.css";
import Timeline from "./Timeline";
import Container from "react-bootstrap/Container";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Divider from "@material-ui/core/Divider";
import { clips } from "../scripts";
import Speech from "speak-tts";
import ToolBar from "./ToolBar";
import Scripts from "./Scripts";
import "firebase/database";
import Navigation from "./Navigation";
import VideoComposition from "./MyVideo";
import { Player, PlayerRef } from "@remotion/player";
import { getVideoMetadata } from "@remotion/media-utils";
import {connect, useDispatch, useSelector} from "react-redux";
import {setDuration, setPlayedSeconds, setPlaying} from "../redux/mainScreenReducer";
import newChapterSound from "../sound/turn_sound.mp3";
import warningSound from "../sound/noti_sound.mp3";

class Home extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      originalDuration: 1,
      durationInFrames: 1,
      playbackRate: 1.0,
      message: false,
      videoID: "ZaQtx54N6iU",
      listening: false,
      time: "00:00",
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
    this.updatePlaybackRate = this.updatePlaybackRate.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
    this.navigateScript = this.navigateScript.bind(this);
    this.playPauseVideo = this.playPauseVideo.bind(this);
    this.updateDuration = this.updateDuration.bind(this);
    this.playerRef = React.createRef();
    this.checkCurrentSentence = this.checkCurrentSentence.bind(this);

  }

  componentDidMount() {

    getVideoMetadata(
        "https://storage.googleapis.com/videdita11y/sample.mp4"
      )
    .then(({ durationInSeconds }) => {
      this.props.dispatch(setDuration(Math.round(durationInSeconds * 30)))
      this.setState({originalDuration: Math.round(durationInSeconds * 30)});
    })
    .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
    });

    const speech = new Speech();
    if (speech.hasBrowserSupport()) {
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
          currEnd = parseFloat(currSpan.getAttribute("data-default-end"));
          nextStart = parseFloat(nextSpan.getAttribute("data-default-start"));
          durationChange += parseInt(nextStart*30) - parseInt(currEnd*30)
      }
    }
    this.props.dispatch(setDuration(this.state.originalDuration - durationChange))
  }

  checkCurrentSentence = (sentenceIndex) => {
    // if entered to a new sentence
    if (this.state.currSentenceIdx != sentenceIndex){
      this.setState({currSentenceIdx: sentenceIndex});
      const currentSentElement = document.querySelectorAll(`span.Word[sent-index='${sentenceIndex}']`);
      // check if the heading has changed
      const heading = currentSentElement[0].getAttribute('data-heading');
      if (this.state.currHeading != heading){
        this.setState({currHeading: heading});
        // play new chapter sound
        const newChapterAudio = new Audio(newChapterSound);
        newChapterAudio.play();
      }
      // check if the new section contains any warnings
      const moving = currentSentElement[0].getAttribute('data-moving');
      if (moving == "true"){
        // play warning sound
        const warningAudio= new Audio(warningSound);
        warningAudio.play();
      }
    }
  }


  updatePlaybackRate = (rate) => {
    this.setState({ playbackRate: rate });
  };

  navigateScript(time) {
    this.script &&  this.script.focus();
    this.jumpVideo(time, true);
    if (!this.playerRef.current.isPlaying()) this.playPauseVideo();
  }



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
    this.setState({ start: 0, videoID: videoID,  });
    this.handleDrawerClose();
  }

  playPauseVideo = () => {
    if (!this.playerRef.current.isPlaying()) {
      this.playerRef.current.play();
      this.props.dispatch(setPlaying(true));
    } else {
      this.playerRef.current.pause();
      this.props.dispatch(setPlaying(false));
    }
  };

  jumpVideo(time, abs = false) {
    if (abs) {
      this.playerRef.current.seekTo(parseInt(time*30));
    } else {
      this.playerRef.current.seekTo(parseInt((this.props.playedSeconds + time)*30));
    }
  }

  getSelected(divs) {
    this.setState({
      selectedDivs: divs,
    });
  }


  render() {
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
              <VideoPlayer ref={this.playerRef}/>
            </Container>
            <Timeline/>
            <Container className="navigation-container">
              <Navigation navigateScript={this.navigateScript} />
            </Container>
          </Container>
          <Container className="script-page">
            <ToolBar
              updatePlaybackRate={this.updatePlaybackRate}
              selectedDivs={this.state.selectedDivs}
              focusScript={this.focusScript}
            ></ToolBar>
            <Scripts
              isScrollIntoViewOn={true}
              setDomEditorRef={this.setDomEditorRef}
              playPauseVideo={this.playPauseVideo}
              jumpVideo={this.jumpVideo}
              getSelected={this.getSelected}
              updateDuration={this.updateDuration}
              checkCurrentSentence={this.checkCurrentSentence}
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

const VideoPlayer = forwardRef((props, playerRef) => {

  const dispatch = useDispatch()

  const durationInFrames = useSelector(state => state.durationInFrames)
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const handlePlay = () => {

      const children = document.querySelectorAll("span.Word");
      setChildren(children);
    };

    if (playerRef.current) playerRef.current.addEventListener("play", handlePlay);

    const intervalId = setInterval(() => {
      // const { current } = this.playerRef;
      // We only want to update time slider if we are not currently seeking
      const currTime = (playerRef.current.getCurrentFrame()/30).toFixed(2);
      dispatch(setPlayedSeconds(currTime));

      // const speech = this.state.speech;
    }, 1000);


    return () => {
      clearInterval(intervalId)
      if (playerRef.current) playerRef.current.removeEventListener("play", handlePlay)
    }
  }, [])

  return <Player
      ref={playerRef}
      style={{ width: "100%", height: "100%" }}
      component={VideoComposition}
      durationInFrames={durationInFrames}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      // controls
      // spaceKeyToPlayOrPause={false}
      inputProps={{children: children}}
      framesPerLambda={4}
  />
})

export default connect()(Home);