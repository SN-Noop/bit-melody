import { useEffect } from 'react';
import * as Tone from 'tone';
import { HALF_BEAT_HEIGHT } from '../../constants.ts';
import { BitMelodyConfig, BitMelodyData } from '../../types.ts';

export const usePlayMelody = (
  config: BitMelodyConfig,
  data: BitMelodyData,
  synth: Tone.PolySynth,
) => {
  useEffect(() => {
    const element = document.getElementById('player-scroller');
    if (!config.isPlaying || !element) return;
    Tone.start().catch(() => undefined);

    const dataLength = Math.ceil(data.length / 8) * 8;
    const scrollRate = (HALF_BEAT_HEIGHT * 2 * (config.tempo || 120)) / 60000;
    let initialScrollTop = element.scrollTop;
    let startTime: number;
    let animationFrameId: number;
    let lastPlayedIndex = -1;

    const scrollPage = (timestamp: number) => {
      const nextScrollTop =
        scrollRate * (timestamp - startTime) + initialScrollTop;

      element.scrollTo(0, nextScrollTop);

      const playIndex = Math.round(
        (nextScrollTop - HALF_BEAT_HEIGHT - 6) / HALF_BEAT_HEIGHT,
      );

      if (playIndex !== lastPlayedIndex)
        data[playIndex]?.length &&
          synth.triggerAttackRelease(data[playIndex], '16n');

      if (playIndex === dataLength)
        initialScrollTop =
          HALF_BEAT_HEIGHT - 6 - scrollRate * (timestamp - startTime);

      lastPlayedIndex = playIndex;
      animationFrameId = requestAnimationFrame(scrollPage);
    };
    animationFrameId = requestAnimationFrame((timestamp) => {
      startTime = timestamp;
      scrollPage(timestamp);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.isPlaying, config.tempo, data, synth]);
};
