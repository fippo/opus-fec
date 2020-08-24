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

let total_lbrr_bits = 0;
let lbrr_packets_sent = 0;
let lbrr_percentage = 0;
let last_lbrr;
let lbrrGraph;
let lbrrSeries;

let lbrrPercentageGraph;
let lbrrPercentageSeries;

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0,
  voiceActivityDetection: false
};

// Packet 390 from the fec12p dump. Has FEC.
// encodeFunction({data: testPacket.buffer}, {enqueue: (s) => console.log(s) });
// has 171 lbrr bits, end state is 174 201 54925537 76738212
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

// Opus decoder state.
const channel_state = [silk_init_encoder()];
let nChannelsInternal = 1;
// roughly this follows opus_decode_frame
function encodeFunction(encodedFrame, controller) {
  controller.enqueue(encodedFrame); // no modifications, for now.
  const view = new DataView(encodedFrame.data);
  const data = new Uint8Array(encodedFrame.data);

  if (encodedFrame.data.byteLength < 1 || opus_packet_get_mode(data) === MODE.CELT) {
    return;
  }
  // We know that we are in silk mode now.
  // Follow what silk_Decode does
  const rangeDec = new EntDec(new Uint8Array(encodedFrame.data, 1), encodedFrame.data.byteLength - 1);
  const newPacketFlag = true;
  const lostFlag = FLAG_DECODE_NORMAL

  /**********************************/
  /* Test if first frame in payload */
  /**********************************/
  if (newPacketFlag) {
    for (let n = 0; n < nChannelsInternal; n++) {
      channel_state[n].nFramesDecoded = 0;
    }
  }

  /* If Mono -> Stereo transition in bitstream: init state of second channel */
  // TODO

  // We fast-forward to this (which is always true here)
  // if( lostFlag != FLAG_PACKET_LOST && channel_state[ 0 ].nFramesDecoded == 0 )
  if (lostFlag !== FLAG_PACKET_LOST && channel_state[0].nFramesDecoded === 0) {
    /* First decoder call for this payload */
    /* Decode VAD flags and LBRR flag */
    for (let n = 0; n < nChannelsInternal; n++) {
      for (let i = 0; i < channel_state[n].nFramesPerPacket; i++) {
        channel_state[n].VAD_flags[i] = rangeDec.ec_dec_bit_logp(1);
      }
      channel_state[n].LBRR_flag = rangeDec.ec_dec_bit_logp(1);
    }
    /* Decode LBRR flags */
    for (let n = 0; n < nChannelsInternal; n++) {
      channel_state[n].LBRR_flags = new Array(MAX_FRAMES_PER_PACKET);
      if (channel_state[n].LBRR_flag) {
        if (channel_state[n].nFramesPerPacket === 1) {
          channel_state[n].LBRR_flags[0] = 1;
        } else {
          LBRR_symbol = rangeDec.ec_dec_icdf(silk_LBRR_flags_iCDF_ptr[channel_state[n].nFramesPerPacket - 2 ], 8 ) + 1;
          for( i = 0; i < channel_state[ n ].nFramesPerPacket; i++ ) {
            channel_state[ n ].LBRR_flags[ i ] = silk_RSHIFT( LBRR_symbol, i ) & 1; // TODO
          }
        }
      }
    }

    if (lostFlag === FLAG_DECODE_NORMAL) {
      /* Regular decoding: skip all LBRR data */
      for (let i = 0; i < channel_state[0].nFramesPerPacket; i++) {
        for (let n = 0; n < nChannelsInternal; n++) {
          if (channel_state[n].LBRR_flags[i]) {
            const pulses = new Uint16Array(MAX_FRAME_LENGTH);
            const tell = rangeDec.ec_tell();
            silk_decode_indices(channel_state[n], rangeDec, 1, true, false);
            silk_decode_pulses(rangeDec, pulses, channel_state[n].indices.signalType,
                channel_state[n].indices.quantOffsetType, channel_state[n].frameLength);
            const lbrr_bits = rangeDec.ec_tell() - tell;

            // We are using the rangeDecoder offset (how many bytes it read), not ec_tell() which is how many
            // bits it encoded.
            total_lbrr_bits += 8 * rangeDec.offs; //lbrr_bits;
            lbrr_packets_sent++;
            lbrr_percentage += 100 * rangeDec.offs / rangeDec.storage; //100 * lbrr_bits / (8 * rangeDec.storage);
            //console.log('we have lbrr', rangeDec.ec_tell(), tell, 8 * rangeDec.storage, Math.floor(100 * lbrr_bits / (8 * rangeDec.storage)));
            console.log('we have lbrr', rangeDec.ec_tell(), tell, rangeDec.offs, rangeDec.storage);
          }
        }
      }
    }
  }
  // TODO: continue here
  /* Get MS predictor index */
}

function setupSenderTransform(sender) {
  const senderStreams = sender.createEncodedStreams ?
    sender.createEncodedStreams() : sender.createEncodedAudioStreams();
  const transformStream = new TransformStream({
    transform: encodeFunction,
  });
  senderStreams.readableStream
      .pipeThrough(transformStream)
      .pipeTo(senderStreams.writable || senderStreams.writableStream);
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

  lbrrSeries = new TimelineDataSeries();
  lbrrGraph = new TimelineGraphView('lbrrGraph', 'lbrrCanvas');
  lbrrGraph.updateEndDate();

  lbrrPercentageSeries = new TimelineDataSeries();
  lbrrPercentageGraph = new TimelineGraphView('lbrrPercentageGraph', 'lbrrPercentageCanvas');
  lbrrPercentageGraph.updateEndDate();
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function call() {
  callButton.disabled = true;
  console.log('Starting call');
  const servers = null;
  pc1 = new RTCPeerConnection({
    forceEncodedAudioInsertableStreams: true,
    encodedInsertableStreams: true,
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
        pc2.setRemoteDescription(desc).then(() => {
          return pc2.createAnswer().then(gotDescription2, onCreateSessionDescriptionError);
        }, onSetSessionDescriptionError);
      }, onSetSessionDescriptionError);
}

function gotDescription2(desc) {
  console.log(`Answer from pc2\n${desc.sdp}`);
  pc2.setLocalDescription(desc).then(() => {
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
        if (last_lbrr) {
          const [then, bits, packets] = last_lbrr;
          lbrrSeries.addPoint(now, 1000 * (total_lbrr_bits - bits) / (now - then));
          lbrrGraph.setDataSeries([lbrrSeries]);
          lbrrGraph.updateEndDate();


          lbrrPercentageSeries.addPoint(now, lbrr_percentage / (lbrr_packets_sent - packets));
          lbrrPercentageGraph.setDataSeries([lbrrPercentageSeries]);
          lbrrPercentageGraph.updateEndDate();
        }
        last_lbrr= [now, total_lbrr_bits, lbrr_packets_sent];
        lbrr_percentage = 0;
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
