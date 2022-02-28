import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import LocalStorage from "./Localstorage";
import Room2 from "./Room2";
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
  }, []);

  return (
    <div>
      <p>방 선택</p>
      <input ref={localRoomRef} />
      <button onClick={onClickHandler}>버튼</button>
      {/* <Room2 /> */}
    </div>
  );
};

export default Home;
