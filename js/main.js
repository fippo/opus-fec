/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
/* global TimelineDataSeries, TimelineGraphView */

'use strict';

const audio2 = document.querySelector('audio#audio2');
const callButton = document.querySelector('button#callButton');
const hangupButton = document.querySelector('button#hangupButton');
const codecSelector = document.querySelector('select#codec');
hangupButton.disabled = true;
callButton.onclick = call;
hangupButton.onclick = hangup;

let pc1;
let pc2;
let localStream;

let bitrateGraph;
let bitrateSeries;
let headerrateSeries;

let packetGraph;
let packetSeries;

let fecGraph;
let fecSeries;
let fecDiscardedSeries;

let lastResult;
let lastReceiverResult;

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0,
  voiceActivityDetection: false
};

// encodeFunction({data: testPacket.buffer}, {enqueue: (s) => console.log(s) });
const testPacket = new Uint8Array([0x78, 0xc4, 0xb4, 0x38,
0x19, 0x3d, 0xa1, 0x5e, 0xa5, 0x1e, 0x57, 0x9e,
0x42, 0xdd, 0xd4, 0x18, 0x48, 0xff, 0x65, 0x58,
0xf8, 0xb7, 0x58, 0x92, 0x44, 0xc1, 0x39, 0x6c,
0x6b, 0x0a, 0xde, 0xfa, 0x98, 0x02, 0xf7, 0x38,
0x82, 0x5c, 0x42, 0xd4, 0xa3, 0xe0, 0xf9, 0x24,
0x70, 0x39, 0x93, 0xd6, 0xe4, 0xf3, 0x6e, 0x16,
0x45, 0x24, 0x98, 0xd4, 0x02, 0x60, 0xab, 0x12,
0x70, 0xb3, 0xbe, 0x62, 0x7f, 0x4b, 0x94, 0x52,
0xae, 0x83, 0xb9, 0x5e, 0xeb, 0x50, 0xa0, 0xa3,
0xa8, 0x6d, 0x27, 0x3d, 0xd6, 0x3b, 0x64]);

// roughly this follows opus_decode_frame
function encodeFunction(encodedFrame, controller) {
  const view = new DataView(encodedFrame.data);
  const data = new Uint8Array(encodedFrame.data);
  if (encodedFrame.data.byteLength < 1 || opus_packet_get_mode(data) === MODE.CELT) {
    return controller.enqueue(encodedFrame);
  }
  // We know that we are in silk mode now.
  // Follow what silk_Decode does
  const dec = new EntDec(new Uint8Array(encodedFrame.data, 1), encodedFrame.data.byteLength - 1);
  const channel_state = [{
    indices: {},
    nFramesPerPacket: 1,
    nb_subfr: 4, // assuming 20ms
    VAD_flags: []
  }];
  for (let n = 0; n < 1; n++) {
    for (let i = 0; i < channel_state[n].nFramesPerPacket; i++) {
      channel_state[n].VAD_flags[i] = dec.ec_dec_bit_logp(1);
    }
    channel_state[n].LBRR_flag = dec.ec_dec_bit_logp(1);
  }
  for (let n = 0; n < 1; n++) {
    channel_state[n].LBRR_flags = new Array(3); // MAX_FRAMES_PER_PACKET
    if (channel_state[n].LBRR_flag) {
      if (channel_state[n].nFramesPerPacket === 1) {
        channel_state[n].LBRR_flags[0] = 1;
      } else {
        LBRR_symbol = dec.ec_dec_icdf(silk_LBRR_flags_iCDF_ptr[channel_state[n].nFramesPerPacket - 2 ], 8 ) + 1;
        for( i = 0; i < channel_state[ n ].nFramesPerPacket; i++ ) {
          channel_state[ n ].LBRR_flags[ i ] = silk_RSHIFT( LBRR_symbol, i ) & 1; // TODO
        }
      }
    }
  }
  // if( lostFlag == FLAG_DECODE_NORMAL ) {
  for (let i = 0; i < channel_state[0].nFramesPerPacket; i++) {
    for (let n = 0; n < 1; n++) {
      if (channel_state[n].LBRR_flags[i]) {
        const tell = dec.ec_tell();
        // use EC_tell()
        silk_decode_indices(channel_state[n], dec, 1, true, false);
        // silk_decode_pulses
        // use EC_tell() again
        console.log('we have lbrr', dec.ec_tell(), tell);
      }
    }
  }
  controller.enqueue(encodedFrame);
}

