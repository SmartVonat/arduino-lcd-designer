import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Trash2, Palette, Upload, GripVertical } from 'lucide-react';

const EMPTY_PIXELS = () => Array(8).fill(null).map(() => Array(5).fill(0));
const EMPTY_GRID = () => Array(2).fill(null).map(() => Array(16).fill(' '));

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// --- Embedded Hardware Font Data ---
const FONT_DATA = `
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 8
    { 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F }, // Char 9 special "Full white"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 10 special "Horizontal lines"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 11 special "Horizontal lines"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 12 special "Horizontal lines"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 13 special "Horizontal lines"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 14 special "Horizontal lines"
    { 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x1F, 0x00 }, // Char 15 special "Horizontal lines"
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 16
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 17
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 18
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 19
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 20
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 21
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 22
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 23
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 24
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 25
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 26
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 27
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 28
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 29
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 30
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 31
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 32 
    { 0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x04, 0x00 }, // Char 33 !
    { 0x0A, 0x0A, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 34 "
    { 0x0A, 0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x0A, 0x00 }, // Char 35 #
    { 0x04, 0x0F, 0x14, 0x0E, 0x05, 0x1E, 0x04, 0x00 }, // Char 36 $
    { 0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03, 0x00 }, // Char 37 %
    { 0x0C, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0D, 0x00 }, // Char 38 &
    { 0x0C, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 39 '
    { 0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02, 0x00 }, // Char 40 (
    { 0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08, 0x00 }, // Char 41 )
    { 0x00, 0x04, 0x15, 0x0E, 0x15, 0x04, 0x00, 0x00 }, // Char 42 *
    { 0x00, 0x04, 0x04, 0x1F, 0x04, 0x04, 0x00, 0x00 }, // Char 43 +
    { 0x00, 0x00, 0x00, 0x00, 0x0C, 0x04, 0x08, 0x00 }, // Char 44 ,
    { 0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00, 0x00 }, // Char 45 -
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C, 0x00 }, // Char 46 .
    { 0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00 }, // Char 47 /
    { 0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E, 0x00 }, // Char 48 0
    { 0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00 }, // Char 49 1
    { 0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F, 0x00 }, // Char 50 2
    { 0x1F, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0E, 0x00 }, // Char 51 3
    { 0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02, 0x00 }, // Char 52 4
    { 0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E, 0x00 }, // Char 53 5
    { 0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E, 0x00 }, // Char 54 6
    { 0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08, 0x00 }, // Char 55 7
    { 0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E, 0x00 }, // Char 56 8
    { 0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C, 0x00 }, // Char 57 9
    { 0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x0C, 0x00, 0x00 }, // Char 58 :
    { 0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x04, 0x08, 0x00 }, // Char 59 ;
    { 0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02, 0x00 }, // Char 60 <
    { 0x00, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x00, 0x00 }, // Char 61 =
    { 0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08, 0x00 }, // Char 62 >
    { 0x0E, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04, 0x00 }, // Char 63 ?
    { 0x0E, 0x11, 0x01, 0x0D, 0x15, 0x15, 0x0E, 0x00 }, // Char 64 @
    { 0x0E, 0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x00 }, // Char 65 A
    { 0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E, 0x00 }, // Char 66 B
    { 0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E, 0x00 }, // Char 67 C
    { 0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C, 0x00 }, // Char 68 D
    { 0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F, 0x00 }, // Char 69 E
    { 0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10, 0x00 }, // Char 70 F
    { 0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F, 0x00 }, // Char 71 G
    { 0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11, 0x00 }, // Char 72 H
    { 0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00 }, // Char 73 I
    { 0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C, 0x00 }, // Char 74 J
    { 0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11, 0x00 }, // Char 75 K
    { 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F, 0x00 }, // Char 76 L
    { 0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11, 0x00 }, // Char 77 M
    { 0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x00 }, // Char 78 N
    { 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00 }, // Char 79 O
    { 0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10, 0x00 }, // Char 80 P
    { 0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D, 0x00 }, // Char 81 Q
    { 0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11, 0x00 }, // Char 82 R
    { 0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E, 0x00 }, // Char 83 S
    { 0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00 }, // Char 84 T
    { 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00 }, // Char 85 U
    { 0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04, 0x00 }, // Char 86 V
    { 0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0A, 0x00 }, // Char 87 W
    { 0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11, 0x00 }, // Char 88 X
    { 0x11, 0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x00 }, // Char 89 Y
    { 0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F, 0x00 }, // Char 90 Z
    { 0x0E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x0E, 0x00 }, // Char 91 [
    { 0x11, 0x0A, 0x1F, 0x04, 0x1F, 0x04, 0x04, 0x00 }, // Char 92
    { 0x0E, 0x02, 0x02, 0x02, 0x02, 0x02, 0x0E, 0x00 }, // Char 93 ]
    { 0x04, 0x0A, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 94 ^
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x00 }, // Char 95 _
    { 0x08, 0x04, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 96 \`
    { 0x00, 0x00, 0x0E, 0x01, 0x0F, 0x11, 0x0F, 0x00 }, // Char 97 a
    { 0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1E, 0x00 }, // Char 98 b
    { 0x00, 0x00, 0x0E, 0x10, 0x10, 0x11, 0x0E, 0x00 }, // Char 99 c
    { 0x01, 0x01, 0x0D, 0x13, 0x11, 0x11, 0x0F, 0x00 }, // Char 100 d
    { 0x00, 0x00, 0x0E, 0x11, 0x1F, 0x10, 0x0E, 0x00 }, // Char 101 e
    { 0x06, 0x09, 0x08, 0x1C, 0x08, 0x08, 0x08, 0x00 }, // Char 102 f
    { 0x00, 0x0F, 0x11, 0x11, 0x0F, 0x01, 0x0E, 0x00 }, // Char 103 g
    { 0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11, 0x00 }, // Char 104 h
    { 0x04, 0x00, 0x0C, 0x04, 0x04, 0x04, 0x0E, 0x00 }, // Char 105 i
    { 0x02, 0x00, 0x06, 0x02, 0x02, 0x12, 0x0C, 0x00 }, // Char 106 j
    { 0x10, 0x10, 0x12, 0x14, 0x18, 0x14, 0x12, 0x00 }, // Char 107 k
    { 0x0C, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00 }, // Char 108 l
    { 0x00, 0x00, 0x1A, 0x15, 0x15, 0x11, 0x11, 0x00 }, // Char 109 m
    { 0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11, 0x00 }, // Char 110 n
    { 0x00, 0x00, 0x0E, 0x11, 0x11, 0x11, 0x0E, 0x00 }, // Char 111 o
    { 0x00, 0x00, 0x1E, 0x11, 0x1E, 0x10, 0x10, 0x00 }, // Char 112 p
    { 0x00, 0x00, 0x0D, 0x13, 0x0F, 0x01, 0x01, 0x00 }, // Char 113 q
    { 0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10, 0x00 }, // Char 114 r
    { 0x00, 0x00, 0x0E, 0x10, 0x0E, 0x01, 0x1E, 0x00 }, // Char 115 s
    { 0x08, 0x08, 0x1C, 0x08, 0x08, 0x09, 0x06, 0x00 }, // Char 116 t
    { 0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0D, 0x00 }, // Char 117 u
    { 0x00, 0x00, 0x11, 0x11, 0x11, 0x0A, 0x04, 0x00 }, // Char 118 v
    { 0x00, 0x00, 0x11, 0x11, 0x15, 0x15, 0x0A, 0x00 }, // Char 119 w
    { 0x00, 0x00, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x00 }, // Char 120 x
    { 0x00, 0x00, 0x11, 0x11, 0x0F, 0x01, 0x0E, 0x00 }, // Char 121 y
    { 0x00, 0x00, 0x1F, 0x02, 0x04, 0x08, 0x1F, 0x00 }, // Char 122 z
    { 0x02, 0x04, 0x04, 0x08, 0x04, 0x04, 0x02, 0x00 }, // Char 123 {
    { 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00 }, // Char 124 |
    { 0x08, 0x04, 0x04, 0x02, 0x04, 0x04, 0x08, 0x00 }, // Char 125 }
    { 0x00, 0x04, 0x02, 0x1F, 0x02, 0x04, 0x00, 0x00 }, // Char 126 special "Right arrow"
    { 0x00, 0x04, 0x08, 0x1F, 0x08, 0x04, 0x00, 0x00 }, // Char 127 special "Left arrow"
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 128
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 129
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 130
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 131
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 132
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 133
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 134
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 135
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 136
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 137
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 138
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 139
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 140
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 141
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 142
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 143
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 144
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 145
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 146
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 147
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 148
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 149
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 150
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 151
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 152
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 153
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 154
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 155
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 156
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 157
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 158
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 159
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 160
    { 0x00, 0x00, 0x00, 0x00, 0x1C, 0x14, 0x1C, 0x00 }, // Char 161 special
    { 0x07, 0x04, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00 }, // Char 162 special
    { 0x00, 0x00, 0x00, 0x04, 0x04, 0x04, 0x1C, 0x00 }, // Char 163 special
    { 0x00, 0x00, 0x00, 0x00, 0x10, 0x08, 0x04, 0x00 }, // Char 164 special
    { 0x00, 0x00, 0x00, 0x0C, 0x0C, 0x00, 0x00, 0x00 }, // Char 165 special
    { 0x00, 0x1F, 0x01, 0x1F, 0x01, 0x02, 0x04, 0x00 }, // Char 166 special
    { 0x00, 0x00, 0x1F, 0x01, 0x06, 0x04, 0x08, 0x00 }, // Char 167 special
    { 0x00, 0x00, 0x02, 0x04, 0x0C, 0x14, 0x04, 0x00 }, // Char 168 special
    { 0x00, 0x00, 0x04, 0x1F, 0x11, 0x01, 0x06, 0x00 }, // Char 169 special "Kazan"
    { 0x00, 0x00, 0x00, 0x1F, 0x04, 0x04, 0x1F, 0x00 }, // Char 170 special
    { 0x00, 0x00, 0x02, 0x1F, 0x06, 0x0A, 0x12, 0x00 }, // Char 171 special
    { 0x00, 0x00, 0x08, 0x1F, 0x09, 0x0A, 0x08, 0x00 }, // Char 172 special
    { 0x00, 0x00, 0x00, 0x0E, 0x02, 0x02, 0x1F, 0x00 }, // Char 173 special "Reverse E"
    { 0x00, 0x00, 0x1E, 0x02, 0x1E, 0x02, 0x1E, 0x00 }, // Char 174 special "Reverse E"
    { 0x00, 0x00, 0x00, 0x15, 0x15, 0x01, 0x06, 0x00 }, // Char 175 special "Radiator"
    { 0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00, 0x00 }, // Char 176 special "Dash"
    { 0x1F, 0x01, 0x05, 0x06, 0x04, 0x04, 0x08, 0x00 }, // Char 177 special
    { 0x01, 0x02, 0x04, 0x0C, 0x14, 0x04, 0x04, 0x00 }, // Char 178 special
    { 0x04, 0x1F, 0x11, 0x11, 0x01, 0x02, 0x04, 0x00 }, // Char 179 special
    { 0x00, 0x1F, 0x04, 0x04, 0x04, 0x04, 0x1F, 0x00 }, // Char 180 special
    { 0x02, 0x1F, 0x02, 0x06, 0x0A, 0x12, 0x02, 0x00 }, // Char 181 special
    { 0x08, 0x1F, 0x09, 0x09, 0x09, 0x09, 0x12, 0x00 }, // Char 182 special
    { 0x04, 0x1F, 0x04, 0x1F, 0x04, 0x04, 0x04, 0x00 }, // Char 183 special
    { 0x00, 0x0F, 0x09, 0x11, 0x01, 0x02, 0x0C, 0x00 }, // Char 184 special
    { 0x08, 0x0F, 0x12, 0x02, 0x02, 0x02, 0x04, 0x00 }, // Char 185 special
    { 0x00, 0x1F, 0x01, 0x01, 0x01, 0x01, 0x1F, 0x00 }, // Char 186 special
    { 0x0A, 0x1F, 0x0A, 0x0A, 0x02, 0x04, 0x08, 0x00 }, // Char 187 special
    { 0x00, 0x18, 0x01, 0x19, 0x01, 0x02, 0x1C, 0x00 }, // Char 188 special
    { 0x00, 0x1F, 0x01, 0x02, 0x04, 0x0A, 0x11, 0x00 }, // Char 189 special
    { 0x08, 0x1F, 0x09, 0x0A, 0x08, 0x08, 0x07, 0x00 }, // Char 190 special
    { 0x00, 0x11, 0x11, 0x09, 0x01, 0x02, 0x0C, 0x00 }, // Char 191 special
    { 0x00, 0x0F, 0x09, 0x15, 0x03, 0x02, 0x0C, 0x00 }, // Char 192 special
    { 0x02, 0x1C, 0x04, 0x1F, 0x04, 0x04, 0x08, 0x00 }, // Char 193 special
    { 0x00, 0x15, 0x15, 0x15, 0x01, 0x02, 0x04, 0x00 }, // Char 194 special "Radiator 2"
    { 0x0E, 0x00, 0x1F, 0x04, 0x04, 0x04, 0x08, 0x00 }, // Char 195 special
    { 0x08, 0x08, 0x08, 0x0C, 0x0A, 0x08, 0x08, 0x00 }, // Char 196 special
    { 0x04, 0x04, 0x1F, 0x04, 0x04, 0x08, 0x10, 0x00 }, // Char 197 special
    { 0x00, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x00 }, // Char 198 special
    { 0x00, 0x1F, 0x01, 0x0A, 0x04, 0x0A, 0x10, 0x00 }, // Char 199 special
    { 0x04, 0x1F, 0x02, 0x04, 0x0E, 0x15, 0x04, 0x00 }, // Char 200 special
    { 0x02, 0x02, 0x02, 0x02, 0x02, 0x04, 0x08, 0x00 }, // Char 201 special
    { 0x00, 0x04, 0x02, 0x11, 0x11, 0x11, 0x11, 0x00 }, // Char 202 special
    { 0x10, 0x10, 0x1F, 0x10, 0x10, 0x10, 0x0F, 0x00 }, // Char 203 special
    { 0x00, 0x1F, 0x01, 0x01, 0x01, 0x02, 0x0C, 0x00 }, // Char 204 special
    { 0x00, 0x08, 0x14, 0x02, 0x01, 0x01, 0x00, 0x00 }, // Char 205 special
    { 0x04, 0x1F, 0x04, 0x04, 0x15, 0x15, 0x04, 0x00 }, // Char 206 special
    { 0x00, 0x1F, 0x01, 0x01, 0x0A, 0x04, 0x02, 0x00 }, // Char 207 special
    { 0x00, 0x0E, 0x00, 0x0E, 0x00, 0x0E, 0x01, 0x00 }, // Char 208 special
    { 0x00, 0x04, 0x08, 0x10, 0x11, 0x1F, 0x01, 0x00 }, // Char 209 special
    { 0x00, 0x01, 0x01, 0x0A, 0x04, 0x0A, 0x10, 0x00 }, // Char 210 special
    { 0x00, 0x1F, 0x08, 0x1F, 0x08, 0x08, 0x07, 0x00 }, // Char 211 special
    { 0x08, 0x08, 0x1F, 0x09, 0x0A, 0x08, 0x08, 0x00 }, // Char 212 special
    { 0x00, 0x0E, 0x02, 0x02, 0x02, 0x02, 0x1F, 0x00 }, // Char 213 special
    { 0x00, 0x1F, 0x01, 0x1F, 0x01, 0x01, 0x1F, 0x00 }, // Char 214 special
    { 0x0E, 0x00, 0x1F, 0x01, 0x01, 0x02, 0x04, 0x00 }, // Char 215 special
    { 0x12, 0x12, 0x12, 0x12, 0x02, 0x04, 0x08, 0x00 }, // Char 216 special
    { 0x00, 0x04, 0x14, 0x14, 0x15, 0x15, 0x16, 0x00 }, // Char 217 special
    { 0x00, 0x10, 0x10, 0x11, 0x12, 0x14, 0x18, 0x00 }, // Char 218 special
    { 0x00, 0x1F, 0x11, 0x11, 0x11, 0x11, 0x1F, 0x00 }, // Char 219 special "Box"
    { 0x00, 0x1F, 0x11, 0x11, 0x01, 0x02, 0x04, 0x00 }, // Char 220 special
    { 0x00, 0x18, 0x00, 0x01, 0x01, 0x02, 0x1C, 0x00 }, // Char 221 special
    { 0x04, 0x12, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 222 special
    { 0x1C, 0x14, 0x1C, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 223 special "Degree"
    { 0x00, 0x00, 0x09, 0x15, 0x12, 0x12, 0x0D, 0x00 }, // Char 224 special
    { 0x0A, 0x00, 0x0E, 0x01, 0x0F, 0x11, 0x0F, 0x00 }, // Char 225 special
    { 0x00, 0x00, 0x0E, 0x11, 0x1E, 0x11, 0x1E, 0x10 }, // Char 226 special "Beta"
    { 0x00, 0x00, 0x0E, 0x10, 0x0C, 0x11, 0x0E, 0x00 }, // Char 227 special
    { 0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x1D, 0x10 }, // Char 228 special "Mu"
    { 0x00, 0x00, 0x0F, 0x14, 0x12, 0x11, 0x0E, 0x00 }, // Char 229 special
    { 0x00, 0x00, 0x06, 0x09, 0x11, 0x11, 0x1E, 0x10 }, // Char 230 special
    { 0x00, 0x00, 0x0F, 0x11, 0x11, 0x11, 0x0F, 0x01 }, // Char 231 special
    { 0x00, 0x00, 0x07, 0x04, 0x04, 0x14, 0x08, 0x00 }, // Char 232 special "Delta"
    { 0x00, 0x02, 0x1A, 0x02, 0x00, 0x00, 0x00, 0x00 }, // Char 233 special
    { 0x02, 0x00, 0x06, 0x02, 0x02, 0x02, 0x02, 0x02 }, // Char 234 special
    { 0x00, 0x14, 0x08, 0x14, 0x00, 0x00, 0x00, 0x00 }, // Char 235 special "Asterisk"
    { 0x00, 0x04, 0x0E, 0x14, 0x15, 0x0E, 0x04, 0x00 }, // Char 236 special
    { 0x08, 0x08, 0x1C, 0x08, 0x1C, 0x08, 0x0F, 0x00 }, // Char 237 special
    { 0x0E, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11, 0x00 }, // Char 238 special
    { 0x0A, 0x00, 0x0E, 0x11, 0x11, 0x11, 0x0E, 0x00 }, // Char 239 ö
    { 0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x1E, 0x10 }, // Char 240 special
    { 0x00, 0x00, 0x0D, 0x13, 0x11, 0x11, 0x0F, 0x01 }, // Char 241 special
    { 0x00, 0x0E, 0x11, 0x1F, 0x11, 0x11, 0x0E, 0x00 }, // Char 242 special "Kazan 2"
    { 0x00, 0x00, 0x00, 0x0B, 0x15, 0x1A, 0x00, 0x00 }, // Char 243 special
    { 0x00, 0x00, 0x0E, 0x11, 0x11, 0x0A, 0x1B, 0x00 }, // Char 244 special "Ohmega"
    { 0x0A, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0D, 0x00 }, // Char 245 ü
    { 0x1F, 0x10, 0x08, 0x04, 0x08, 0x10, 0x1F, 0x00 }, // Char 246 special "Sum"
    { 0x00, 0x00, 0x1F, 0x0A, 0x0A, 0x0A, 0x13, 0x00 }, // Char 247 special "Pi"
    { 0x1F, 0x00, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x00 }, // Char 248 special "X overline"
    { 0x00, 0x00, 0x11, 0x11, 0x11, 0x11, 0x0F, 0x01 }, // Char 249 special
    { 0x00, 0x01, 0x1E, 0x04, 0x1F, 0x04, 0x04, 0x00 }, // Char 250 special
    { 0x00, 0x00, 0x1F, 0x08, 0x0F, 0x09, 0x11, 0x00 }, // Char 251 special
    { 0x00, 0x00, 0x1F, 0x15, 0x1F, 0x11, 0x11, 0x00 }, // Char 252 special
    { 0x00, 0x00, 0x04, 0x00, 0x1F, 0x00, 0x04, 0x00 }, // Char 253 ÷
    { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }, // Char 254
`;

