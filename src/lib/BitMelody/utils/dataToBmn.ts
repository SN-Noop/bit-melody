import { HEADER } from '../constants.ts';
import { BitMelodyData } from '../types.ts';
import { getUsableNotes } from './getUsableNotes.ts';

export const dataToBmn = (
  title: string,
  data: BitMelodyData,
  tempo: number,
) => {
  if (data.length < 8 || data.length % 8)
    return new Uint8Array(22 + title?.length);

  try {
    const version = 0;
    const fullNotes = getUsableNotes(9, true);
    const dataUsedNotes = data.flatMap((row) => row);

    const usedNotesFromFullNotes = fullNotes.map((note) =>
      dataUsedNotes.includes(note) ? note : '',
    );

    const bytesUsedNotesFromFullNotes = usedNotesFromFullNotes
      .reduce((acc, curr, i) => {
        if (i % 8 === 0) acc.push('');
        acc[acc.length - 1] += curr ? '1' : '0';
        return acc;
      }, [] as string[])
      .map((byte) => parseInt(byte.padEnd(8, '0'), 2));

    const measureCount = data.length / 8;
    const maxSimultaneousNotes = Math.max(
      ...data.map((row) => row.filter((note) => note !== ' ').length),
    );

    const tracks = new Array(maxSimultaneousNotes).fill(0).flatMap((_, i) =>
      data
        .reduce((acc, curr, j) => {
          if (j % 8 === 0) acc.push('');
          acc[acc.length - 1] += curr[i] ? '1' : '0';
          return acc;
        }, [] as string[])
        .map((byte) => parseInt(byte.padEnd(8, '0'), 2)),
    );

    const filteredUsedNotes = usedNotesFromFullNotes.filter(Boolean);
    const filteredUsedNotesBitSize = Math.ceil(
      Math.log2(filteredUsedNotes.length),
    );

    const tracksNotes = new Array(maxSimultaneousNotes)
      .fill(0)
      .flatMap((_, i) =>
        data
          .filter((row) => row.length > i)
          .flatMap((row) => {
            const noteIndex = filteredUsedNotes.indexOf(row[i]);
            if (noteIndex === -1) throw new Error('Invalid BMN file');

            return noteIndex
              .toString(2)
              .padStart(filteredUsedNotesBitSize, '0')
              .split('');
          }),
      )
      .reduce((acc, curr, i) => {
        if (i % 8 === 0) acc.push('');
        acc[acc.length - 1] += curr;
        return acc;
      }, [] as string[])
      .map((byte) => parseInt(byte.padEnd(8, '0'), 2));

    const bytesArray = [
      ...HEADER,
      version,
      tempo,
      measureCount,
      maxSimultaneousNotes,
      title.length,
      ...title.split('').map((char) => char.charCodeAt(0)),
      ...bytesUsedNotesFromFullNotes,
      ...tracks,
      ...tracksNotes,
    ];

    return Uint8Array.from(bytesArray);
  } catch (error) {
    return new Uint8Array(0);
  }
};
