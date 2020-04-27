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

const MODE = {
    CELT: 1002,
    HYBRID: 1001,
    SILK: 1000,
};

const EC_SYM_BITS = 8;
const EC_CODE_BITS = 32;
const EC_SYM_MAX = (1 << EC_SYM_BITS) - 1;
const EC_CODE_SHIFT = (EC_CODE_BITS-EC_SYM_BITS-1);
const EC_CODE_TOP = (1<<(EC_CODE_BITS-1));
const EC_CODE_BOT = (EC_CODE_TOP>>>EC_SYM_BITS); // note the >>>
const EC_CODE_EXTRA = ((EC_CODE_BITS-2)%EC_SYM_BITS+1)

const EC_ILOG = (_v) => { // ec_ilog(opus_uint32 _v){
  let ret;
  let m;
  ret=!!_v;
  m=!!(_v&0xFFFF0000)<<4;
  _v>>>=m;
  ret|=m;
  m=!!(_v&0xFF00)<<3;
  _v>>>=m;
  ret|=m;
  m=!!(_v&0xF0)<<2;
  _v>>>=m;
  ret|=m;
  m=!!(_v&0xC)<<1;
  _v>>>=m;
  ret|=m;
  ret+=!!(_v&0x2);
  return ret;
}

const silk_LBRR_flags_2_iCDF = new Uint8Array([203, 150, 0]);
const silk_LBRR_flags_3_iCDF = new Uint8Array([215, 195, 166, 125, 110, 82, 0]);
const silk_LBRR_flags_iCDF_ptr = [
  silk_LBRR_flags_2_iCDF,
  silk_LBRR_flags_3_iCDF
];
const silk_rate_levels_iCDF = [
    new Uint8Array([241,    190,    178,    132,     87,     74,     41,     14,
         0]),
    new Uint8Array([223,    193,    157,    140,    106,     57,     39,     18,
         0])
];
const silk_type_offset_VAD_iCDF = new Uint8Array([ 232,    158,    10,      0]);
const silk_gain_iCDF = [
    new Uint8Array([224,    112,     44,     15,      3,      2,      1,      0]),
    new Uint8Array([254,    237,    192,    132,     70,     23,      4,      0]),
    new Uint8Array([255,    252,    226,    155,     61,     11,      2,      0]),
];

const silk_delta_gain_iCDF = new Uint8Array([
    250,    245,    234,    203,     71,     50,     42,     38,
    35,     33,     31,     29,     28,     27,     26,     25,
    24,     23,     22,     21,     20,     19,     18,     17,
    16,     15,     14,     13,     12,     11,     10,      9,
    8,      7,      6,      5,      4,      3,      2,      1,
    0 ]);
const silk_uniform8_iCDF = new Uint8Array([ 224, 192, 160, 128, 96, 64, 32, 0 ]);

