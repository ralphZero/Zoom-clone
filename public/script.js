const socket = io();
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});
let videoStream;
const grid = document.getElementById('video-grid');
const videoElement = document.createElement('video');
videoElement.muted = true;

// get media access from browser
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    videoStream = stream;
    addVideoStream(videoElement, stream);

    // call listener - when answered
    peer.on('call', function(call) {
        call.answer(stream); // Answer the call with an A/V stream.
        const newVideoElement = document.createElement('video');
        call.on('stream', function(remoteStream) {
            addVideoStream(newVideoElement, remoteStream);
        });

        call.on('close', () => {
            socket.emit('user-left');
        });
    });
    
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
});

// open peer connection as we enter room
peer.on('open', (id) => {
    // send join-room event to server
    socket.emit('join-room', ROOM_ID, id);
});


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        grid.appendChild(video);
        video.play();
    }, false);
};

const connectToNewUser = (userId, stream) => {
    console.log('new user connected');
    const call = peer.call(userId, stream);
    const newVideoElement = document.createElement('video');
    call.on('stream', function(remoteStream) {
        addVideoStream(newVideoElement, remoteStream);
    });
}

// messages

let chatInput = document.querySelector('#chat__input');
chatInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        socket.emit('message', e.target.value);
        e.target.value = '';
    }
});

socket.on('create-message', (message) => {
    const ul = document.querySelector('#chat__view');
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start bg-transparent text-light border-0';
    li.innerHTML = `<div class="ms-2 me-auto"><div class="fw-bold">User</div>${message}</div>`;
    // ul.append(`<li class="list-group-item d-flex justify-content-between align-items-start"><div class="ms-2 me-auto"><div class="fw-bold">Subheading</div>${message}</div></li>`);
    ul.appendChild(li);
});

// mute

const muteUnmute = (e) => {
    const enabled = videoStream.getAudioTracks()[0].enabled;
    if(enabled)  {
        videoStream.getAudioTracks()[0].enabled = false;
        showProperIcon(enabled, e);
    } else {
        showProperIcon(enabled);
        videoStream.getAudioTracks()[0].enabled = false;
    }
}

const showProperIcon = (value, e) => {
    console.log(e);
    if(value) {

    } else {

    }
}