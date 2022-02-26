import React from "react";

const Video = () => {
  // ** 비디오 ref
  const localVideo = React.useRef(null);
  // ** 비디오 출력 시 오디오 비디오 true
  const mediaStreamConstraints = {
    video: true,
  };

  // ** 로컬 스티림 비디오 재생성
  let localStream;

  //** 미디어 스트림이 성공했을 때 비디오 element
  function gotLocalMediaStream(mediaStream) {
    localStream = mediaStream;
    localVideo.current.srcObject = mediaStream;
  }
  // ** 미디어 스트림 에러
  function handleLocalMediaStreamError(error) {
    console.log("navigator.getUserMedia error: ", error);
  }
  function gotLocalMediaStream(mediaStream) {
    localStream = mediaStream;
    localVideo.current.srcObject = mediaStream;
  }

  // ** 미디어 스트림 초기화
  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then(gotLocalMediaStream)
      .catch(handleLocalMediaStreamError);
  }, []);

  return (
    <div>
      <h1>Realtime communication with WebRTC</h1>
      <video autoPlay playsInline ref={localVideo}></video>
    </div>
  );
};

export default Video;
