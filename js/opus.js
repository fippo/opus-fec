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

const CODE_INDEPENDENTLY = 0;
const CODE_INDEPENDENTLY_NO_LTP_SCALING = 1;
const CODE_CONDITIONALLY = 2;

// define.h
const MAX_FRAMES_PER_PACKET = 3;

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
const MAX_NB_SHELL_BLOCKS = ( MAX_FRAME_LENGTH / SHELL_CODEC_FRAME_LENGTH );
const N_RATE_LEVELS = 10;
const SILK_MAX_PULSES = 16;


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

/* tables_pitch_lag.c */
const silk_pitch_lag_iCDF = new Uint8Array([
       253,    250,    244,    233,    212,    182,    150,    131,
       120,    110,     98,     85,     72,     60,     49,     40,
        32,     25,     19,     15,     13,     11,      9,      8,
         7,      6,      5,      4,      3,      2,      1,      0
]);

const silk_pitch_delta_iCDF = new Uint8Array([
       210,    208,    206,    203,    199,    193,    183,    168,
       142,    104,     74,     52,     37,     27,     20,     14,
        10,      6,      4,      2,      0
]);

const silk_pitch_contour_iCDF = new Uint8Array([
       223,    201,    183,    167,    152,    138,    124,    111,
        98,     88,     79,     70,     62,     56,     50,     44,
        39,     35,     31,     27,     24,     21,     18,     16,
        14,     12,     10,      8,      6,      4,      3,      2,
         1,      0
]);

const silk_pitch_contour_NB_iCDF = new Uint8Array([
       188,    176,    155,    138,    119,     97,     67,     43,
        26,     10,      0
]);

const silk_pitch_contour_10_ms_iCDF = new Uint8Array([
       165,    119,     80,     61,     47,     35,     27,     20,
        14,      9,      4,      0
]);

const silk_pitch_contour_10_ms_NB_iCDF = new Uint8Array([
       113,     63,      0
]);

/* tables_LTP.c */
const silk_LTP_per_index_iCDF = new Uint8Array([
       179,     99,      0
]);

const silk_LTP_gain_iCDF_0 = new Uint8Array([
        71,     56,     43,     30,     21,     12,      6,      0
]);

const silk_LTP_gain_iCDF_1 = new Uint8Array([
       199,    165,    144,    124,    109,     96,     84,     71,
        61,     51,     42,     32,     23,     15,      8,      0
]);

const silk_LTP_gain_iCDF_2 = new Uint8Array([
       241,    225,    211,    199,    187,    175,    164,    153,
       142,    132,    123,    114,    105,     96,     88,     80,
        72,     64,     57,     50,     44,     38,     33,     29,
        24,     20,     16,     12,      9,      5,      2,      0
]);

const silk_LTP_gain_middle_avg_RD_Q14 = 12304;

const silk_LTP_gain_BITS_Q5_0 = new Uint8Array([
        15,    131,    138,    138,    155,    155,    173,    173
]);

const silk_LTP_gain_BITS_Q5_1 = new Uint8Array([
        69,     93,    115,    118,    131,    138,    141,    138,
       150,    150,    155,    150,    155,    160,    166,    160
]);

const silk_LTP_gain_BITS_Q5_2 = new Uint8Array([
       131,    128,    134,    141,    141,    141,    145,    145,
       145,    150,    155,    155,    155,    155,    160,    160,
       160,    160,    166,    166,    173,    173,    182,    192,
       182,    192,    192,    192,    205,    192,    205,    224
]);

const silk_LTP_gain_iCDF_ptrs = [
    silk_LTP_gain_iCDF_0,
    silk_LTP_gain_iCDF_1,
    silk_LTP_gain_iCDF_2
];

const silk_LTP_gain_BITS_Q5_ptrs = [
    silk_LTP_gain_BITS_Q5_0,
    silk_LTP_gain_BITS_Q5_1,
    silk_LTP_gain_BITS_Q5_2
];

const silk_LTP_gain_vq_0 = [
    new Uint8Array([4,      6,     24,      7,      5]),
    new Uint8Array([0,      0,      2,      0,      0]),
    new Uint8Array([12,     28,     41,     13,     -4]),
    new Uint8Array([-9,     15,     42,     25,     14]),
    new Uint8Array([1,     -2,     62,     41,     -9]),
    new Uint8Array([-10,     37,     65,     -4,      3]),
    new Uint8Array([-6,      4,     66,      7,     -8]),
    new Uint8Array([16,     14,     38,     -3,     33]),
];

