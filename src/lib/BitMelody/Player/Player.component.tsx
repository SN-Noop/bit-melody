import { FC, MouseEventHandler, useEffect, useMemo, useState } from 'react';
import * as Tone from 'tone';
import { HALF_BEAT_HEIGHT } from '../constants.ts';
import { BitMelodyConfig, BitMelodyData } from '../types';
import { getUsableNotes } from '../utils';
import { PositionStyle, useEditNote } from './hooks/useEditNote.ts';
import { usePlayMelody } from './hooks/usePlayMelody.ts';
import classes from './Player.module.scss';

interface PlayerProps {
  config: BitMelodyConfig;
  data: BitMelodyData;
  title: string;
  readOnly?: boolean;
  setTitle: (title: string) => void;
  onChange: (data: BitMelodyData) => void;
}

export const Player: FC<PlayerProps> = ({
  config,
  data,
  title,
  readOnly = false,
  setTitle,
  onChange,
}) => {
  const [scrollIndex, setScrollIndex] = useState(-1);
  const synth = useMemo(
    () => new Tone.PolySynth(Tone.Synth).toDestination(),
    [],
  );

  usePlayMelody(config, data, synth);

  const usableNotes = useMemo(() => {
    const notes = getUsableNotes(config.octaveCount, config.withAccidentals);
    const notesIndexes = data.flat().map((note) => notes.indexOf(note));
    const minIndex = Math.max(0, Math.min(...notesIndexes) - 1);
    const maxIndex = Math.min(notes.length, Math.max(...notesIndexes) + 2);

    return readOnly
      ? notes
          .slice(minIndex, maxIndex)
          .filter(
            (note, i, arr) =>
              !i ||
              i === arr.length - 1 ||
              !note.match('#') ||
              data.flat().includes(note),
          )
      : notes;
  }, [config.octaveCount, config.withAccidentals, data, readOnly]);

  const { shadowPosition, handleMouseMove, handleMouseLeave, handleClick } =
    useEditNote(config, data, usableNotes, synth, onChange);

  const width = `min(${usableNotes.length}rem, calc(100% - 1rem))`;

  const handleScroll: MouseEventHandler<HTMLDivElement> = (e) => {
    const top = e.currentTarget.scrollTop - HALF_BEAT_HEIGHT;

    if (
      config.isPlaying ||
      top < 0 ||
      (top % HALF_BEAT_HEIGHT > 3 && top % HALF_BEAT_HEIGHT < 21)
    ) {
      setScrollIndex(-1);
      return;
    }

    const index = Math.round(top / HALF_BEAT_HEIGHT);
    setScrollIndex(index);
  };

  useEffect(() => {
    if (
      !config.scrollPlay ||
      config.isPlaying ||
      scrollIndex === -1 ||
      scrollIndex >= data.length
    )
      return;

    data[scrollIndex]?.length &&
      synth.triggerAttackRelease(data[scrollIndex], '16n');
  }, [
    config.isPlaying,
    config.scrollPlay,
    data,
    scrollIndex,
    synth,
    usableNotes,
  ]);

  const notes = data.flatMap(
    (row, yIndex) =>
      row
        .map((note) => ({
          left: `${
            100 * (usableNotes.indexOf(note) / (usableNotes.length - 1))
          }%`,
          top: yIndex * HALF_BEAT_HEIGHT,
        }))
        .filter(Boolean) as PositionStyle[],
  );

  return (
    <div className={classes.playerContainer}>
      <div
        className={`${classes.scroller} ${
          config.isPlaying ? classes.isPlaying : ''
        }`}
        id="player-scroller"
        onScroll={handleScroll}
      >
        <div
          className={classes.notesGrid}
          role="button"
          style={{
            width,
            height: data.length * HALF_BEAT_HEIGHT,
            backgroundSize: `${100 / (usableNotes.length - 1)}% ${
              HALF_BEAT_HEIGHT * 2
            }px`,
          }}
          onMouseMove={!readOnly ? handleMouseMove : undefined}
          onMouseLeave={!readOnly ? handleMouseLeave : undefined}
          onClick={!readOnly ? handleClick : undefined}
        >
          <div className={classes.measure} />
          {!!config.trebleClef && (
            <div
              className={`${classes.trebleClef} ${
                config.withAccidentals ? classes.withAccidentals : ''
              }`}
              style={{
                width: `${
                  (config.withAccidentals ? 1400 : 1000) /
                  (usableNotes.length - 1)
                }%`,
                left: `calc(${
                  ((config.trebleClef - 1) * (config.withAccidentals ? 12 : 7) +
                    (config.withAccidentals ? 4 : 2)) *
                  (100 / (usableNotes.length - 1))
                }% - 1px)`,
              }}
            />
          )}
          {!!config.bassClef && (
            <div
              className={`${classes.bassClef} ${
                config.withAccidentals ? classes.withAccidentals : ''
              }`}
              style={{
                width: `${
                  (config.withAccidentals ? 1500 : 1000) /
                  (usableNotes.length - 1)
                }%`,
                left: `calc(${
                  ((config.bassClef - 1) * (config.withAccidentals ? 12 : 7) +
                    (config.withAccidentals ? 7 : 4)) *
                  (100 / (usableNotes.length - 1))
                }% - 1px)`,
              }}
            />
          )}
          {shadowPosition && (
            <>
              <div
                className={classes.shadowLine}
                style={{ top: shadowPosition.style.top }}
              />
              <div
                className={classes.shadowColumn}
                style={{ left: shadowPosition.style.left }}
              />
              <div
                className={classes.shadowNote}
                style={shadowPosition.style}
              />
            </>
          )}
          {notes.map((note, i) => (
            <div key={i} className={classes.note} style={note} />
          ))}
        </div>
        <div className={classes.overScroll} />
      </div>
      <div
        className={`${classes.noteLabels} ${
          usableNotes.length > 36 ? classes.smallText : ''
        }`}
        style={{ width: `calc(${width} + 1px)` }}
      >
        {usableNotes.map((note, i) => (
          <div
            key={note}
            className={`${classes.noteLabel} ${
              note.includes('#') ? classes.withAccidentals : ''
            } ${
              shadowPosition?.indexes.xIndex === i
                ? classes.activeNoteLabel
                : ''
            }`}
          >
            {note.replace(/#?\d/, '')}
          </div>
        ))}
      </div>

      <div className={classes.title}>
        {readOnly ? (
          title
        ) : (
          <input
            type="text"
            placeholder="Untitled Melody"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
      </div>
      <div className={classes.playLine} />
    </div>
  );
};