const LCD_FONT = {};
const CHAR_TO_CODE = {};
const SPECIAL_CHARS = [];

const initFont = () => {
  const lines = FONT_DATA.trim().split('\n');
  const seenPixels = new Set();
  let unnamedCounter = 1;

  lines.forEach(line => {
    const dataMatch = line.match(/\{\s*([^}]+)\s*\}/);
    if (!dataMatch) return;
    const hexStrs = dataMatch[1].split(',').map(s => s.trim());
    const bytes = hexStrs.map(h => parseInt(h, 16));
    if (bytes.length !== 8) return;

    // Regex to parse the comment suffix: // Char {code} [special] ["Title"] [char_symbol]
    const commentMatch = line.match(/\/\/\s*Char\s+(\d+)(?:\s+(special))?(?:\s+"([^"]+)")?(?:\s+(.*))?/);
    if (!commentMatch) return;

    const code = parseInt(commentMatch[1], 10);
    const isSpecial = !!commentMatch[2];
    const title = commentMatch[3];
    let charMap = commentMatch[4] ? commentMatch[4].trim() : '';

    // Hardcode overrides for completely empty/hidden standard mappings based on the user array
    if (code === 32) charMap = ' ';
    if (code === 92) charMap = '\\';

    const isEmpty = bytes.every(b => b === 0);
    
    // Convert 5 bits per row into 8x5 pixel array
    const pixels = bytes.map(b => [16, 8, 4, 2, 1].map(mask => (b & mask) ? 1 : 0));
    const pixelStr = JSON.stringify(pixels);

    LCD_FONT[code] = pixels;

    if (isSpecial && !isEmpty) {
      if (!seenPixels.has(pixelStr)) {
        seenPixels.add(pixelStr);
        const hasTitle = !!title;
        const finalTitle = title || `Special ${unnamedCounter++}`;
        SPECIAL_CHARS.push({ code, title: finalTitle, pixels, hasTitle });
      }
    } else if (!isSpecial && !isEmpty && charMap) {
      CHAR_TO_CODE[charMap] = code;
    } else if (code === 32) {
      CHAR_TO_CODE[' '] = 32;
    }
  });

  // Sort Specials: Ones with explicit titles go to the top, then sort by Code.
  SPECIAL_CHARS.sort((a, b) => {
    if (a.hasTitle && !b.hasTitle) return -1;
    if (!a.hasTitle && b.hasTitle) return 1;
    return a.code - b.code;
  });
};
initFont();