const silk_LTP_gain_vq_1 = [
    new Int8Array([13,     22,     39,     23,     12]),
    new Int8Array([-1,     36,     64,     27,     -6]),
    new Int8Array([-7,     10,     55,     43,     17]),
    new Int8Array([1,      1,      8,      1,      1]),
    new Int8Array([6,    -11,     74,     53,     -9]),
    new Int8Array([-12,     55,     76,    -12,      8]),
    new Int8Array([-3,      3,     93,     27,     -4]),
    new Int8Array([26,     39,     59,      3,     -8]),
    new Int8Array([2,      0,     77,     11,      9]),
    new Int8Array([-8,     22,     44,     -6,      7]),
    new Int8Array([40,      9,     26,      3,      9]),
    new Int8Array([-7,     20,    101,     -7,      4]),
    new Int8Array([3,     -8,     42,     26,      0]),
    new Int8Array([-15,     33,     68,      2,     23]),
    new Int8Array([-2,     55,     46,     -2,     15]),
    new Int8Array([3,     -1,     21,     16,     41]),
]

const silk_LTP_gain_vq_2 = [
	new Int8Array([-6,     27,     61,     39,      5]),
	new Int8Array([-11,     42,     88,      4,      1]),
    new Int8Array([-2,     60,     65,      6,     -4]),
    new Int8Array([-1,     -5,     73,     56,      1]),
    new Int8Array([-9,     19,     94,     29,     -9]),
    new Int8Array([0,     12,     99,      6,      4]),
    new Int8Array([8,    -19,    102,     46,    -13]),
    new Int8Array([3,      2,     13,      3,      2]),
    new Int8Array([9,    -21,     84,     72,    -18]),
    new Int8Array([-11,     46,    104,    -22,      8]),
    new Int8Array([18,     38,     48,     23,      0]),
    new Int8Array([-16,     70,     83,    -21,     11]),
    new Int8Array([5,    -11,    117,     22,     -8]),
    new Int8Array([-6,     23,    117,    -12,      3]),
    new Int8Array([3,     -8,     95,     28,      4]),
    new Int8Array([-10,     15,     77,     60,    -15]),
    new Int8Array([-1,      4,    124,      2,     -4]),
    new Int8Array([3,     38,     84,     24,    -25]),
    new Int8Array([2,     13,     42,     13,     31]),
    new Int8Array([21,     -4,     56,     46,     -1]),
    new Int8Array([-1,     35,     79,    -13,     19]),
    new Int8Array([-7,     65,     88,     -9,    -14]),
    new Int8Array([20,      4,     81,     49,    -29]),
    new Int8Array([20,      0,     75,      3,    -17]),
    new Int8Array([5,     -9,     44,     92,     -8]),
    new Int8Array([1,     -3,     22,     69,     31]),
    new Int8Array([-6,     95,     41,    -12,      5]),
    new Int8Array([39,     67,     16,     -4,      1]),
    new Int8Array([0,     -6,    120,     55,    -36]),
    new Int8Array([-13,     44,    122,      4,    -24]),
    new Int8Array([81,      5,     11,      3,      7]),
    new Int8Array([2,      0,      9,     10,     88]),
];

const silk_LTP_vq_ptrs_Q7 = [
    silk_LTP_gain_vq_0,
    silk_LTP_gain_vq_1,
    silk_LTP_gain_vq_2
];

/* Maximum frequency-dependent response of the pitch taps above,
   computed as max(abs(freqz(taps))) */
const silk_LTP_gain_vq_0_gain = new Uint8Array([
      46,      2,     90,     87,     93,     91,     82,     98
]);

const silk_LTP_gain_vq_1_gain = new Uint8Array([
     109,    120,    118,     12,    113,    115,    117,    119,
      99,     59,     87,    111,     63,    111,    112,     80
]);

const silk_LTP_gain_vq_2_gain = new Uint8Array([
     126,    124,    125,    124,    129,    121,    126,     23,
     132,    127,    127,    127,    126,    127,    122,    133,
     130,    134,    101,    118,    119,    145,    126,     86,
     124,    120,    123,    119,    170,    173,    107,    109
]);

