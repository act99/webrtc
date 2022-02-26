import LocalStorage from "./Localstorage";

// ** 소켓통신 시작
const socket = new WebSocket(`wss://52.78.96.234:8080/signal`);
//** */ Stun 으로 서버를 지정할 수 있음
const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
let myPeerConnection;

// ** 서버로 메시지 전송
const sendToServer = (msg) => {
  let msgJSON = JSON.stringify(msg);
  socket.send(msgJSON);
};

//********** 묶음 */
// ** ICE Candidate Event 생성
const handleICECandidateEvent = (event) => {
  if (event.candidate) {
    sendToServer({
      from: LocalStorage.localUserName,
      type: "signal",
      data: event.candidate,
    });
    console.log("handleICECandidateEvent : ICE candidate sent");
  }
};
// ** NegotiationNeededEvent 생성
function handleNegotiationNeededEvent() {
  myPeerConnection
    .createOffer()
    .then(function (offer) {
      return myPeerConnection.setLocalDescription(offer);
    })
    .then(function () {
      sendToServer({
        from: LocalStorage.localUserName,
        type: "signal",
        data: {
          sdp: myPeerConnection.localDescription,
        },
      });
      console.log("handleNegotiationNeededEvent: SDP offer sent");
    })
    .catch(function (reason) {
      // an error occurred, so handle the failure to connect
      console.log("failure to connect error: ", reason);
    });
}
//** PeerConnection 생성
const createPeerConnection = () => {
  myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
};
//********** 묶음 */

// ** 연결 시작
function start() {
  createPeerConnection();
  // getMedia(mediaConstraints);
}

const Socket = {
  socket,
  start,
  sendToServer,
};

export default Socket;
