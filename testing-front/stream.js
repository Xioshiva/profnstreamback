var socket =  io.connect("http://localhost:9001");
const video = document.querySelector("#video");
const enableAudioButton = document.querySelector("#enable-audio");
var vidSource = null;





let peerConnection;
const config = {
    iceServers: [
        { 
            "urls": "stun:stun.l.google.com:19302",
        },
        // { 
            //   "urls": "turn:TURN_IP?transport=tcp",
            //   "username": "TURN_USERNAME",
            //   "credential": "TURN_CREDENTIALS"
            // }
        ]
    };
    
    
    //enableAudioButton.addEventListener("click", enableAudio)
    //document.querySelector("#connect").addEventListener("click", test)
    
    socket.on("stream", (id, description) => {
      video.src = "data:video/webm;base64,  " + btoa(id)
      video.load();
      video.play();
     });
    
    socket.on("candidate", (id, candidate) => {
        peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    });
    
    socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}




