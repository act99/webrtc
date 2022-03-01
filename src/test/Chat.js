import React from "react";
import styled from "styled-components";

const Chat = () => {
  const inputRef = React.useRef();
  const createRoom = () => {};

  React.useEffect(() => {
    return () => {};
  }, []);

  return (
    <ChatWrap>
      {/* <div>
        <div>
          <h3>채팅방 리스트</h3>
        </div>
        <div>
          <div>
            <label>방제목</label>
          </div>
          <input ref={inputRef} />
          <h3>{inputRef.current}</h3>
        </div>
      </div> */}
    </ChatWrap>
  );
};

const ChatWrap = styled.div`
  width: 500px;
  height: 900px;
  background-color: aliceblue;
`;

export default Chat;
