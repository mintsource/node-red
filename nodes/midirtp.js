/**
 * Copyright 2014 Dan Roden .
 *
 * https://github.com/mintsource/node-red
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// If you use this as a template, replace IBM Corp. with your own name.

// Sample Node-RED node file





// Require main module
var RED = require(process.env.NODE_RED_HOME+"/red/red");
var rtpmidi = require('rtpmidi');
var rtpmidi = require('rtpmidi/src/MidiMessage');





// The main node definition - most things happen in here
function MIDIRTPOut(n) {
    // Create a RED node
    RED.nodes.createNode(this,n);

    var node = this;

    var message = MidiMessage;



    // Do whatever you need to do in here - declare callbacks etc
    // Note: this sample doesn't do anything much - it will only send
    // this message once at startup...
    // Look at other real nodes for some better ideas of what to do....
    var msg = {};
    this.localsession = n.localsession;
    this.bonjourname = n.bonjourname;
    this.port = parseInt(n.port);
    this.topic = n.topic;

    msg.payload = this.localsession;

    // send out the message to the rest of the workspace.
    this.send(msg);

    var sessions = rtpmidi.manager.getSessions(),
      remoteSessions = rtpmidi.manager.getRemoteSessions();

    rtpmidi.manager.on('sessionAdded', function(event) {
      console.log('A local session was created:' + event);
    });

    rtpmidi.manager.on('sessionRemoved', function(event) {
      console.log('A local session was removed:' + event);
    });


    console.log("Session name:" + this.localsession);

    var session = rtpmidi.manager.createSession({
      localName: this.localsession,
      bonjourName: this.bonjourname,
      port: this.port
    });

    // Connect to a remote session
    session.connect({ address: '127.0.0.1', port: this.port});

    session.on('streamAdded', function(event) {
      console.log('The stream "' + event.stream.name + '" was added to the session "' + session.localName +'"');
    });
    session.on('streamRemoved', function(event) {
      console.log('The stream "' + event.stream.name + '" was removed from the session "' + session.localName +'"');
    });

    rtpmidi.manager.on('remoteSessionAdded', function(event) {
      console.log('A remote session was discovered');
      console.log('Connecting...');
      session.connect(event.remoteSession);
    });

    rtpmidi.manager.on('remoteSessionRemoved', function(event) {
      console.log('A remote session disappered');
    });

    session.on('ready', function() {

      console.log("Session ready");

      // Send a note
      setInterval(function() {
        session.sendMessage([0x80, 0x40]);
        session.sendMessage([0x90, 0x40, 0x7f]);
      }, 1000);

    });

    // Route the messages
    session.on('message', function(deltaTime, message) {
      console.log('Received a message', message);

        var msg = {};
        msg.topic = this.topic;
        msg.payload = message;

        // send out the message to the rest of the workspace.
        node.send(msg);
        console.log('Sent message', message);


        //var appleMidiMessage = session.parseBuffer(message);
 //var rtpMidiMessage = new MidiMessage().parseBuffer(message);
       // console.log("appleMidiMessage:" + appleMidiMessage);
    });



    this.on("close", function() {
        // Called when the node is shutdown - eg on redeploy.
        // Allows ports to be closed, connections dropped etc.
        // eg: this.client.disconnect();
    });
}

// Register the node by name. This must be called before overriding any of the
// Node functions.
RED.nodes.registerType("midi rtp out",MIDIRTPOut);



