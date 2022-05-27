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

        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = (time) => {
        this.props.navigateScript(time);
    }



    render() {
        return (
            <div role="navigation" aria-label="Outline" >
                <Typography variant="h6">OUTLINE</Typography>
                <Divider/>
                {navigations["navigations"].map((elem, index) => (
                    elem["new_heading"]?
                    <ListItem button id={elem["new_heading"]} role="menuitem" aria-disabled="false" aria-label={elem["new_heading"] + " level 1"}
                        onClick={() => this.handleClick(elem["start"])} >
                    <ListItemText primary={<Typography variant="h6">{formatTime(elem["start"]) + " " + elem["new_heading"]}</Typography>} />
                    </ListItem>
                    :
                    <ListItem button id={elem["sent"]} role="menuitem"  aria-disabled="false" aria-label={elem["sent"] + " level 2"}
                        onClick={() => this.handleClick(elem["start"])} >
                    <ListItemText primary={<Typography variant="h6" style={{paddingLeft: '20px', color: "grey"}}>{elem["sent"]}</Typography>} />
                    </ListItem>
                ))}
            </div>
        );
    }};