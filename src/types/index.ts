export interface Hexagram {
  id: string;
  name: string;
  pinyin: string;
  binary: string; // 从下往上 6 位，1 为阳，0 为阴
  interpretation: {
    title: string;
    content: string[];
  };
}

export type LineType = 6 | 7 | 8 | 9; // 6: 老阴 (3反), 7: 少阳 (1正2反), 8: 少阴 (2正1反), 9: 老阳 (3正)
