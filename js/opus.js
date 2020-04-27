const MODE = {
    CELT: 1002,
    HYBRID: 1001,
    SILK: 1000,
};
const SIGNAL_TYPES = {
    NO_VOICE_ACTIVITY: 0,
    UNVOICED: 1,
    VOICED: 2,
};

// define.h
const MAX_LPC_ORDER = 16;
const NLSF_QUANT_MAX_AMPLITUDE = 4;
const MAX_NB_SUBFR = 4;
const MAX_FS_KHZ = 16;
const SUB_FRAME_LENGTH_MS = 5;
const MAX_SUB_FRAME_LENGTH = ( SUB_FRAME_LENGTH_MS * MAX_FS_KHZ );
const MAX_FRAME_LENGTH_MS = ( SUB_FRAME_LENGTH_MS * MAX_NB_SUBFR );
const MAX_FRAME_LENGTH = ( MAX_FRAME_LENGTH_MS * MAX_FS_KHZ );

const SHELL_CODEC_FRAME_LENGTH = 16;
const LOG2_SHELL_CODEC_FRAME_LENGTH = 4;
const MAX_NB_SHELL_BLOCKS = ( MAX_FRAME_LENGTH / SHELL_CODEC_FRAME_LENGTH )
const SILK_MAX_PULSES = 16


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
const silk_type_offset_no_VAD_iCDF = new Uint8Array([ 230,      0]);
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

const silk_pulses_per_block_iCDF = [
	new Uint8Array([
       125,     51,     26,     18,     15,     12,     11,     10,
         9,      8,      7,      6,      5,      4,      3,      2,
         1,      0
	]),
	new Uint8Array([
       198,    105,     45,     22,     15,     12,     11,     10,
         9,      8,      7,      6,      5,      4,      3,      2,
         1,      0
	]),
	new Uint8Array([
       213,    162,    116,     83,     59,     43,     32,     24,
        18,     15,     12,      9,      7,      6,      5,      3,
         2,      0
	]),
	new Uint8Array([
       239,    187,    116,     59,     28,     16,     11,     10,
         9,      8,      7,      6,      5,      4,      3,      2,
         1,      0
	]),
	new Uint8Array([
       250,    229,    188,    135,     86,     51,     30,     19,
        13,     10,      8,      6,      5,      4,      3,      2,
         1,      0
	]),
	new Uint8Array([
       249,    235,    213,    185,    156,    128,    103,     83,
        66,     53,     42,     33,     26,     21,     17,     13,
        10,      0
	]),
	new Uint8Array([
       254,    249,    235,    206,    164,    118,     77,     46,
        27,     16,     10,      7,      5,      4,      3,      2,
         1,      0
	]),
	new Uint8Array([
       255,    253,    249,    239,    220,    191,    156,    119,
        85,     57,     37,     23,     15,     10,      6,      4,
         2,      0
	]),
	new Uint8Array([
       255,    253,    251,    246,    237,    223,    203,    179,
       152,    124,     98,     75,     55,     40,     29,     21,
        15,      0
	]),
	new Uint8Array([
       255,    254,    253,    247,    220,    162,    106,     67,
        42,     28,     18,     12,      9,      6,      4,      3,
         2,      0
	]),
];

const silk_NLSF_CB_WB = { // Wideband codebook.
    nVectors: 32,
    order: 16,
    quantStepSize_Q16: 9830, // SILK_FIX_CONST( 0.15, 16 ),
    invQuantStepSize_Q6: 427, // SILK_FIX_CONST( 1.0 / 0.15, 6 ),
    CB1_NLSF_Q8: silk_NLSF_CB1_WB_Q8,
    CB1_iCDF: silk_NLSF_CB1_iCDF_WB,
    pred_Q8: silk_NLSF_PRED_WB_Q8,
    ec_sel: silk_NLSF_CB2_SELECT_WB,
    ec_iCDF: silk_NLSF_CB2_iCDF_WB,
    ec_Rates_Q5: silk_NLSF_CB2_BITS_WB_Q5,
    deltaMin_Q15: silk_NLSF_DELTA_MIN_WB_Q15,
};

const silk_NLSF_EXT_iCDF = new Uint8Array([ 100, 40, 16, 7, 3, 1, 0]);
const silk_NLSF_interpolation_factor_iCDF = new Uint8Array([ 243, 221, 192, 181, 0 ]);

const silk_uniform3_iCDF = new Uint8Array([ 171, 85, 0 ]);
const silk_uniform4_iCDF = new Uint8Array([ 192, 128, 64, 0 ]);
const silk_uniform5_iCDF = new Uint8Array([ 205, 154, 102, 51, 0 ]);
const silk_uniform6_iCDF = new Uint8Array([ 213, 171, 128, 85, 43, 0 ]);
const silk_uniform8_iCDF = new Uint8Array([ 224, 192, 160, 128, 96, 64, 32, 0 ]);

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
          //console.log('ICDF', icdf[ret], ret);
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

const silk_SMULBB = (a, b) => (a & 0xffff) * (b & 0xffff);
const silk_RSHIFT = (a, shift) => a >>> shift;
function silk_NLSF_unpack(ec_ix, pred_Q8, NLSF_CB, CB1_index) {
    let ec_sel_ptr = CB1_index * NLSF_CB.order / 2;
    for (let i = 0; i < NLSF_CB.order; i += 2) {
        const entry = NLSF_CB.ec_sel[ec_sel_ptr++];
        ec_ix  [ i     ] = silk_SMULBB( silk_RSHIFT( entry, 1 ) & 7, 2 * NLSF_QUANT_MAX_AMPLITUDE + 1 );
		pred_Q8[ i     ] = NLSF_CB.pred_Q8[ i + ( entry & 1 ) * ( NLSF_CB.order - 1 ) ];
        ec_ix  [ i + 1 ] = silk_SMULBB( silk_RSHIFT( entry, 5 ) & 7, 2 * NLSF_QUANT_MAX_AMPLITUDE + 1 );
        pred_Q8[ i + 1 ] = NLSF_CB.pred_Q8[ i + ( silk_RSHIFT( entry, 4 ) & 1 ) * ( NLSF_CB.order - 1 ) + 1 ];
    }
}

