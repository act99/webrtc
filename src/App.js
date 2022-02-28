import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { Route } from "react-router-dom";
import Home from "./test/Home";
import Room2 from "./test/Room2";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Route path="/" exact component={Home} />
        <Route path="/room/:roomId/user/:uuid" exact component={Room2} />
      </BrowserRouter>
    </>
  );
}

export default App;
