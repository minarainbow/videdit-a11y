import React from "react";
import Popup from "reactjs-popup";
import IconButton from '@material-ui/core/IconButton'
import { Button, Header, Image, Modal, ModalActions, Input } from 'semantic-ui-react'
import firebase from 'firebase/app';
import 'firebase/database';
import scriptData from "../scripts/ZaQtx54N6iU-aligned-sents";

const databaseURL = "https://videdita11y-default-rtdb.firebaseio.com/"

export default class Instruction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          first: true,
          feature: false,
          name: ''
        };
        this.setOpen = this.setOpen.bind(this)
        this.changeMode = this.changeMode.bind(this)
      }

      componentDidMount() {
        this.changeMode('first')
      }

      
      handleChange(event) {
        this.setState({input: event.target.value});
      }
    
      handleSubmit(event, close) {
        
        return false;
      }

      setOpen(bool) {
        this.setState({open: bool})
      } 

      createSessionID(name) {
        if (sessionStorage.getItem('sessionCreated') === null) {
          const startTime = new Date();
          const newSession = {startTime: startTime, sessionName: name};
          return fetch( `${databaseURL+'/sessions/'}/.json`, {
              method: 'POST',
              body: JSON.stringify(newSession)
          }).then(res => {
              if (res.status !== 200) {
                  throw new Error(res.statusText);
              }
              return res.json();
          }).then(res => {
              //console.log(res.name);
              //console.log("Session created: ", newSession);
              sessionStorage.setItem('sessionID', res.name);
              sessionStorage.setItem('sessionCreated', true);
              sessionStorage.setItem('sessionName', name);
          })
        }
      }

      setInitialScript() {
          return fetch(`${databaseURL+'/sessions/'+ sessionStorage.getItem('sessionID') +'/scriptdata/'}/.json`, {
            method: 'PATCH',
            body: JSON.stringify(scriptData)
        }).then(res => {
            if (res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(() => {
            //console.log("Dummy data succesfully sent!")
        })
      }
      

      changeMode = (inp) => {
        // First page to second page 
        if (inp === 0) {
          this.setState({first: false, second: true})
        }

        // Second page to third page
        if (inp === 1) {
          this.setState({second: false, first: true})
        }
        if (inp === 2) {
          this.setState({second: false, third: true})
        }
        if (inp === 3) {
          this.setState({third: false, second: true})
        }
        if (inp === 4) {
          this.setState({third: false, fourth: true})
        }
        if (inp === 5) {
          this.setState({fourth: false, third: true})
        }
        if (inp === 6) {
          this.setState({fourth: false})
          this.createSessionID(this.state.name);
          this.setInitialScript();
        }
          
      }



    render() {
        const { propsOpen, selectRole, closeModal } = this.props;
        const { open, first, second, third, fourth,  } = this.state;
        const { setOpen, changeMode } = this;
        return (
          <>
          
          <Modal
            open={first}
          >
            <Modal.Header>Introduction</Modal.Header>
            <Modal.Content image>
              <Modal.Description>
                <span style={{lineHeight: '1.8', fontSize: '17px'}}>
                  Welcome! <br/>
                  This is a system to support <b>accessible video editing</b> with transcript-based video editor.<br/> <br/>
                  Our main features include <b>(1) structured script for quick navigation </b> and <b>(2) system suggestions for quick review.</b> <br/>
                  Details will be explained on the next page. <br/>
                </span>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button
                onClick={() => changeMode(0)}
                labelPosition='right'
                icon='arrow right'
                content='Begin Feature Description'
              />
            </Modal.Actions>
          </Modal>

          <Modal
            open={second}
          >
            <Modal.Header>Main Features 1/3</Modal.Header>
            <Modal.Content image>
              <Modal.Description>
                <span style={{lineHeight: '1.8', fontSize: '17px'}}>
                First please click anywhere on the script so that the cursor focus is set to the page. <br/><br/>
                You can hit <b>Space</b> key to play and pause the video. <br/>
                As the video is being played, current progress is highlighted in the script page. <br/><br/>
                You can hit <b>Left</b> and <b>Right</b> arrow key to skip to previous and next sentences. <br/>
                If you want to delete a sentence, you can press <b>Backspace</b> key and the system will remove the current sentence.<br/>

                </span>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button 
                floated='left'
                onClick={() => changeMode(1)}
                labelPosition='left'
                icon='arrow left'
                content='Back'
              />
              <Button
                onClick={() => changeMode(2)}
                labelPosition='right'
                icon='arrow right'
                content='Next'
              />
            </Modal.Actions>
          </Modal>
          
          <Modal
            open={third}
          >
            <Modal.Header>Main Features 2/3</Modal.Header>
            <Modal.Content image>
              <Modal.Description>
              <span style={{lineHeight: '1.8', fontSize: '17px'}}>
                The script is divided into <b>Headings</b> each of which represents a visually distinguishable scene. <br/>
                The title of each heading shows the salient objects detected during the scene. <br/><br/>

                There are two types of unit in the script. <b>Narration</b> unit which consists of text phrases or sentences, <br/>
                or <b>Pause</b> unit shown with its duration.<br/><br/>

                Our system give suggestions on <b>Review points</b> of the video such as camera moving, or a long pause. <br/>
                Those footages are highlighted as orange color in the script. <br/>
                You can also check the number of review points in each heading content with comment icon next to the title.

                </span>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
            <Button 
                floated='left'
                onClick={() => changeMode(3)}
                labelPosition='left'
                icon='arrow left'
                content='Back'
              />
              <Button
                onClick={() => changeMode(4)}
                labelPosition='right'
                icon='arrow right'
                content='Next'
              />
            </Modal.Actions>
          </Modal>
          
          <Modal
            open={fourth}
          >
            <Modal.Header>Main Features 3/3</Modal.Header>
            <Modal.Content image>
              <Modal.Description>
              <span style={{lineHeight: '1.8', fontSize: '17px'}}>
                You can apply effects to the current unit of the script by clicking icons in the toolbar. <br/>
                For example, you can click <b>Speed</b> button and change the speed of a unit. <br/>
                Or you can click <b>Trim</b> button and adjust the start and end of a unit.
                </span>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
            <Button 
                floated='left'
                onClick={() => changeMode(5)}
                labelPosition='left'
                icon='arrow left'
                content='Back'
              />
              <Input type="text" placeholder="Enter your name here" onChange={(e) => this.setState({name: e.target.value})}/>
              <Button
                onClick={() => changeMode(6)}
                labelPosition='right'
                icon='arrow right'
                content='End'
              />
            </Modal.Actions>
          </Modal>
                  </>
        )
    }};