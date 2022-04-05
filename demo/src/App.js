import React, { Component } from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Home from './components/Home'



class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    
    return (
      <BrowserRouter>
      <Routes>
        <Route path="/videdit-a11y/" element={<Home/>} />
      </Routes>
    </BrowserRouter>
    );
  }
}

export default App;
