import React, { forwardRef } from "react";
import Measure from "react-measure";
import styled from "styled-components";
import { useCardRatio } from "./useCardRatio";
import { useOffsets } from "./useOffsets";
import { useUserMedia } from "./useUserMedia";

const CAPTURE_OPTIONS = {
  // ** true 로 바꿔야 댐
  audio: true,
  video: true,
  // video: { facingMode: "environment" },
};

const Video = forwardRef((props, ref) => {
  const videoRef = React.useRef();
  // ** useUserMedia 라는 훅을 만듬, 미디어 옵션 설정 & 종료 시 자동 kill
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  // ** 카메라 Container 조절
  const [container, setContainer] = React.useState({ height: 0 });
  const [aspectRatio, setAspectRatio] = useCardRatio(1.586); // default card ratio

  // ** videoRef 의 current value 를 mediaStream으로 넘겨줌.
  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }
  // ** 재생 handler
  function handleCanPlay() {
    setAspectRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    videoRef.current.play();
  }

  return (
    <div>
      <VideoWrap
        ref={videoRef}
        onCanPlay={handleCanPlay}
        autoPlay
        playsInline
        // muted
      />
      <button>Start</button>
      <button>Call</button>
      <button>Hang Up</button>
    </div>
  );
});

const VideoWrap = styled.video`
  width: 240px;
  height: 160px;
`;

export default Video;