function setupSenderTransform(sender) {
  const senderStreams = sender.createEncodedAudioStreams();
  const transformStream = new TransformStream({
    transform: encodeFunction,
  });
  senderStreams.readableStream
      .pipeThrough(transformStream)
      .pipeTo(senderStreams.writableStream);
}

function gotStream(stream) {
  hangupButton.disabled = false;
  console.log('Received local stream');
  localStream = stream;
  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length > 0) {
    console.log(`Using Audio device: ${audioTracks[0].label}`);
  }
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  console.log('Adding Local Stream to peer connection');
  pc1.getSenders().forEach(setupSenderTransform);

  pc1.createOffer(offerOptions)
      .then(gotDescription1, onCreateSessionDescriptionError);

  bitrateSeries = new TimelineDataSeries();
  bitrateGraph = new TimelineGraphView('bitrateGraph', 'bitrateCanvas');
  bitrateGraph.updateEndDate();

  headerrateSeries = new TimelineDataSeries();
  headerrateSeries.setColor('green');

  packetSeries = new TimelineDataSeries();
  packetGraph = new TimelineGraphView('packetGraph', 'packetCanvas');
  packetGraph.updateEndDate();

  fecSeries = new TimelineDataSeries();
  fecDiscardedSeries = new TimelineDataSeries();
  fecGraph = new TimelineGraphView('fecGraph', 'fecCanvas');
  fecGraph.updateEndDate();
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function call() {
  callButton.disabled = true;
  codecSelector.disabled = true;
  console.log('Starting call');
  const servers = null;
  pc1 = new RTCPeerConnection({
    forceEncodedAudioInsertableStreams: true,
  });
  console.log('Created local peer connection object pc1');
  pc1.onicecandidate = e => onIceCandidate(pc1, e);
  pc2 = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object pc2');
  pc2.onicecandidate = e => onIceCandidate(pc2, e);
  pc2.ontrack = gotRemoteStream;
  console.log('Requesting local stream');
  navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false
      })
      .then(gotStream)
      .catch(e => {
        alert(`getUserMedia() error: ${e.name}`);
      });
}

function gotDescription1(desc) {
  console.log(`Offer from pc1\n${desc.sdp}`);
  pc1.setLocalDescription(desc)
      .then(() => {
        desc.sdp = forceChosenAudioCodec(desc.sdp);
        pc2.setRemoteDescription(desc).then(() => {
          return pc2.createAnswer().then(gotDescription2, onCreateSessionDescriptionError);
        }, onSetSessionDescriptionError);
      }, onSetSessionDescriptionError);
}

function gotDescription2(desc) {
  console.log(`Answer from pc2\n${desc.sdp}`);
  pc2.setLocalDescription(desc).then(() => {
    desc.sdp = forceChosenAudioCodec(desc.sdp);
    pc1.setRemoteDescription(desc).then(() => {}, onSetSessionDescriptionError);
  }, onSetSessionDescriptionError);
}

function hangup() {
  console.log('Ending call');
  localStream.getTracks().forEach(track => track.stop());
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  codecSelector.disabled = false;
}

