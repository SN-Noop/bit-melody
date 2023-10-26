import { HEADER } from '../constants';
import { getUsableNotes } from './getUsableNotes.ts';

export const bmnToData = (bmn: Uint8Array) => {
  if (!HEADER.every((char, i) => bmn[i] === char))
    throw new Error('Invalid BMN file');

  if (bmn[3] !== 0) throw new Error('Unsupported BMN version');

  const [tempo, measureCount, maxSimultaneousNotes, titleLength] = bmn.slice(
    4,
    8,
  );

  const usedNoteIndex = 8 + titleLength;
  const trackIndex = 14 + usedNoteIndex;

  const title = bmn
    .slice(8, usedNoteIndex)
    .reduce((acc, curr) => acc + String.fromCharCode(curr), '');

  const bytesUsedNotesFromFullNotes = Array.from(
    bmn.slice(usedNoteIndex, trackIndex),
  ).flatMap((byte) => byte.toString(2).padStart(8, '0').split(''));

  const tracks = Array.from(
    bmn.slice(trackIndex, trackIndex + maxSimultaneousNotes * measureCount),
  ).reduce((acc, curr, i) => {
    if (i % measureCount === 0) acc.push([]);

    acc[acc.length - 1] = [
      ...acc[acc.length - 1],
      ...curr.toString(2).padStart(8, '0').split(''),
    ];

    return acc;
  }, [] as string[][]);

  const filteredUsedNotes = getUsableNotes(9, true).filter(
    (_, i) => bytesUsedNotesFromFullNotes[i] === '1',
  );

  const filteredUsedNotesBitSize = Math.ceil(
    Math.log2(filteredUsedNotes.length),
  );

  const tracksNoteIndexes = Array.from(
    bmn.slice(trackIndex + maxSimultaneousNotes * measureCount),
  )
    .flatMap((byte) => byte.toString(2).padStart(8, '0').split(''))
    .reduce((acc, curr, i) => {
      if (i % filteredUsedNotesBitSize === 0) acc.push('');

      acc[acc.length - 1] += curr;
      return acc;
    }, [] as string[])
    .map((byte) => parseInt(byte, 2));

  const data = tracks
    .map((track) =>
      track.map((binary) => {
        if (binary === '0') return [];

        const noteIndex = tracksNoteIndexes.shift();
        if (noteIndex === undefined) throw new Error('Invalid BMN file');

        return [filteredUsedNotes[noteIndex]];
      }),
    )
    .reduce(
      (acc, b) => acc.map((v, i) => [...v, ...b[i]]),
      new Array(tracks[0].length).fill([]),
    );

  return { data, tempo, title };
};
