import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import navigations from '../scripts/ZaQtx54N6iU-navigations.jsx'

export default class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

   


    render() {
        return (
            <div role="navigation" aria-label="Outline" tabindex="0">
                Outline
                <Divider/>
                {navigations["navigations"].map((elem, index) => (
                    <ListItem button id={elem["sent"]} role="menuitem" aria-label={elem["sent"] + " level 1"}>
                    <ListItemText primary={elem["sent"]} />
                    </ListItem>
                ))}
            </div>
        );
    }};