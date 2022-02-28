import React from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" }, // P2P 연결의 중계서버는 구글에서 무료로 지원하는 Google STUN 서버
  ],
};

// const SOCKET_SERVER_URL = "ws://52.78.96.234:8080/signal";
const SOCKET_SERVER_URL = "wss://goonzu.shop/signal";
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
  const socket = new WebSocket(SOCKET_SERVER_URL);
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
  const mediaConstraints = {
    video: { width: { exact: 640 }, height: { exact: 480 } },
    audio: true,
  };
  //   const getLocalMediaStream = (mediaStream) => {
  //     localStream = mediaStream;
  //     localVideoRef.current.srcObject = mediaStream;
  //   };
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
      .catch(handleGetUserMediaError);
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
    remoteVideoRef.current.srcObject = event.streams[0];
  }

  const createPeerConnection = () => {
    myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
  };

  const handlePeerConnection = (msg) => {
    createPeerConnection();
    getMedia(mediaConstraints);
    if (msg.data === "true") {
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
    remoteVideoRef.current.srcObject = event.streams[0];
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
            localVideoRef.current.srcObject = localStream;
          } catch (error) {
            localVideoRef.current.src = window.URL.createObjectURL(stream);
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

  // ** 시작 피어는 응답을 받고 원격설명으로 설정
  // ** 이를 통해 WebRTC는 성공적인 연결 설정
  // ** 이후, 시그널링 서버 없이 두 피어간 직접 데이터 교환 가능

  function handleAnswerMessage(message) {
    log("The peer has accepted request");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    // myPeerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp)).catch(handleErrorMessage);
    myPeerConnection
      .setRemoteDescription(message.sdp)
      .catch(handleErrorMessage);
  }
  // ** RTCpeerConnection 설정을 위한 후보 인터넷 연결

  function handleNewICECandidateMessage(message) {
    let candidate = new RTCIceCandidate(message.candidate);
    log("Adding received ICE candidate: " + JSON.stringify(candidate));
    myPeerConnection.addIceCandidate(candidate).catch(handleErrorMessage);
  }

  // ** start 함수

  function start() {
    // add an event listener for a message being received
    socket.onmessage = function (msg) {
      let message = JSON.parse(msg.data);
      switch (message.type) {
        case "text":
          log(
            "Text message from " + message.from + " received: " + message.data
          );
          break;

        case "offer":
          log("Signal OFFER received");
          handleOfferMessage(message);
          break;

        /**
         * 그 후 다른 피어가 오퍼를 수신하면 이를 원격 설명으로 설정해야합니다 .
         * 또한 응답을 생성해야 하며 이는 시작 피어로 전송됩니다.
         */
        case "answer":
          log("Signal ANSWER received");
          handleAnswerMessage(message);
          break;

        /**
         * WebRTC는 ICE (Interactive Connection Establishment) 프로토콜을
         * 사용하여 피어를 검색하고 연결을 설정합니다.
         *
         * peerConnection 에 로컬 설명을 설정하면 icecandidate 이벤트가 트리거됩니다 .
         * 이 이벤트는 원격 피어가 원격 후보 세트에 후보를 추가 할 수 있도록 후보를 원격 피어로 전송해야합니다.
         * 이를 위해 onicecandidate 이벤트에 대한 리스너를 만듭니다 .
         */
        case "ice":
          log("Signal ICE Candidate received");
          handleNewICECandidateMessage(message);
          break;

        /**어 에게 보냅니다
         * 서버 측 기술로 send 메소
         * 먼저 오퍼를 생성하고 이를 peerConnection 의 로컬 설명으로 설정합니다 .
         * 그런 다음 제안 을 다른 피드의 로직을 자유롭게 구현할 수 있습니다.
         */
        case "join":
          log(
            "Client is starting to " +
              (message.data === "true)" ? "negotiate" : "wait for a peer")
          );
          handlePeerConnection(message);
          break;

        default:
          handleErrorMessage("Wrong type message received from server");
      }
    };
  }
  // ** start 함수 끝
  // ** stop 함수
  function stop() {
    // send a message to the server to remove this client from the room clients list
    log("Send 'leave' message to server");
    sendToServer({
      from: localUserName,
      type: "leave",
      data: localRoom,
    });

    if (myPeerConnection) {
      log("Close the RTCPeerConnection");

      // disconnect all our event listeners
      myPeerConnection.onicecandidate = null;
      myPeerConnection.ontrack = null;
      myPeerConnection.onnegotiationneeded = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnotificationneeded = null;
      myPeerConnection.onremovetrack = null;

      // Stop the videos
      if (remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }

      remoteVideoRef.current.src = null;
      localVideoRef.current.src = null;

      // close the peer connection
      myPeerConnection.close();
      myPeerConnection = null;

      log("Close the socket");
      if (socket != null) {
        socket.close();
      }
    }
  }
  // ** stop 함수 끝

  React.useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline />
      <button onClick={videoBUttonOn}>비디오 온</button>
      <button onClick={videoButtonOff}>비디오 비디오 오프</button>
      <button onClick={audioButtonOn}>마이크 온</button>
      <button onClick={audioButtonOff}>마이크 오프</button>
      <button onClick={exitButton}>나가기</button>
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};
export default Room2;
