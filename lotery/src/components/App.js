import React, { Component } from 'react';
import './App.css';
import {Container} from 'semantic-ui-react';
import Header from './Header';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import 'semantic-ui-css/semantic.min.css';
import Tokens from './Tokens';
import Lotery from './Lotery';
import Awards from './Awards';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <Container>
      &nbsp;
      &nbsp;
      &nbsp;
        <Header />
          <main>
            <Routes>
              <Route path="/" element={<Tokens/>}/>
              <Route path="/lotery" element={<Lotery/>}/>
              <Route path="/awards" element={<Awards/>}/>
            </Routes>
          </main>
      </Container>
      </BrowserRouter>
    );
  }
}

export default App;