const silk_NLSF_CB1_WB_Q8 = new Uint8Array([
         7,     23,     38,     54,     69,     85,    100,    116,
       131,    147,    162,    178,    193,    208,    223,    239,
        13,     25,     41,     55,     69,     83,     98,    112,
       127,    142,    157,    171,    187,    203,    220,    236,
        15,     21,     34,     51,     61,     78,     92,    106,
       126,    136,    152,    167,    185,    205,    225,    240,
        10,     21,     36,     50,     63,     79,     95,    110,
       126,    141,    157,    173,    189,    205,    221,    237,
        17,     20,     37,     51,     59,     78,     89,    107,
       123,    134,    150,    164,    184,    205,    224,    240,
        10,     15,     32,     51,     67,     81,     96,    112,
       129,    142,    158,    173,    189,    204,    220,    236,
         8,     21,     37,     51,     65,     79,     98,    113,
       126,    138,    155,    168,    179,    192,    209,    218,
        12,     15,     34,     55,     63,     78,     87,    108,
       118,    131,    148,    167,    185,    203,    219,    236,
        16,     19,     32,     36,     56,     79,     91,    108,
       118,    136,    154,    171,    186,    204,    220,    237,
        11,     28,     43,     58,     74,     89,    105,    120,
       135,    150,    165,    180,    196,    211,    226,    241,
         6,     16,     33,     46,     60,     75,     92,    107,
       123,    137,    156,    169,    185,    199,    214,    225,
        11,     19,     30,     44,     57,     74,     89,    105,
       121,    135,    152,    169,    186,    202,    218,    234,
        12,     19,     29,     46,     57,     71,     88,    100,
       120,    132,    148,    165,    182,    199,    216,    233,
        17,     23,     35,     46,     56,     77,     92,    106,
       123,    134,    152,    167,    185,    204,    222,    237,
        14,     17,     45,     53,     63,     75,     89,    107,
       115,    132,    151,    171,    188,    206,    221,    240,
         9,     16,     29,     40,     56,     71,     88,    103,
       119,    137,    154,    171,    189,    205,    222,    237,
        16,     19,     36,     48,     57,     76,     87,    105,
       118,    132,    150,    167,    185,    202,    218,    236,
        12,     17,     29,     54,     71,     81,     94,    104,
       126,    136,    149,    164,    182,    201,    221,    237,
        15,     28,     47,     62,     79,     97,    115,    129,
       142,    155,    168,    180,    194,    208,    223,    238,
         8,     14,     30,     45,     62,     78,     94,    111,
       127,    143,    159,    175,    192,    207,    223,    239,
        17,     30,     49,     62,     79,     92,    107,    119,
       132,    145,    160,    174,    190,    204,    220,    235,
        14,     19,     36,     45,     61,     76,     91,    108,
       121,    138,    154,    172,    189,    205,    222,    238,
        12,     18,     31,     45,     60,     76,     91,    107,
       123,    138,    154,    171,    187,    204,    221,    236,
        13,     17,     31,     43,     53,     70,     83,    103,
       114,    131,    149,    167,    185,    203,    220,    237,
        17,     22,     35,     42,     58,     78,     93,    110,
       125,    139,    155,    170,    188,    206,    224,    240,
         8,     15,     34,     50,     67,     83,     99,    115,
       131,    146,    162,    178,    193,    209,    224,    239,
        13,     16,     41,     66,     73,     86,     95,    111,
       128,    137,    150,    163,    183,    206,    225,    241,
        17,     25,     37,     52,     63,     75,     92,    102,
       119,    132,    144,    160,    175,    191,    212,    231,
        19,     31,     49,     65,     83,    100,    117,    133,
       147,    161,    174,    187,    200,    213,    227,    242,
        18,     31,     52,     68,     88,    103,    117,    126,
       138,    149,    163,    177,    192,    207,    223,    239,
        16,     29,     47,     61,     76,     90,    106,    119,
       133,    147,    161,    176,    193,    209,    224,    240,
        15,     21,     35,     50,     61,     73,     86,     97,
       110,    119,    129,    141,    175,    198,    218,    237
]);

const silk_NLSF_CB1_iCDF_WB = new Uint8Array([
       225,    204,    201,    184,    183,    175,    158,    154,
       153,    135,    119,    115,    113,    110,    109,     99,
        98,     95,     79,     68,     52,     50,     48,     45,
        43,     32,     31,     27,     18,     10,      3,      0,
       255,    251,    235,    230,    212,    201,    196,    182,
       167,    166,    163,    151,    138,    124,    110,    104,
        90,     78,     76,     70,     69,     57,     45,     34,
        24,     21,     11,      6,      5,      4,      3,      0
]);

const silk_NLSF_CB2_SELECT_WB = new Uint8Array([
         0,      0,      0,      0,      0,      0,      0,      1,
       100,    102,    102,     68,     68,     36,     34,     96,
       164,    107,    158,    185,    180,    185,    139,    102,
        64,     66,     36,     34,     34,      0,      1,     32,
       208,    139,    141,    191,    152,    185,    155,    104,
        96,    171,    104,    166,    102,    102,    102,    132,
         1,      0,      0,      0,      0,     16,     16,      0,
        80,    109,     78,    107,    185,    139,    103,    101,
       208,    212,    141,    139,    173,    153,    123,    103,
        36,      0,      0,      0,      0,      0,      0,      1,
        48,      0,      0,      0,      0,      0,      0,     32,
        68,    135,    123,    119,    119,    103,     69,     98,
        68,    103,    120,    118,    118,    102,     71,     98,
       134,    136,    157,    184,    182,    153,    139,    134,
       208,    168,    248,     75,    189,    143,    121,    107,
        32,     49,     34,     34,     34,      0,     17,      2,
       210,    235,    139,    123,    185,    137,    105,    134,
        98,    135,    104,    182,    100,    183,    171,    134,
       100,     70,     68,     70,     66,     66,     34,    131,
        64,    166,    102,     68,     36,      2,      1,      0,
       134,    166,    102,     68,     34,     34,     66,    132,
       212,    246,    158,    139,    107,    107,     87,    102,
       100,    219,    125,    122,    137,    118,    103,    132,
       114,    135,    137,    105,    171,    106,     50,     34,
       164,    214,    141,    143,    185,    151,    121,    103,
       192,     34,      0,      0,      0,      0,      0,      1,
       208,    109,     74,    187,    134,    249,    159,    137,
       102,    110,    154,    118,     87,    101,    119,    101,
         0,      2,      0,     36,     36,     66,     68,     35,
        96,    164,    102,    100,     36,      0,      2,     33,
       167,    138,    174,    102,    100,     84,      2,      2,
       100,    107,    120,    119,     36,    197,     24,      0
]);