const FALLBACK_CHAR = [
  [1,1,1,1,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,1,0,1],
  [1,0,1,0,1], [1,0,0,0,1], [1,1,1,1,1], [0,0,0,0,0]
]; // Square with dot

// --- Sub-components ---

const CustomChar = React.memo(({ pixels, className = "" }) => {
  return (
    <div className={`grid grid-rows-8 grid-cols-5 gap-[1px] ${className}`}>
      {pixels.map((row, r) =>
        row.map((on, c) => (
          <div key={`${r}-${c}`} className={`${on ? 'bg-[var(--lcd-pixel-on)]' : 'bg-[var(--lcd-pixel-off)]'}`} />
        ))
      )}
    </div>
  );
});

const Cell = React.memo(({ cardId, row, col, value, onUpdate, onFocusNext, customChars }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); onFocusNext(cardId, row, col + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onFocusNext(cardId, row, col - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); onFocusNext(cardId, row - 1, col); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onFocusNext(cardId, row + 1, col); }
    else if (e.key === 'Backspace') {
      e.preventDefault();
      const isEmpty = (typeof value !== 'object') && (value === ' ' || value === '' || value === null);
      if (!isEmpty) {
        onUpdate(cardId, row, col, ' ');
      } else {
        let nextR = row;
        let nextC = col - 1;
        if (nextC < 0) { nextC = 15; nextR--; }
        if (nextR >= 0) {
          onUpdate(cardId, nextR, nextC, ' ');
          onFocusNext(cardId, nextR, nextC);
        }
      }
    }
    else if (e.key === 'Delete') {
      e.preventDefault();
      onUpdate(cardId, row, col, ' ');
    }
    else if (e.key.length === 1) { 
      e.preventDefault();
      const charStr = e.key;
      if (CHAR_TO_CODE[charStr] !== undefined) {
        onUpdate(cardId, row, col, charStr);
        onFocusNext(cardId, row, col + 1); // Fixed missing cardId here
      }
    }
  };

  const getPixels = () => {
    if (typeof value === 'object') {
      if (value?.custom) {
        const char = customChars.find(c => c.id === value.custom);
        return char ? char.pixels : EMPTY_PIXELS();
      }
      if (value?.special !== undefined) {
        return LCD_FONT[value.special] || EMPTY_PIXELS();
      }
    }
    const charStr = value || ' ';
    const code = CHAR_TO_CODE[charStr];
    return code !== undefined && LCD_FONT[code] ? LCD_FONT[code] : FALLBACK_CHAR;
  };

  let tooltip = "";
  if (typeof value === 'object') {
    if (value?.special !== undefined) {
      const sp = SPECIAL_CHARS.find(s => s.code === value.special);
      tooltip = `Code: ${value.special}${sp?.title ? ` (${sp.title})` : ''}`;
    }
    else if (value?.custom !== undefined) tooltip = `Custom Character`;
  } else {
    const charStr = value || ' ';
    const code = CHAR_TO_CODE[charStr];
    if (code !== undefined) tooltip = `Code: ${code}`;
  }

  return (
    <div
      id={`cell-${cardId}-${row}-${col}`}
      tabIndex={0}
      title={tooltip}
      className={`w-[29px] h-[41px] flex items-center justify-center outline-none focus:ring-2 focus:ring-inset cursor-text relative bg-[var(--lcd-cell-bg)] focus:bg-[var(--lcd-cell-focus)] focus:ring-[var(--lcd-cell-ring)]`}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.currentTarget.focus()}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.filter = 'brightness(1.1)'; }}
      onDragLeave={(e) => { e.currentTarget.style.filter = ''; }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.filter = '';
        const customId = e.dataTransfer.getData('customCharId');
        const specialCode = e.dataTransfer.getData('specialCharCode');
        
        if (customId) onUpdate(cardId, row, col, { custom: customId });
        else if (specialCode) onUpdate(cardId, row, col, { special: parseInt(specialCode, 10) });
      }}
    >
      <CustomChar pixels={getPixels()} className="w-[19px] h-[31px] pointer-events-none" />
    </div>
  );
});

