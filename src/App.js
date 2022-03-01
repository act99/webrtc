import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { Route } from "react-router-dom";
import Home from "./test/Home";
import Room from "./test/Room";
import { BrowserRouter } from "react-router-dom";
import Chat from "./test/Chat";
import Login from "./test/Login";
function App() {
  return (
    <>
      <BrowserRouter>
        <Route path="/" exact component={Home} />
        <Route path="/room/:roomId/user/:uuid" exact component={Room} />
        <Route path="/chat" exact component={Chat} />
        <Route path="/login" exact component={Login} />
      </BrowserRouter>
    </>
  );
}

export default App;
