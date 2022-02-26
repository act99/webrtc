import React from "react";
import Measure from "react-measure";
import { useCardRatio } from "./useCardRatio";
import { useOffsets } from "./useOffsets";
import { useUserMedia } from "./useUserMedia";

const CAPTURE_OPTIONS = {
  // ** true 로 바꿔야 댐
  audio: false,
  video: true,
  // video: { facingMode: "environment" },
};

const Video = () => {
  const videoRef = React.useRef();
  // ** useUserMedia 라는 훅을 만듬, 미디어 옵션 설정 & 종료 시 자동 kill
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  // ** 카메라 Container 조절
  const [container, setContainer] = React.useState({ height: 0 });
  const [aspectRatio, setAspectRatio] = useCardRatio(1.586); // default card ratio

  // ** Container 대비 Video 크기 조절
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  // ** videoRef 의 current value 를 mediaStream으로 넘겨줌.
  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }
  // ** 재생 handler
  function handleCanPlay() {
    setAspectRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    videoRef.current.play();
  }
  // ** 비디오 사이즈
  function handleResize(contentRect) {
    setContainer({
      height: Math.round(contentRect.bounds.width / aspectRatio),
      width: contentRect.bounds.width,
    });
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <div ref={measureRef} style={{ height: `${container.height}px` }}>
          <video
            ref={videoRef}
            onCanPlay={handleCanPlay}
            style={{ top: `-${offsets.y}px`, left: `-${offsets.x}px` }}
            autoPlay
            playsInline
            // muted
          />
        </div>
      )}
    </Measure>
  );
};

export default Video;