function gotRemoteStream(e) {
  if (audio2.srcObject !== e.streams[0]) {
    audio2.srcObject = e.streams[0];
    console.log('Received remote stream');
  }
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function onIceCandidate(pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
      .then(
          () => onAddIceCandidateSuccess(pc),
          err => onAddIceCandidateError(pc, err)
      );
  console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add ICE Candidate: ${error.toString()}`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function forceChosenAudioCodec(sdp) {
  return maybePreferCodec(sdp, 'audio', 'send', codecSelector.value);
}

// Copied from AppRTC's sdputils.js:

// Sets |codec| as the default |type| codec if it's present.
// The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
function maybePreferCodec(sdp, type, dir, codec) {
  const str = `${type} ${dir} codec`;
  if (codec === '') {
    console.log(`No preference on ${str}.`);
    return sdp;
  }

  console.log(`Prefer ${str}: ${codec}`);

  const sdpLines = sdp.split('\r\n');

  // Search for m line.
  const mLineIndex = findLine(sdpLines, 'm=', type);
  if (mLineIndex === null) {
    return sdp;
  }

  // If the codec is available, set it as the default in m line.
  const codecIndex = findLine(sdpLines, 'a=rtpmap', codec);
  console.log('codecIndex', codecIndex);
  if (codecIndex) {
    const payload = getCodecPayloadType(sdpLines[codecIndex]);
    if (payload) {
      sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], payload);
    }
  }

  sdp = sdpLines.join('\r\n');
  return sdp;
}

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
function findLine(sdpLines, prefix, substr) {
  return findLineInRange(sdpLines, 0, -1, prefix, substr);
}

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
  const realEndLine = endLine !== -1 ? endLine : sdpLines.length;
  for (let i = startLine; i < realEndLine; ++i) {
    if (sdpLines[i].indexOf(prefix) === 0) {
      if (!substr ||
        sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
        return i;
      }
    }
  }
  return null;
}

// Gets the codec payload type from an a=rtpmap:X line.
function getCodecPayloadType(sdpLine) {
  const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
  const result = sdpLine.match(pattern);
  return (result && result.length === 2) ? result[1] : null;
}

// Returns a new m= line with the specified codec as the first one.
function setDefaultCodec(mLine, payload) {
  const elements = mLine.split(' ');

  // Just copy the first three parameters; codec order starts on fourth.
  const newLine = elements.slice(0, 3);

  // Put target payload first and copy in the rest.
  newLine.push(payload);
  for (let i = 3; i < elements.length; i++) {
    if (elements[i] !== payload) {
      newLine.push(elements[i]);
    }
  }
  return newLine.join(' ');
}

// query getStats every second
window.setInterval(() => {
  if (!pc1) {
    return;
  }
  const sender = pc1.getSenders()[0];
  sender.getStats().then(res => {
    res.forEach(report => {
      let bytes;
      let headerBytes;
      let packets;
      if (report.type === 'outbound-rtp') {
        if (report.isRemote) {
          return;
        }
        const now = report.timestamp;
        bytes = report.bytesSent;
        headerBytes = report.headerBytesSent;

        packets = report.packetsSent;
        if (lastResult && lastResult.has(report.id)) {
          // calculate bitrate
          const bitrate = 8 * (bytes - lastResult.get(report.id).bytesSent) /
            (now - lastResult.get(report.id).timestamp);
          const headerrate = 8 * (headerBytes - lastResult.get(report.id).headerBytesSent) /
            (now - lastResult.get(report.id).timestamp);

          // append to chart
          bitrateSeries.addPoint(now, bitrate);
          headerrateSeries.addPoint(now, headerrate);
          bitrateGraph.setDataSeries([bitrateSeries, headerrateSeries]);
          bitrateGraph.updateEndDate();

          // calculate number of packets and append to chart
          packetSeries.addPoint(now, packets -
            lastResult.get(report.id).packetsSent);
          packetGraph.setDataSeries([packetSeries]);
          packetGraph.updateEndDate();
        }
      }
    });
    lastResult = res;
  });

  const receiver = pc2.getReceivers()[0];
  receiver.getStats().then(res => {
    res.forEach(report => {
      if (report.type === 'inbound-rtp' && lastReceiverResult) { 
        // FEC stuff. Missing on outbound-rtp.
        if (report.isRemote) {
          return;
        }
        const now = report.timestamp;
        const received = report.fecPacketsReceived;
        const discarded = report.fecPacketsReceived;

        if (lastReceiverResult && lastReceiverResult.has(report.id)) {
          fecSeries.addPoint(now, 1000 * (received - lastReceiverResult.get(report.id).fecPacketsReceived) / (now - lastReceiverResult.get(report.id).timestamp));
          fecGraph.setDataSeries([fecSeries]);
          fecGraph.updateEndDate();
        }
      }
    });
    lastReceiverResult = res;
  });
}, 1000);
