class Stream {
    constructor(streamerID) {
        this.streamerID = streamerID;
        this.listViewers = []
    }
}

class Viewer {
    constructor(token, time) {
        this.token = token;
        this.time = 300; //Time in seconds
    }
}

var start = Date.now();
setInterval(function() {
    var delta = Date.now() - start; // milliseconds elapsed since start
    output(Math.floor(delta / 1000)); // in seconds
}, 1000); // update about every second