import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import LocalStorage from "./Localstorage";
import Socket from "./Socket";
import { startLocalUuid } from "./startLocalUuid";

const Home = () => {
  const history = useHistory();
  // ** 비디오 설정
  const localRoomRef = React.useRef();

  const onClickHandler = (event) => {
    console.log("onClick");
    event.preventDefault();
    console.log(LocalStorage.localUserName);
    history.push(
      `/room/${localRoomRef.current.value}/user/${LocalStorage.localUserName}`
    );
  };

  React.useEffect(() => {
    startLocalUuid();
    // Socket.socket.onopen = function () {
    //   console.log("웹소켓이 연결되었습니다.");
    //   Socket.sendToServer({
    //     from: LocalStorage.localUserName,
    //     type: "join",
    //     data: localRoomRef.current.value,
    //   });
    // };
    // Socket.start();
    // return (Socket.socket.onclose = function (message) {
    //   console.log("소켓종료");
    //   Socket.stop();
    // });
  }, []);

  return (
    <div>
      <p>방 선택</p>
      <input ref={localRoomRef} />
      <button onClick={onClickHandler}>버튼</button>
    </div>
  );
};

export default Home;
