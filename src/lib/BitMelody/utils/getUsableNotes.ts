const BASE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACCIDENTAL_NOTES = ['C', 'D', 'F', 'G', 'A'];

export const getUsableNotes = (octaveCount = 1, withAccidentals = false) => {
  const octaves = Array(octaveCount)
    .fill(0)
    .map(() =>
      BASE_NOTES.flatMap((note) =>
        withAccidentals && ACCIDENTAL_NOTES.includes(note)
          ? [note, `${note}#`]
          : [note],
      ),
    );
  const start =
    octaveCount < 3
      ? 4
      : octaveCount === 3
      ? 3
      : octaveCount === 9
      ? 0
      : Math.max(1, 7 - octaveCount);

  return [
    ...octaves.flatMap((octave, i) =>
      octave.map((note) => `${note}${start + i}`),
    ),
    ...(octaveCount < 8 ? [`C${octaves.length + start}`] : []),
  ];
};
