import React from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import styled from "styled-components";
import Video from "./Video";

const Room = () => {
  const params = useParams();
  const localRoom = params.roomId;
  console.log(params);
  // ** 비디오 ref
  // const MockUser = [1, 2, 3, 4, 5];
  // const videosRef = React.useRef([]);
  const localRef = React.useRef(null);
  const remoteRef = React.useRef(null);
  // ** 로컬스토리지에 저장된 uuid 가져오기
  const localUserName = localStorage.getItem("uuid");
  const socket = new WebSocket(`ws://52.78.96.234:8080/signal`);

  // ** 서버로부터 메시지 보내기
  const sendToServer = (msg) => {
    let msgJSON = JSON.stringify(msg);
    socket.send(msgJSON);
  };
  // ** 에러메시지 처리
  const handleErrorMessage = (message) => {
    console.log(message);
  };

  // ** WebRTC STUN servers
  // ** STUN 서버는 두 클라이언트 모두 IP 주소를 결정하는 데 사용됩니다.
  //** rtc 중계가 끊어질 것을 대비한 임시 서버버 * @type {{iceServers: [{urls: string}, {urls: string}]}}

  const peerConnectionConfig = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
      // ** P2P 연결의 중계서버는 구글에서 무료로 지원하는 Google STUN 서버
    ],
  };

  //**  WebRTC variables
  let localStream;
  let localVideoTracks;
  let myPeerConnection;

  // ** 원격 동영상 제어
  function handleTrackEvent(event) {
    console.log("Track Event: set stream to remote video element");
    remoteRef.current.srcObject = event.streams[0];
  }

  //** RTCSessionDescription => 세션의 매개 변수를 나타냄
  //** 각 RTCSessionDescription은 세션의 SDP 기술자 (descriptor)의 기술 제안
  //** 응답 협상 과정의 일부를 나타내는 설명으로 type으로 구성됨.
  //** Client2 가 Client1 SDP를 가지고 setRemoteDescription() 을 호출
  //** Client1 은 Client2의 설정을 알게 됨

  const handleOfferMessage = (message) => {
    console.log("Offer 메시지 허가");
    console.log(message);
    let desc = new RTCSessionDescription(message.sdp);
    // ** 시작
    if (desc != null && message.sdp !== null) {
      console.log(`RTC 시그널링 상태 : ${myPeerConnection.signalingState}`);
      myPeerConnection
        .setRemoteDescription(desc)
        .then(function (stream) {
          console.log("로컬 비디오 스트리밍 ㄱㄱ");
          localStream = stream;
          try {
            localRef.current.srcObject = localStream;
          } catch (error) {
            localRef.current.src = window.URL.createObjectURL(stream);
          }
          console.log("----- RTCPeerConnection 으로 스트리밍 추가");
          localStream
            .getTracks()
            .forEach((track) => myPeerConnection.addTrack(track, localStream));
        })
        .then(function () {
          console.log("-------- 응답 생성");
          return myPeerConnection.createAnswer();
        })
        .then(function (answer) {
          console.log("----- 응답 생성 후 로컬 description 세팅");
          return myPeerConnection.setLocalDescription(answer);
        })
        .then(function () {
          //** Client2 는 시그널링 메커니즘을 사용하여 자신의 문자열화된 응답을 Client1 에게 다시 전송합니다.
          console.log("다른 peer에게 응답 주기");
          sendToServer({
            from: localUserName,
            type: "answer",
            sdp: myPeerConnection.localDescription,
          });
        })
        .catch(handleErrorMessage);
    }
  };

  // ** 시작 피어는 응답을 받고 원격설명으로 설정
  // ** 이를 통해 WebRTC는 성공적인 연결을 설정합니다.
  // ** 이제 시그널링 서버 없이 두 피어간에 직접 데이터를 주고 받을 수 있다.

  // ** Client1은 setRemoteDescription() 을 사용하여 Client2의 응답을 원격 세션 기술(Description)으로 설정

  const handleAnswerMessage = (message) => {
    console.log("Peer 가 request를 받음");

    // ** 우리의 비디오 대답 메시지 안 SDP 페이로드값인 remote description이 configure 됨
    myPeerConnection
      .setRemoteDescription(message.sdp)
      .catch(handleErrorMessage);
  };

  // ** RTCIceCandidate
  // ** RTCPeerConnection 설정을 위한 후보 인터넷 연결 설정
  // ** ICE; internet connectivity establishment 서버를 나타냄.
  // ** 다른 피어가 보낸 ICE 후보를 처리해야 함.
  // ** 이 후보를 수신한 원격 피어는 후보를 후보 풀에 추가해야 함

  const handleNewIceCandidateMessage = (message) => {
    let candidate = new RTCIceCandidate(message.candidate);
    console.log("새로운 ICE Candidate 받음 => " + JSON.stringify(candidate));
    myPeerConnection.addIceCandidate(candidate).catch(handleErrorMessage);
  };

  // ** Peer Connection 생성
  const createPeerConnection = () => {
    myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
  };

  // ** Peer Connection 컨트롤러 생성
  const handlePeerConnection = (message) => {
    createPeerConnection();
    if (message.data === "true") {
      myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    }
  };

  // ** 핵심 function
  // ** WebRTC 연결을 설정하는 다음 단계는 ICE (Interactive Connection Establishment) 및 SDP 프로토콜을 포함하며, 여기서 피어의 세션 설명이 두 피어에서 교환되고 수락

  const start = () => {
    socket.onmessage = function (msg) {
      let message = JSON.parse(msg.data);
      switch (message.type) {
        case "text":
          console.log(`${message.from} 에서 온 메시지 => ${message.data}`);
          break;
        case "offer":
          console.log("Offer 신호를 받았습니다.");
          handleOfferMessage(message);
          break;
        //** 그 후 다른 피어가 오퍼를 수신하면 이를 원격 설명으로 설정해야 함.
        //** 또한 응답을 생성해야하며, 이는 시작 피어로 전송됨.
        case "answer":
          console.log("시그널 대답을 받았습니다.");
          handleAnswerMessage(message);
          break;
        // ** WebRTC 는 ICE 프로토콜을 사용하여 피어를 검색하고 연결을 설정
        // ** 이 이벤트는 원격 피어가 원격 후보 세트에 후보를 추가할 수 있도록 후보를 원격 피어로 전송해야 함.
        // ** 이를 위해 onicecandidate 이벤트에 대한 리스너를 만들어야 함.
        case "ice":
          console.log("ICE Candidate 신호를 받음");
          handleNewIceCandidateMessage(message);
          break;
        case "join":
          console.log(
            "Client is starting to " +
              (message.data === "true)" ? "negotiate" : "wait for a peer")
          );
          handlePeerConnection(message);
          break;
        default:
          handleErrorMessage("서버로부터 잘못된 타입의 메세지를 받음");
      }
    };
  };

  const stop = () => {
    console.log("서버로부터 떠났다는 메시지 보내기");
    sendToServer({
      from: localUserName,
      type: "leave",
      data: localRoom,
    });
    if (myPeerConnection) {
      console.log("RTCPeerConnection 종료");
      // ** 모든 이벤트리스너 종료
      myPeerConnection.onicecandidate = null;
      myPeerConnection.ontrack = null;
      myPeerConnection.onnegotiationneeded = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnotificationneeded = null;
      myPeerConnection.onremovetrack = null;
      // ** 비디오 멈추기
      if (remoteRef.current.srcObject) {
        remoteRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (localRef.current.srcObject) {
        localRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      remoteRef.current.src = null;
      localRef.current.src = null;

      // ** peer connection 종료
      myPeerConnection.close();
      myPeerConnection = null;

      console.log("소켓종료");
      if (socket != null) {
        socket.close();
      }
    }
  };

  const handleICECandidateEvent = (event) => {
    if (event.candidate) {
      sendToServer({
        from: localUserName,
        type: "ice",
        candidate: event.candidate,
      });
      console.log("ICE Candidate Event: ICE candidate sent");
    }
  };

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
        console.log("Negotiation Needed Event: SDP offer sent");
      })
      .catch(function (reason) {
        // an error occurred, so handle the failure to connect
        handleErrorMessage("failure to connect error: ", reason);
      });
  }

  React.useEffect(async () => {
    socket.onopen = function async() {
      console.log("웹소켓 연결 => 방 : " + localRoom);
      sendToServer({
        from: localUserName,
        type: "join",
        data: localRoom,
      });
    };
    start();
    return () =>
      (socket.onclose = function (message) {
        console.log("소켓종료");
        stop();
      });
  }, []);

  return (
    <div className="App">
      <Video ref={localRef} />
      <Video ref={remoteRef} />
      {/* {MockUser.map((item, index) => {
        return (
          <Video ref={(el) => (videosRef.current[index] = el)} key={item} />
        );
      })} */}
    </div>
  );
};

export default Room;
