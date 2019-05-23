import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import HarmonyPage from './pages/HarmonyPage'
import SessionPage from './pages/SessionPage'
import UploadPage from './pages/UploadPage'

import './App.css'
import onigiri_icon from './img/onigiri_icon.png'

class App extends Component {
  render() {
    return (
        <Router>
            <div className="App">
              <header>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />

                <div className="title-container">
                    <p>
                      <img
                        className="app-icon"
                        src={onigiri_icon}
                        alt={"o"}
                      />
                    </p>
                    <div style={{marginLeft: 10}}>
                      <p>Onigiri</p>
                    </div>
                </div>
              </header>

              <Route
                path="/home"
                component={SessionPage}
              />
              <Route
                path="/upload"
                component={UploadPage}
              />

              <Route
                path="/harmony/:handle"
                component={HarmonyPage}
              />
            </div>
        </Router>
    );
  }
}

export default App;