const silk_LTP_vq_gain_ptrs_Q7 = [
    silk_LTP_gain_vq_0_gain,
    silk_LTP_gain_vq_1_gain,
    silk_LTP_gain_vq_2_gain
];

const silk_LTP_vq_sizes = new Uint8Array([
    8, 16, 32
]);

/* tables_other.c */
const silk_LTPscale_iCDF = new Uint8Array([ 128, 64, 0 ]);

/* tables_pulses_per_block.c */
const silk_shell_code_table0 = new Uint8Array([
       128,      0,    214,     42,      0,    235,    128,     21,
         0,    244,    184,     72,     11,      0,    248,    214,
       128,     42,      7,      0,    248,    225,    170,     80,
        25,      5,      0,    251,    236,    198,    126,     54,
        18,      3,      0,    250,    238,    211,    159,     82,
        35,     15,      5,      0,    250,    231,    203,    168,
       128,     88,     53,     25,      6,      0,    252,    238,
       216,    185,    148,    108,     71,     40,     18,      4,
         0,    253,    243,    225,    199,    166,    128,     90,
        57,     31,     13,      3,      0,    254,    246,    233,
       212,    183,    147,    109,     73,     44,     23,     10,
         2,      0,    255,    250,    240,    223,    198,    166,
       128,     90,     58,     33,     16,      6,      1,      0,
       255,    251,    244,    231,    210,    181,    146,    110,
        75,     46,     25,     12,      5,      1,      0,    255,
       253,    248,    238,    221,    196,    164,    128,     92,
        60,     35,     18,      8,      3,      1,      0,    255,
       253,    249,    242,    229,    208,    180,    146,    110,
        76,     48,     27,     14,      7,      3,      1,      0
]);

const silk_shell_code_table1 = new Uint8Array([
       129,      0,    207,     50,      0,    236,    129,     20,
         0,    245,    185,     72,     10,      0,    249,    213,
       129,     42,      6,      0,    250,    226,    169,     87,
        27,      4,      0,    251,    233,    194,    130,     62,
        20,      4,      0,    250,    236,    207,    160,     99,
        47,     17,      3,      0,    255,    240,    217,    182,
       131,     81,     41,     11,      1,      0,    255,    254,
       233,    201,    159,    107,     61,     20,      2,      1,
         0,    255,    249,    233,    206,    170,    128,     86,
        50,     23,      7,      1,      0,    255,    250,    238,
       217,    186,    148,    108,     70,     39,     18,      6,
         1,      0,    255,    252,    243,    226,    200,    166,
       128,     90,     56,     30,     13,      4,      1,      0,
       255,    252,    245,    231,    209,    180,    146,    110,
        76,     47,     25,     11,      4,      1,      0,    255,
       253,    248,    237,    219,    194,    163,    128,     93,
        62,     37,     19,      8,      3,      1,      0,    255,
       254,    250,    241,    226,    205,    177,    145,    111,
        79,     51,     30,     15,      6,      2,      1,      0
]);

const silk_shell_code_table2 = new Uint8Array([
       129,      0,    203,     54,      0,    234,    129,     23,
         0,    245,    184,     73,     10,      0,    250,    215,
       129,     41,      5,      0,    252,    232,    173,     86,
        24,      3,      0,    253,    240,    200,    129,     56,
        15,      2,      0,    253,    244,    217,    164,     94,
        38,     10,      1,      0,    253,    245,    226,    189,
       132,     71,     27,      7,      1,      0,    253,    246,
       231,    203,    159,    105,     56,     23,      6,      1,
         0,    255,    248,    235,    213,    179,    133,     85,
        47,     19,      5,      1,      0,    255,    254,    243,
       221,    194,    159,    117,     70,     37,     12,      2,
         1,      0,    255,    254,    248,    234,    208,    171,
       128,     85,     48,     22,      8,      2,      1,      0,
       255,    254,    250,    240,    220,    189,    149,    107,
        67,     36,     16,      6,      2,      1,      0,    255,
       254,    251,    243,    227,    201,    166,    128,     90,
        55,     29,     13,      5,      2,      1,      0,    255,
       254,    252,    246,    234,    213,    183,    147,    109,
        73,     43,     22,     10,      4,      2,      1,      0
]);