const silk_NLSF_CB2_iCDF_WB = new Uint8Array([
       255,    254,    253,    244,     12,      3,      2,      1,
         0,    255,    254,    252,    224,     38,      3,      2,
         1,      0,    255,    254,    251,    209,     57,      4,
         2,      1,      0,    255,    254,    244,    195,     69,
         4,      2,      1,      0,    255,    251,    232,    184,
        84,      7,      2,      1,      0,    255,    254,    240,
       186,     86,     14,      2,      1,      0,    255,    254,
       239,    178,     91,     30,      5,      1,      0,    255,
       248,    227,    177,    100,     19,      2,      1,      0
]);

const silk_NLSF_CB2_BITS_WB_Q5 = new Uint8Array([
       255,    255,    255,    156,      4,    154,    255,    255,
       255,    255,    255,    227,    102,     15,     92,    255,
       255,    255,    255,    255,    213,     83,     24,     72,
       236,    255,    255,    255,    255,    150,     76,     33,
        63,    214,    255,    255,    255,    190,    121,     77,
        43,     55,    185,    255,    255,    255,    245,    137,
        71,     43,     59,    139,    255,    255,    255,    255,
       131,     66,     50,     66,    107,    194,    255,    255,
       166,    116,     76,     55,     53,    125,    255,    255
]);

const silk_NLSF_PRED_WB_Q8 = new Uint8Array([
       175,    148,    160,    176,    178,    173,    174,    164,
       177,    174,    196,    182,    198,    192,    182,     68,
        62,     66,     60,     72,    117,     85,     90,    118,
       136,    151,    142,    160,    142,    155
]);

const silk_NLSF_DELTA_MIN_WB_Q15 = new Uint16Array([
       100,      3,     40,      3,      3,      3,      5,     14,
        14,     10,     11,      3,      8,      9,      7,      3,
       347
]);

const silk_NLSF_CB_WB = [
    32,
    16,
    9830, // SILK_FIX_CONST( 0.15, 16 ),
    427, // SILK_FIX_CONST( 1.0 / 0.15, 6 ),
    silk_NLSF_CB1_WB_Q8,
    silk_NLSF_CB1_iCDF_WB,
    silk_NLSF_PRED_WB_Q8,
    silk_NLSF_CB2_SELECT_WB,
    silk_NLSF_CB2_iCDF_WB,
    silk_NLSF_CB2_BITS_WB_Q5,
    silk_NLSF_DELTA_MIN_WB_Q15,
];


class EntDec {
    constructor(buf, storage) { // ec_dec_init
        this.buf = buf;
        this.storage = storage;
        this.end_offs = 0;
        this.end_window = 0;
        this.nend_bits = 0;
        this.nbits_total= EC_CODE_BITS+1-(((EC_CODE_BITS-EC_CODE_EXTRA)/EC_SYM_BITS) >> 0) *EC_SYM_BITS; // >> for integer fraction.
        this.offs = 0;
        this.rng = 1 << EC_CODE_EXTRA;
        this.rem = this.ec_read_byte();
        this.val = this.rng- 1 - (this.rem>>(EC_SYM_BITS-EC_CODE_EXTRA));
        this.error = 0;
        this.ec_dec_normalize();
    }
    ec_read_byte() {
        return this.offs < this.storage ? this.buf[this.offs++] : 0;
    }
    ec_read_byte_from_end() {
        return this.end_offs < this.storage ? this.buf[this.storage-++(this.end_offs)] : 0;
    }

