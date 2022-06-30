import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import navigations from '../scripts/ZaQtx54N6iU-navigations.jsx'
import "../App.css";
import { Typography } from '@mui/material';
import ReactDOM from 'react-dom';

function formatTime(time) {
    time = Math.round(time);
  
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

export default class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0,
            navigations: []
        };
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        ReactDOM.findDOMNode(this).addEventListener("keydown", this.onKeyDown.bind(this));
        this.setState({navigations: Array.from(document.querySelectorAll(".level1"))})
    }
  
    componentWillUnmount() {
        ReactDOM.findDOMNode(this).removeEventListener("keydown", this.onKeyDown.bind(this));
    }      
    
    onKeyDown(e) {
        switch (e.code) {
            case "ArrowDown":
                e.preventDefault();
                if (this.state.currentIndex === this.state.navigations.length-1){
                    this.setState({currentIndex: 0})
                }
                else{
                    this.setState((prevState, props) => ({
                        currentIndex: prevState.currentIndex + 1
                    })); 
                }
                this.state.navigations[this.state.currentIndex].focus();
                break;

            case "ArrowUp":
                e.preventDefault();
                if (!this.state.currentIndex){
                    this.setState({currentIndex: this.state.navigations.length-1})
                }
                else{
                    this.setState((prevState, props) => ({
                        currentIndex: prevState.currentIndex - 1
                    })); 
                }
                this.state.navigations[this.state.currentIndex].focus();
                break;
        }
    }


    handleClick = (time) => {
        this.props.navigateScript(time);
    }



    render() {
        return (
            <div tabindex="0" aria-label="Outline" aria-controls="menu">
                <Typography role="menu" id="menu" aria-label="outline" variant="h6" >OUTLINE</Typography>
                <Divider/>
                {navigations["navigations"].map((elem, index) => (
                    elem["new_heading"]?
                    <ListItem class="level1" button tabindex={this.state.currentIndex===index? 0 : -1} id={elem["new_heading"]} key={elem["new_heading"]} role="menuitem" aria-disabled="false" aria-label={elem["new_heading"] + " level 1"}
                        onClick={() => this.handleClick(elem["start"])} >
                    <ListItemText primary={<Typography variant="h6">{formatTime(elem["start"]) + " " + elem["new_heading"]}</Typography>} />
                    </ListItem>
                    :
                    <ListItem class="level1" button tabindex={this.state.currentIndex===index? 0 : -1} id={elem["sent"]} key={elem["sent"]+index} role="menuitem"  aria-disabled="false" aria-label={elem["sent"] + " level 2"}
                        onClick={() => this.handleClick(elem["start"])} >
                    <ListItemText primary={<Typography variant="h6" style={{paddingLeft: '20px', color: "grey"}}>{elem["sent"]}</Typography>} />
                    </ListItem>
                ))}
            </div>
        );
    }};