function silk_decode_indices(state, rangeDec, frameIndex, decode_LBRR, condCoding) {
    // console.log('ITELL1', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    let Ix;
    if (decode_LBRR || state.VAD_flags[frameIndex]) {
      Ix = rangeDec.ec_dec_icdf(silk_type_offset_VAD_iCDF, 8) + 2;
    } else {
      Ix = rangeDec.ec_dec_icdf(silk_type_offset_no_VAD_iCDF, 8) + 2;
    }
    state.indices.signalType = Ix >> 1;
    state.indices.quantOffsetType = Ix & 1;
    //console.log('ITELL2', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    if (condCoding) {
        console.log('condcoding, dunno');
    } else {
        rangeDec.ec_dec_icdf(silk_gain_iCDF[ state.indices.signalType ], 8 );
        rangeDec.ec_dec_icdf(silk_uniform8_iCDF, 8 );
    }
    //console.log('ITELL3', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    for (let i = 1; i < state.nb_subfr; i++) {
        rangeDec.ec_dec_icdf(silk_delta_gain_iCDF, 8 );
    }
    //console.log('ITELL4', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    // TODO: support more than WB
    state.indices.NLSFIndices = [ rangeDec.ec_dec_icdf(silk_NLSF_CB_WB.CB1_iCDF.slice((state.indices.signalType >> 1) * silk_NLSF_CB_WB.nVectors), 8) ];
    //console.log('ITELL5', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    // silk_NLSF_unpack can not modify range decoder but we need the stuff it unpacks.
    const ec_ix = new Uint16Array(MAX_LPC_ORDER);
    const pred_Q8 = new Uint8Array(MAX_LPC_ORDER);
    silk_NLSF_unpack(ec_ix, pred_Q8, silk_NLSF_CB_WB, state.indices.NLSFIndices[0]);
    //console.log('ITELL6', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    const order = 16;
    for (let i = 0; i < order; i++) {
        // Ix = ec_dec_icdf( psRangeDec, &psDec->psNLSF_CB->ec_iCDF[ ec_ix[ i ] ], 8 );
        Ix = rangeDec.ec_dec_icdf(silk_NLSF_CB_WB.ec_iCDF.slice(ec_ix[i]), 8);
        if (Ix === 0) {
            Ix -= rangeDec.ec_dec_icdf(silk_NLSF_EXT_iCDF, 8 );
        } else if (Ix === 2 * NLSF_QUANT_MAX_AMPLITUDE) {
            Ix += rangeDec.ec_dec_icdf(silk_NLSF_EXT_iCDF, 8 );
        }
        state.indices.NLSFIndices[i + 1] = Ix - NLSF_QUANT_MAX_AMPLITUDE;
    }
    //console.log('ITELL7', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    if (state.nb_subfr === MAX_NB_SUBFR) {
        state.indices.NLSFInterpCoef_Q2 = rangeDec.ec_dec_icdf(silk_NLSF_interpolation_factor_iCDF, 8) & 0xff;
    } else {
        state.indices.NLSFInterpCoef_Q2 = 4;
    }

    //console.log('ITELL8', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    // TODO: if signalType === TYPE_VOICED
    state.indices.Seed = rangeDec.ec_dec_icdf(silk_uniform4_iCDF, 8);
    //console.log('ITELL9', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
}

function silk_decode_pulses(rangeDec, pulses, signalType, quantOffsetType, frame_length) {
    console.log('PTELL1', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    const sum_pulses = new Int32Array(MAX_NB_SHELL_BLOCKS);
    const nLshifts = new Int32Array(MAX_NB_SHELL_BLOCKS);

    const RateLevelIndex = rangeDec.ec_dec_icdf(silk_rate_levels_iCDF[ signalType >> 1 ], 8 );
    console.log('PTELL2', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    let iter = silk_RSHIFT( frame_length, LOG2_SHELL_CODEC_FRAME_LENGTH );
	if( iter * SHELL_CODEC_FRAME_LENGTH < frame_length ) {
        silk_assert( frame_length == 12 * 10 ); /* Make sure only happens for 10 ms @ 12 kHz */
        iter++;
    }

	/***************************************************/
	/* Sum-Weighted-Pulses Decoding                    */
	/***************************************************/
    let cdf_ptr = RateLevelIndex;
	for (let i = 0; i < iter; i++) {
        nLshifts[i] = 0;
        sum_pulses[ i ] = rangeDec.ec_dec_icdf(silk_pulses_per_block_iCDF[cdf_ptr], 8 );
        while( sum_pulses[ i ] == SILK_MAX_PULSES + 1 ) {
            nLshifts[i]++;
            /* When we've already got 10 LSBs, we shift the table to not allow (SILK_MAX_PULSES + 1) */
            sum_pulses[ i ] = rangeDec.ec_dec_icdf( silk_pulses_per_block_iCDF[ N_RATE_LEVELS - 1] + ( nLshifts[ i ] === 10 ), 8 );

        }
    }
    console.log('PTELL3', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

    /***************************************************/
    /* Shell decoding                                  */
    /***************************************************/
	for (let i = 0; i < iter; i++) {
		if( sum_pulses[ i ] > 0 ) {
        } else {
        }
    }
    console.log('PTELL4', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
}