const silk_shell_code_table3 = new Uint8Array([
       130,      0,    200,     58,      0,    231,    130,     26,
         0,    244,    184,     76,     12,      0,    249,    214,
       130,     43,      6,      0,    252,    232,    173,     87,
        24,      3,      0,    253,    241,    203,    131,     56,
        14,      2,      0,    254,    246,    221,    167,     94,
        35,      8,      1,      0,    254,    249,    232,    193,
       130,     65,     23,      5,      1,      0,    255,    251,
       239,    211,    162,     99,     45,     15,      4,      1,
         0,    255,    251,    243,    223,    186,    131,     74,
        33,     11,      3,      1,      0,    255,    252,    245,
       230,    202,    158,    105,     57,     24,      8,      2,
         1,      0,    255,    253,    247,    235,    214,    179,
       132,     84,     44,     19,      7,      2,      1,      0,
       255,    254,    250,    240,    223,    196,    159,    112,
        69,     36,     15,      6,      2,      1,      0,    255,
       254,    253,    245,    231,    209,    176,    136,     93,
        55,     27,     11,      3,      2,      1,      0,    255,
       254,    253,    252,    239,    221,    194,    158,    117,
        76,     42,     18,      4,      3,      2,      1,      0
]);

const silk_shell_code_table_offsets = new Uint8Array([
         0,      0,      2,      5,      9,     14,     20,     27,
        35,     44,     54,     65,     77,     90,    104,    119,
       135
]);


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