// --- Main Application ---

export default function App() {
  const [cards, setCards] = useState([]);
  const [customChars, setCustomChars] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [theme, setTheme] = useState('blue');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Drag and drop state for cards
  const [draggableCardId, setDraggableCardId] = useState(null);
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(null);

  useEffect(() => {
    try {
      const savedCards = localStorage.getItem('lcd-cards');
      const savedChars = localStorage.getItem('lcd-chars');
      const savedTheme = localStorage.getItem('lcd-theme');
      
      if (savedCards) setCards(JSON.parse(savedCards));
      else setCards([{ id: generateId(), title: 'Screen 1', grid: EMPTY_GRID() }]);
      
      if (savedChars) setCustomChars(JSON.parse(savedChars));
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {
      console.error('Failed to load from cache', e);
      setCards([{ id: generateId(), title: 'Screen 1', grid: EMPTY_GRID() }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('lcd-cards', JSON.stringify(cards));
        localStorage.setItem('lcd-chars', JSON.stringify(customChars));
        localStorage.setItem('lcd-theme', theme);
      } catch (e) {
        console.error('Failed to save to cache', e);
      }
    }
  }, [cards, customChars, theme, isLoaded]);

  // --- Handlers ---

  const addCard = () => {
    setCards([...cards, {
      id: generateId(),
      title: `Screen ${cards.length + 1}`,
      grid: EMPTY_GRID()
    }]);
  };

  const deleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const updateCardTitle = (id, newTitle) => {
    setCards(prev => prev.map(card => card.id === id ? { ...card, title: newTitle } : card));
  };

  const updateCell = React.useCallback((cardId, row, col, val) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      const newGrid = card.grid.map((r, rIdx) => 
        rIdx === row ? r.map((c, cIdx) => cIdx === col ? val : c) : r
      );
      return { ...card, grid: newGrid };
    }));
  }, []);

  const focusCell = React.useCallback((cardId, r, c) => {
    let nextR = r;
    let nextC = c;
    if (nextC > 15) { nextC = 0; nextR++; }
    if (nextC < 0) { nextC = 15; nextR--; }
    if (nextR < 0 || nextR > 1) return;

    const el = document.getElementById(`cell-${cardId}-${nextR}-${nextC}`);
    if (el) el.focus();
  }, []);

  const addCustomChar = () => {
    const newChar = { id: generateId(), pixels: EMPTY_PIXELS() };
    setCustomChars(prev => [...prev, newChar]);
    setActiveCharId(newChar.id);
  };

  const deleteCustomChar = (id) => {
    setCustomChars(prev => prev.filter(c => c.id !== id));
    if (activeCharId === id) setActiveCharId(null);
    setCards(prev => prev.map(card => ({
      ...card,
      grid: card.grid.map(row => row.map(cell => 
        (typeof cell === 'object' && cell?.custom === id) ? ' ' : cell
      ))
    })));
  };

  const togglePixel = (r, c) => {
    setCustomChars(prev => prev.map(char => {
      if (char.id !== activeCharId) return char;
      const newPixels = char.pixels.map((row, rowIndex) =>
        rowIndex === r ? row.map((val, colIndex) => colIndex === c ? (val ? 0 : 1) : val) : row
      );
      return { ...char, pixels: newPixels };
    }));
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.cards && data.customChars) {
          setCards(data.cards);
          setCustomChars(data.customChars);
        } else {
          alert("Invalid layout file format.");
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
        alert("Failed to read the file. Please ensure it is a valid JSON design export.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const exportData = () => {
    const data = { cards, customChars };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arduino_lcd_designs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Card Drag Handlers
  const handleDragStartCard = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardIndex', index);
  };

  const handleDragOverCard = (e, index) => {
    e.preventDefault();
    if (draggedCardIndex !== null && draggedCardIndex !== index) {
      setDragOverCardIndex(index);
    }
  };

  const handleDropCard = (e, index) => {
    e.preventDefault();
    setDragOverCardIndex(null);
    const draggedIndexStr = e.dataTransfer.getData('cardIndex');
    if (draggedIndexStr === "" || draggedIndexStr == null) return;
    
    const draggedIndex = parseInt(draggedIndexStr, 10);
    if (draggedIndex === index) return;

    const newCards = [...cards];
    const draggedCardItem = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCardItem);
    
    setCards(newCards);
    setDraggedCardIndex(null);
  };

  if (!isLoaded) return null;

  return (
    <div className={`theme-${theme} flex h-screen w-screen bg-gray-100 font-sans overflow-hidden text-gray-800`}>
      <style>{`
        .theme-blue {
          --lcd-text: #ffffff;
          --lcd-cell-bg: #0055ff;
          --lcd-cell-focus: #3377ff;
          --lcd-cell-ring: #ffffff;
          --lcd-pcb: #002288;
          --lcd-grid-container: #0044dd;
          --lcd-pixel-on: #ffffff;
          --lcd-pixel-off: rgba(255, 255, 255, 0.1);
          --lcd-editor-off: #3377ff;
          --lcd-editor-hover: #5599ff;
        }
        .theme-green {
          --lcd-text: #1c260d;
          --lcd-cell-bg: #8cd92b;
          --lcd-cell-focus: #9ee13f;
          --lcd-cell-ring: #1c260d;
          --lcd-pcb: #5a8d1a;
          --lcd-grid-container: #82ce1e;
          --lcd-pixel-on: #1c260d;
          --lcd-pixel-off: rgba(0, 0, 0, 0.05);
          --lcd-editor-off: #96d136;
          --lcd-editor-hover: #88c22d;
        }
      `}</style>
      
      {/* Left Panel: Display Cards */}
      <div className="flex-1 flex flex-col h-full relative border-r border-gray-200 shadow-[2px_0_8px_rgba(0,0,0,0.05)] z-10">
        <header className="absolute top-0 w-full h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-20">
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Arduino LCD Designer</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setTheme('green')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${theme === 'green' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Green
              </button>
              <button 
                onClick={() => setTheme('blue')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${theme === 'blue' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Blue
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input type="file" accept=".json" id="import-file" className="hidden" onChange={handleImport} />
              <label 
                htmlFor="import-file" 
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer border border-gray-200"
              >
                <Upload className="w-4 h-4" /> Import Designs
              </label>

              <button 
                onClick={exportData}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" /> Export Designs
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 mt-16 p-6 overflow-y-auto flex flex-col items-center gap-8 pb-12">
          {cards.map((card, index) => (
            <div 
              key={card.id} 
              draggable={draggableCardId === card.id}
              onDragStart={(e) => handleDragStartCard(e, index)}
              onDragOver={(e) => handleDragOverCard(e, index)}
              onDragLeave={() => setDragOverCardIndex(null)}
              onDrop={(e) => handleDropCard(e, index)}
              onDragEnd={() => { setDraggedCardIndex(null); setDragOverCardIndex(null); }}
              className={`bg-white rounded-xl shadow-sm border p-6 w-full max-w-3xl flex flex-col transition-all ${
                dragOverCardIndex === index ? 'border-blue-500 shadow-md transform scale-[1.01]' : 'border-gray-200'
              } ${draggedCardIndex === index ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    onMouseEnter={() => setDraggableCardId(card.id)}
                    onMouseLeave={() => setDraggableCardId(null)}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    title="Drag to reorder screens"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <input 
                    value={card.title}
                    onChange={(e) => updateCardTitle(card.id, e.target.value)}
                    className="bg-transparent text-xl font-bold text-gray-800 outline-none focus:border-b-2 border-blue-500 placeholder-gray-400 w-full px-1 py-1"
                    placeholder="Enter Screen Title..."
                  />
                </div>
                <button 
                  onClick={() => deleteCard(card.id)} 
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors ml-4"
                  title="Delete Card"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Hardware LCD Bezel */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 flex items-center justify-center shadow-xl mx-auto w-fit">
                {/* PCB Trace Outline */}
                <div className={`p-1.5 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)] bg-[var(--lcd-pcb)]`}>
                  {/* Actual Screen Grid */}
                  <div className={`p-2 flex flex-col gap-[2px] shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] bg-[var(--lcd-grid-container)]`}>
                    {card.grid.map((row, r) => (
                      <div key={r} className="flex gap-[2px]">
                        {row.map((val, c) => (
                          <Cell
                            key={`${r}-${c}`}
                            cardId={card.id}
                            row={r}
                            col={c}
                            value={val}
                            onUpdate={updateCell}
                            onFocusNext={focusCell}
                            customChars={customChars}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-gray-400 mt-5 text-center font-medium">Click any character cell to start typing. Use Arrow Keys to freely navigate.</p>
            </div>
          ))}

          {/* Add Screen Button */}
          <button 
            onClick={addCard}
            className="w-full max-w-3xl py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3"
          >
            <Plus className="w-8 h-8" />
            <span className="font-semibold text-lg">Add New Screen</span>
          </button>
        </main>
      </div>

      {/* Right Panel: Character Swatches & Editor */}
      <div className="w-96 bg-white flex flex-col h-full z-0">
        
        {/* Baked-in Special Characters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col shadow-sm z-10">
          <h2 className="font-bold text-gray-800 text-sm mb-3">Special Characters</h2>
          <div className="max-h-[160px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {SPECIAL_CHARS.map(char => (
                <div
                  key={char.code}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('specialCharCode', char.code.toString());
                  }}
                  title={`Code: ${char.code}\n${char.title}`}
                  className={`w-[44px] h-[64px] p-[4px] rounded shadow-sm cursor-grab active:cursor-grabbing bg-[var(--lcd-grid-container)] ring-1 ring-black/20 hover:scale-105 hover:shadow-md`}
                >
                  <CustomChar pixels={char.pixels} className="w-full h-full pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Characters Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shadow-sm z-10">
          <h2 className="font-bold text-gray-800 text-sm">Custom Characters</h2>
          <button 
            onClick={addCustomChar} 
            className="p-1.5 hover:bg-blue-100 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-md transition-all shadow-sm"
            title="Create Custom Character"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Characters Swatch */}
        <div className="p-4 border-b border-gray-200 max-h-[160px] overflow-y-auto bg-gray-50/50">
          {customChars.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4 flex flex-col items-center gap-2">
              <Palette className="w-8 h-8 text-gray-300" />
              <p>No characters yet.<br/>Click the + button to create one!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customChars.map(char => (
                <div
                  key={char.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('customCharId', char.id);
                  }}
                  onClick={() => setActiveCharId(char.id)}
                  title="Custom Character"
                  className={`w-[44px] h-[64px] p-[4px] rounded shadow-sm cursor-pointer bg-[var(--lcd-grid-container)] ${
                    activeCharId === char.id ? 'ring-4 ring-blue-500/50 scale-105 z-10' : 'ring-1 ring-black/20 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <CustomChar pixels={char.pixels} className="w-full h-full pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pixel Editor */}
        <div className="flex-1 p-6 bg-white flex flex-col items-center overflow-y-auto">
          {activeCharId ? (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-gray-700 mb-2 w-full text-center uppercase tracking-wider">Pixel Editor</h3>
              <p className="text-[11px] text-gray-500 mb-6 text-center leading-relaxed">
                Click pixels to toggle them on or off. Drag the character from the swatch above onto any display cell.
              </p>
              
              <div className={`p-4 rounded-lg shadow-inner border-[4px] bg-[var(--lcd-grid-container)] border-[var(--lcd-pcb)]`}>
                <div className="grid grid-rows-8 grid-cols-5 gap-[3px] w-[212px] h-[341px]">
                  {customChars.find(c => c.id === activeCharId)?.pixels.map((row, r) =>
                    row.map((on, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => togglePixel(r, c)}
                        className={`cursor-pointer ${on ? 'bg-[var(--lcd-pixel-on)]' : 'bg-[var(--lcd-editor-off)] hover:bg-[var(--lcd-editor-hover)]'}`}
                      />
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={() => deleteCustomChar(activeCharId)}
                className="mt-8 flex items-center justify-center gap-2 px-4 py-2 w-full max-w-[200px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md text-sm font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Character
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
              <Palette className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm text-center px-4 font-medium">Select a character from the swatch or create a new one to begin editing.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}