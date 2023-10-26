import { MouseEventHandler, useState } from 'react';
import * as Tone from 'tone';
import { HALF_BEAT_HEIGHT } from '../../constants.ts';
import { BitMelodyConfig, BitMelodyData } from '../../types.ts';

export interface PositionStyle {
  left: string;
  top: number;
}

interface ShadowPosition {
  style: PositionStyle;
  indexes: { xIndex: number; yIndex: number };
}

export const useEditNote = (
  config: BitMelodyConfig,
  data: BitMelodyData,
  usableNotes: string[],
  synth: Tone.PolySynth,
  onChange: (data: BitMelodyData) => void,
) => {
  const [shadowPosition, setShadowPosition] = useState<ShadowPosition>();

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (config.isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const xIndex = Math.round(
      ((usableNotes.length - 1) * (e.clientX - rect.left)) / rect.width,
    );
    const left = 100 * (xIndex / (usableNotes.length - 1));
    const yIndex = Math.round((e.clientY - rect.top) / HALF_BEAT_HEIGHT);
    const top = yIndex * HALF_BEAT_HEIGHT;

    setShadowPosition({
      style: { left: `${left}%`, top },
      indexes: { xIndex, yIndex },
    });
  };

  const handleMouseLeave = () => setShadowPosition(undefined);

  const handleClick = () => {
    const { xIndex, yIndex } = shadowPosition?.indexes || {};
    if (xIndex === undefined || yIndex === undefined) return;

    const clickedNote = usableNotes[xIndex];
    const newDataLength = yIndex + 1 > data.length ? yIndex + 1 : data.length;

    const newData: BitMelodyData = Array(Math.ceil(newDataLength / 8) * 8)
      .fill(0)
      .map((_, i) => {
        const row = data[i] || [];
        if (yIndex !== i) return row;

        return row.includes(clickedNote)
          ? row.filter((n) => n !== clickedNote)
          : [...row, clickedNote].sort(
              (a, b) => usableNotes.indexOf(a) - usableNotes.indexOf(b),
            );
      })
      .filter(
        (_, i, arr) =>
          !arr.slice(-8 + Math.ceil((i + 1) / 8) * 8).every((r) => !r.length),
      );

    newData[yIndex]?.includes(clickedNote) &&
      synth.triggerAttackRelease(clickedNote, '16n');

    onChange(newData);
  };

  return {
    shadowPosition,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  };
};