    ec_dec_normalize() {
        while(this.rng<=EC_CODE_BOT){
            let sym;
            this.nbits_total += EC_SYM_BITS;
            this.rng <<= EC_SYM_BITS;
            this.rng >>>= 0;
            /*Use up the remaining bits from our last symbol.*/
            sym = this.rem;
            /*Read the next value from the input.*/
            this.rem = this.ec_read_byte();
            /*Take the rest of the bits we need from this new symbol.*/
            sym = (sym<<EC_SYM_BITS|this.rem)>>>(EC_SYM_BITS-EC_CODE_EXTRA);
            /*And subtract them from val, capped to be less than EC_CODE_TOP.*/
            this.val = ((this.val<<EC_SYM_BITS)+(EC_SYM_MAX&~sym))&(EC_CODE_TOP-1);
        }
    }

    ec_dec_bit_logp(logp) {
        let r;
        let d;
        let s;
        let ret;
        r = this.rng;
        d = this.val;
        s = r >>> logp;
        ret = d < s;
        if (!ret) this.val = d - s;
        this.rng = ret ? s : r - s;
        this.ec_dec_normalize();
        return ret;
    }

    ec_dec_icdf(icdf, ftb) {
        console.log('DEC ICDF', icdf);
        let r;
        let d;
        let s;
        let t;
        let ret;
        s = this.rng;
        d = this.val;
        r = s >>> ftb;
        ret = -1;
        do {
          t = s;
          s = Math.imul(r, icdf[++ret]);
        } while (d < s);
        this.val = d - s;
        this.rng = t - s;
        this.ec_dec_normalize();
        return ret;
    }

    ec_tell() {
        return this.nbits_total - EC_ILOG(this.rng);
    }
}

function opus_packet_get_mode(data) {
    let mode;
    if (data[0] & 0x80) {
        mode = MODE.CELT;
    } else if ((data[0] & 0x60) === 0x60) {
        mode = MODE.HYBRID;
    } else {
        mode = MODE.SILK;
    }
    return mode;
}

function silk_NLSF_unpack(ec_ix, pred_Q8, NLSF_CB, CB1_index) {
}

const MAX_LPC_ORDER = 16;
function silk_decode_indices(state, rangeDec, frameIndex, decode_LBRR, condCoding) {
	const signalType = 1; // psDec->indices.signalType
    console.log('ITELL1', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    let Ix = rangeDec.ec_dec_icdf(silk_type_offset_VAD_iCDF, 8);
    state.indices.signalType = Ix >> 1;
    state.indices.quantOffsetType = Ix & 1;
    console.log('INDICES', state.indices);
    console.log('ITELL2', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    if (condCoding) {
        console.log('condcoding, dunno');
    } else {
        rangeDec.ec_dec_icdf(silk_gain_iCDF[ signalType ], 8 );
        rangeDec.ec_dec_icdf(silk_uniform8_iCDF, 8 );
    }
    console.log('ITELL3', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    for (let i = 1; i < state.nb_subfr; i++) {
        rangeDec.ec_dec_icdf(silk_delta_gain_iCDF, 8 );
    }
    console.log('ITELL4', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    // TODO: support more than WB
    //rangeDec.ec_dec_icdf(psDec->psNLSF_CB->CB1_iCDF[ ( psDec->indices.signalType >> 1 ) * psDec->psNLSF_CB->nVectors ], 8);
    state.indices.NLSFIncides = [ rangeDec.ec_dec_icdf(silk_NLSF_CB1_iCDF_WB, 8) ];
    console.log('ITELL5', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    // silk_NLSF_unpack can not modify range decoder but we need the stuff it unpacks.
    const ec_ix = new Uint16Array(MAX_LPC_ORDER);
    const pred_Q8 = new Uint8Array(MAX_LPC_ORDER);
    //silk_NLSF_unpack(ec_ix, pred_Q8, {}, 
}
/*
function silk_decode_pulses(rangeDec, signalType) {
    rangeDec.ec_dec_icdf(silk_rate_levels_iCDF[signalType >> 1], 8);
}
*/

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
