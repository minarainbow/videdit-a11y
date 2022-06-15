import React, {Component} from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from './components/Home'
import {Provider} from "react-redux";
import store from './redux'

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/videdit-a11y/" element={<Home/>}/>
            </Routes>
          </BrowserRouter>
        </Provider>
    );
  }
}

export default App;