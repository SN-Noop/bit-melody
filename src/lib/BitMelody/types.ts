export interface BitMelodyConfig {
  isPlaying: boolean;
  octaveCount: number;
  tempo: number;
  withAccidentals: boolean;
  trebleClef: number;
  bassClef: number;
  scrollPlay: boolean;
}

export type BitMelodyData = string[][];
