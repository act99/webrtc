import React from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" }, // P2P 연결의 중계서버는 구글에서 무료로 지원하는 Google STUN 서버
  ],
};

const SOCKET_SERVER_URL = "http://52.78.96.234:8080/signal";

const gvgaConstraints = {
  video: { width: { exact: 320 }, height: { exact: 240 } },
  audio: true,
};
const vgaConstraints = {
  video: { width: { exact: 640 }, height: { exact: 480 } },
  audio: true,
};
const hdConstraints = {
  video: { width: { exact: 1280 }, height: { exact: 720 } },
  audio: true,
};

const Room2 = () => {
  const params = useParams();
  const localUserName = localStorage.getItem("uuid");
  const localRoom = params.roomId;

  // ** pc => PeerConnection
  let myPeerConnection;
  let localStream;
  let localVideoTracks;
  //   const [socket, setSocket] = React.useState();
  let localVideoRef = React.useRef(null);
  let remoteVideoRef = React.useRef(null);

  // ** getMedia
  const getLocalMediaStream = (mediaStream) => {
    localStream = mediaStream;
    localVideoRef.current.srcObject = mediaStream;
  };
  const handleLocalMediaStreamError = (error) => {
    console.log("getUserMedia 에러", error);
  };
  const getMedia = (constraints) => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(getLocalMediaStream)
      .catch(handleLocalMediaStreamError);
  };

  // ** 버튼 시작 onClick Listener
  const videoButtonOff = () => {
    localVideoTracks = localStream.getVideoTracks();
    localVideoTracks.forEach((track) => localStream.removeTrack(track));
    localVideoRef.current.display = "none";
    console.log("video off");
  };
  const videoBUttonOn = () => {
    localVideoTracks.forEach((track) => localStream.addTrack(track));
    localVideoRef.current.display = "inline";
    console.log("video on");
  };
  const audioButtonOff = () => {
    localVideoRef.current.muted = true;
    console.log("Audio off");
  };
  const audioButtonOn = () => {
    localVideoRef.current.muted = false;
    console.log("Audio On");
  };
  const exitButton = () => {
    stop();
  };
  // ** 버튼 완료

  // ** 기타기능 => log, error, sendToServer
  const log = (msg) => {
    console.log(msg);
  };
  const handleErrorMessage = (msg) => {
    console.error(msg);
  };
  const sendToServer = (msg) => {
    let msgJSON = JSON.stringify(msg);
    socket.send(msgJSON);
  };
  // ** 기타기능 끝

  // ** peer connection 생성, seconde participant가 나타나면  get media, start negotiating
  // 로컬 컴퓨터와 원격 피어 간의 WebRTC 연결
  function handleICECandidateEvent(event) {
    if (event.candidate) {
      sendToServer({
        from: localUserName,
        type: "ice",
        candidate: event.candidate,
      });
      log("ICE Candidate Event: ICE candidate sent");
    }
  }

  function handleTrackEvent(event) {
    log("Track Event: set stream to remote video element");
    remoteVideo.current.srcObject = event.streams[0];
  }

  const createPeerConnection = () => {
    myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
  };

  const handlePeerConnection = (msg) => {
    createPeerConnection();
    getMedia(mediaConstraints);
    if (message.data === "true") {
      myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    }
  };
  // ** peer connection 끝

  // ** 카메라/마이크 데이터 스트림 접근
  // 로컬 비디오 요소를 미디어 스트림에 추가하고 peer로 보냄
  const getLocalMediaStream = (mediaStream) => {
    localStream = mediaStream;
    localVideoRef.current.srcObject = mediaStream;
    localStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, localStream));
  };
  const handleGetUserMediaError = (error) => {
    log("navigator.getUserMedia error: ", error);
    switch (error.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + error.message);
        break;
    }

    stop();
  };

  // ** 카메라/마이크 데이터 스트림 접근 끝

  // ** ICE Candidate를 서버를 통해 peer에게 보냄
  function handleICECandidateEvent(event) {
    if (event.candidate) {
      sendToServer({
        from: localUserName,
        type: "ice",
        candidate: event.candidate,
      });
      log("ICE Candidate Event: ICE candidate sent");
    }
  }
  function handleTrackEvent(event) {
    log("Track Event: set stream to remote video element");
    remoteVideo.current.srcObject = event.streams[0];
  }
  // ** ICE Candidate를 서버를 통해 peer에게 보냄 끝

  // ** Client1이 시그널링 서버를 호출 = createOffer 를 통해 SDP 생성, SDP와 함께 setLocalDescription 호출

  function handleNegotiationNeededEvent() {
    myPeerConnection
      .createOffer()
      .then(function (offer) {
        return myPeerConnection.setLocalDescription(offer);
      })
      .then(function () {
        sendToServer({
          from: localUserName,
          type: "offer",
          sdp: myPeerConnection.localDescription,
        });
        log("Negotiation Needed Event: SDP offer sent");
      })
      .catch(function (reason) {
        // an error occurred, so handle the failure to connect
        handleErrorMessage("failure to connect error: ", reason);
      });
  }

  // ** 끝

  // ** 시작

  /**
   * RTCSessionDescription
   * 세션의 매개 변수를 나타냅니다.
   * 각 RTCSessionDescription는 세션의  SDP 기술자(descriptor)의 기술 제안
   * / 응답 협상 과정의 일부를 나타내는 설명  type으로 구성되어 있습니다.
   *
   * Client2 가 Client1의 SDP를 가지고 setRemoteDescription()를 호출
   * -> Client1은 Client2의 설정을 알게된다.
   */
  function handleOfferMessage(message) {
    log("Accepting Offer Message");
    log(message);
    let desc = new RTCSessionDescription(message.sdp);
    //TODO test this
    if (desc != null && message.sdp != null) {
      log("RTC Signalling state: " + myPeerConnection.signalingState);
      myPeerConnection
        .setRemoteDescription(desc)
        .then(function () {
          log("Set up local media stream");
          return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
        .then(function (stream) {
          log("-- Local video stream obtained");
          localStream = stream;
          try {
            localVideo.current.srcObject = localStream;
          } catch (error) {
            localVideo.current.src = window.URL.createObjectURL(stream);
          }

          log("-- Adding stream to the RTCPeerConnection");
          localStream
            .getTracks()
            .forEach((track) => myPeerConnection.addTrack(track, localStream));
        })
        .then(function () {
          /**
           * Client2는 응답을 인자로 전달하는 성공 콜백 함수 createAnswer()를 호출
           */
          log("-- Creating answer");
          // Now that we've successfully set the remote description, we need to
          // start our stream up locally then create an SDP answer. This SDP
          // data describes the local end of our call, including the codec
          // information, options agreed upon, and so forth.
          return myPeerConnection.createAnswer();
        })
        .then(function (answer) {
          /**
           * Client2는 setLocalDescription()의 호출을 통해
           * Client2의 응답을 로컬 기술(Description)으로 설정합니다.
           */
          log("-- Setting local description after creating answer");
          // We now have our answer, so establish that as the local description.
          // This actually configures our end of the call to match the settings
          // specified in the SDP.
          return myPeerConnection.setLocalDescription(answer);
        })
        .then(function () {
          /**
           * Client2는 시그널링 메커니즘을 사용하여 자신의 문자열화된 응답을 Client1에게 다시 전송합니다.
           */
          log("Sending answer packet back to other peer");
          sendToServer({
            from: localUserName,
            type: "answer",
            sdp: myPeerConnection.localDescription,
          });
        })
        // .catch(handleGetUserMediaError);
        .catch(handleErrorMessage);
    }
  }

  // ** 끝

  let newPC = new RTCPeerConnection(pc_config);

  const setVideoTracks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (!(pcRef.current && socketRef.current)) {
        return;
      }
      stream.getTracks().forEach((track) => {
        if (!pcRef.current) {
          return;
        }
        pcRef.current.addTrack(track, stream);
      });
      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) {
            return;
          }
          console.log("ON ICE CANDIDATE");
          socketRef.current.emit("ice", {
            candidate: e.candidate,
            from: localUserName,
          });
        }
      };
      pcRef.current.oniceconnectionstatechange = (e) => {
        console.log(e);
      };
      pcRef.current.ontrack = (ev) => {
        console.log("add remoteTrack success");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = ev.stream[0];
        }
      };
      socketRef.current.emit("join", {
        from: localUserName,
        data: localRoom,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const createAnswer = async (sdp) => {
    if (!(pcRef.current && socketRef.current)) {
      return;
    }
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("answer set remote desccription success");
      const mySdp = await pcRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      console.log("create answer");
      await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socketRef.current.emit("answer", { from: localUserName, sdp: mySdp });
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    console.log("create offer");
    newPC
      .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
      .then((sdp) => {
        newPC.setLocalDescription(new RTCSessionDescription(sdp));
        socketRef.current.emit("offer", { from: localUserName, sdp: sdp });
      })
      .catch((error) => console.log(error));
  };

  //   newSocket.on("offer", (sdp) => {
  //     console.log("get offer");
  //     createAnswer(sdp);
  //   });
  //   newSocket.on("answer", (sdp) => {
  //     console.log("get answer");
  //     newPC.setRemoteDescription(new RTCSessionDescription(sdp));
  //   });
  //   newSocket.on("ice", (candidate) => {
  //     newPC.addIceCandidate(new RTCIceCandidate(candidate)).then((res) => {
  //       console.log("ICE candidate add success");
  //     });
  //   });

  React.useEffect(() => {
    socketRef.current = io.connect(SOCKET_SERVER_URL, {
      transports: ["websocket"],
    });
    // pcRef.current = new RTCPeerConnection(pc_config);
    // socketRef.current.on("join", () => {
    //   console.log("join / get offer");
    //   createOffer();
    // });
    // socketRef.current("offer", (sdp) => {
    //   console.log("get offer, create Answer");
    //   createAnswer(sdp);
    // });
    // socketRef.current.on("answer", (sdp) => {
    //   console.log("get answer / remoteDescription");
    //   if (!pcRef.current) {
    //     return;
    //   }
    //   pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    // });
    // socketRef.current.on("ice", async (candidate) => {
    //   if (!pcRef.current) {
    //     return;
    //   }
    //   await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    //   console.log("candidate add suceess");
    // });
    // setVideoTracks();
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //   }
    //   if (pcRef.current) {
    //     pcRef.current.close();
    //   }
    // };
  }, []);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </div>
  );
};

export default Room2;
