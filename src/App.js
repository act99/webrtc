import logo from "./logo.svg";
import "./App.css";
import Video from "./test/Video";
import React from "react";
import styled from "styled-components";

function App() {
  return (
    <div className="App">
      <Video />
      <Video />
    </div>
  );
}

const VideoWrap = styled.div`
  width: 500px;
  height: 500px;
`;

export default App;