/* shell_coder.c */
function silk_shell_decoder(pulses0, rangeDec, pulses4) {
    const decode_split = (child1, child2, rangeDec, p, shell_table) => {
        if (p > 0) {
            const r = rangeDec.ec_dec_icdf(shell_table.slice(silk_shell_code_table_offsets[p]), 8);
            child1[0] = r; 
            child2[0] = p - child1[0];
        } else {
            child1[0] = 0;
            child2[0] = 0;
        }
    };
    const pulses3 = new Int16Array(2);
    const pulses2 = new Int16Array(4);
    const pulses1 = new Int16Array(8);

    /* this function operates on one shell code frame of 16 pulses */
    // silk_assert( SHELL_CODEC_FRAME_LENGTH == 16 );

    //console.log('STELL1', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    decode_split(pulses3.subarray(0), pulses3.subarray(1), rangeDec, pulses4, silk_shell_code_table3);

    decode_split(pulses2.subarray(0), pulses2.subarray(1), rangeDec, pulses3[0], silk_shell_code_table2);

    decode_split(pulses1.subarray(0), pulses1.subarray(1), rangeDec, pulses2[0], silk_shell_code_table1);
    decode_split(pulses0.subarray(0), pulses0.subarray(1), rangeDec, pulses1[0], silk_shell_code_table0);
    decode_split(pulses0.subarray(2), pulses0.subarray(3), rangeDec, pulses1[1], silk_shell_code_table0);

    decode_split(pulses1.subarray(2), pulses1.subarray(3), rangeDec, pulses2[1], silk_shell_code_table1);
    decode_split(pulses0.subarray(4), pulses0.subarray(5), rangeDec, pulses1[2], silk_shell_code_table0);
    decode_split(pulses0.subarray(6), pulses0.subarray(7), rangeDec, pulses1[3], silk_shell_code_table0);

    decode_split(pulses2.subarray(2), pulses2.subarray(3), rangeDec, pulses3[1], silk_shell_code_table2);

    decode_split(pulses1.subarray(4), pulses1.subarray(5), rangeDec, pulses2[2], silk_shell_code_table1);
    decode_split(pulses0.subarray(8), pulses0.subarray(9), rangeDec, pulses1[4], silk_shell_code_table0);
    decode_split(pulses0.subarray(10), pulses0.subarray(11), rangeDec, pulses1[5], silk_shell_code_table0);

    decode_split(pulses1.subarray(6), pulses1.subarray(7), rangeDec, pulses2[3], silk_shell_code_table1);
    decode_split(pulses0.subarray(12), pulses0.subarray(13), rangeDec, pulses1[6], silk_shell_code_table0);
    decode_split(pulses0.subarray(14), pulses0.subarray(15), rangeDec, pulses1[7], silk_shell_code_table0);
    //console.log('STELL7', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
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
    if (condCoding === CODE_CONDITIONALLY) {
        state.indices.GainsIndices[0] = rangeDec.ec_dec_icdf(silk_delta_gain_iCDF, 8 );
    } else {
        state.indices.GainsIndices[0] = rangeDec.ec_dec_icdf(silk_gain_iCDF[ state.indices.signalType ], 8 );
        state.indices.GainsIndices[0] += rangeDec.ec_dec_icdf(silk_uniform8_iCDF, 8 );
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

    for (let i = 0; i < silk_NLSF_CB_WB.order; i++) {
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

    /* Decode LSF interpolation factor */
    if (state.nb_subfr === MAX_NB_SUBFR) {
        state.indices.NLSFInterpCoef_Q2 = rangeDec.ec_dec_icdf(silk_NLSF_interpolation_factor_iCDF, 8) & 0xff;
    } else {
        state.indices.NLSFInterpCoef_Q2 = 4;
    }

    //console.log('ITELL8', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    if (state.indices.signalType === SIGNAL_TYPES.VOICED) {
        /*********************/
        /* Decode pitch lags */
        /*********************/
        /* Get lag index */
        let decode_absolute_lagIndex = 1;
        if (condCoding === CODE_CONDITIONALLY && state.ec_prevSignalType === SIGNAL_TYPES.VOICED) {
            /* Decode Delta index */
            let delta_lagIndex = rangeDec.ec_dec_icdf(silk_pitch_delta_iCDF, 8 );
            if (delta_lagIndex > 0) {
                delta_lagIndex = delta_lagIndex - 9;
                state.indices.lagIndex = state.ec_prevLagIndex + delta_lagIndex;
                decode_absolute_lagIndex = 0;
            }
        }
        if (decode_absolute_lagIndex) {
            /* Absolute decoding */
            state.indices.lagIndex = rangeDec.ec_dec_icdf( silk_pitch_lag_iCDF, 8 ) * silk_RSHIFT( state.fs_kHz, 1 );
            state.indices.lagIndex += rangeDec.ec_dec_icdf(state.pitch_lag_low_bits_iCDF, 8 );
        }
        state.ec_prevLagIndex = state.indices.lagIndex;

        /* Get countour index */
        state.indices.contourIndex = rangeDec.ec_dec_icdf(state.pitch_contour_iCDF, 8 );

        /********************/
        /* Decode LTP gains */
        /********************/
        /* Decode PERIndex value */
        state.indices.PERIndex = rangeDec.ec_dec_icdf(silk_LTP_per_index_iCDF, 8 );

        for(let k = 0; k < state.nb_subfr; k++ ) {
            state.indices.LTPIndex[ k ] = rangeDec.ec_dec_icdf(silk_LTP_gain_iCDF_ptrs[ state.indices.PERIndex ], 8 );
        }

		/**********************/
        /* Decode LTP scaling */
        /**********************/
        if(condCoding == CODE_INDEPENDENTLY ) {
            state.indices.LTP_scaleIndex = rangeDec.ec_dec_icdf( silk_LTPscale_iCDF, 8 );
        } else {
            state.indices.LTP_scaleIndex = 0;
        }
    }

	state.ec_prevSignalType = state.indices.signalType;

	/***************/
	/* Decode seed */
	/***************/
    state.indices.Seed = rangeDec.ec_dec_icdf(silk_uniform4_iCDF, 8);
    //console.log('ITELL9', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
}

function silk_decode_pulses(rangeDec, pulses, signalType, quantOffsetType, frame_length) {
    //console.log('PTELL1', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
    const sum_pulses = new Int32Array(MAX_NB_SHELL_BLOCKS);
    const nLshifts = new Int32Array(MAX_NB_SHELL_BLOCKS);

    const RateLevelIndex = rangeDec.ec_dec_icdf(silk_rate_levels_iCDF[ signalType >> 1 ], 8 );
    //console.log('PTELL2', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);

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
            silk_shell_decoder(pulses.slice(silk_SMULBB( i, SHELL_CODEC_FRAME_LENGTH )), rangeDec, sum_pulses[ i ] );
        } else {
        }
    }
    console.log('PTELL4', rangeDec.ec_tell(), rangeDec.nbits_total, rangeDec.val, rangeDec.rng);
}
