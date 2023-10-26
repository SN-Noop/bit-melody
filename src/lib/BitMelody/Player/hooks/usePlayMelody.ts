import { useEffect, useState } from 'react';
import * as Tone from 'tone';
import { HALF_BEAT_HEIGHT } from '../../constants.ts';
import { BitMelodyConfig, BitMelodyData } from '../../types.ts';

export const usePlayMelody = (
  config: BitMelodyConfig,
  data: BitMelodyData,
  synth: Tone.PolySynth,
) => {
  const [documentIsHidden, setDocumentIsHidden] = useState(document.hidden);

  useEffect(() => {
    const element = document.getElementById('player-scroller');
    if (!config.isPlaying || !element) return;
    Tone.start().catch(() => undefined);

    const dataLength = Math.ceil(data.length / 8) * 8;
    const scrollRate = (HALF_BEAT_HEIGHT * 2 * (config.tempo || 120)) / 60000;
    let initialScrollTop = element.scrollTop;
    let startTime: number;
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;
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

      documentIsHidden
        ? (timeoutId = setTimeout(() => scrollPage(Date.now()), 20))
        : (animationFrameId = requestAnimationFrame(scrollPage));
    };

    if (documentIsHidden) {
      startTime = Date.now();
      scrollPage(Date.now());
    } else {
      animationFrameId = requestAnimationFrame((timestamp) => {
        startTime = timestamp;
        scrollPage(timestamp);
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [config.isPlaying, config.tempo, data, documentIsHidden, synth]);

  useEffect(() => {
    const visibilityChangeHandler = () => {
      setDocumentIsHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);

    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, []);
};
