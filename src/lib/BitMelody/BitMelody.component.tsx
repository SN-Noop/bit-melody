import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classes from './BitMelody.module.scss';
import { ConfigInputs } from './ConfigInputs';
import { Player } from './Player';
import { BitMelodyConfig, BitMelodyData } from './types';
import {
  bmnToData,
  bufferToBase64,
  dataToBmn,
  downloadFile,
  getUsableNotes,
} from './utils';

interface BitMelodyProps {
  autoPlay?: boolean;
  base64?: string;
  onMint?: (base64: string) => void;
}

export const BitMelody: FC<BitMelodyProps> = ({
  autoPlay = false,
  base64,
  onMint,
}) => {
  const [config, setConfig] = useState<BitMelodyConfig>({
    isPlaying: false,
    octaveCount: 2,
    tempo: 120,
    withAccidentals: false,
    trebleClef: 0,
    bassClef: 0,
    scrollPlay: true,
  });
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const [data, setData] = useState<BitMelodyData>([]);

  const buffer = useMemo(
    () => dataToBmn(title, data, config.tempo),
    [title, data, config.tempo],
  );

  const clearAll = () => {
    setData([]);
    setTitle('');
  };

  const saveToJson = () => {
    if (!data.length) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify({ config: { tempo: config.tempo }, title, data }),
      );
    downloadFile('bit-melody.json', dataStr);
  };

  const saveToBmn = async () => {
    if (!data.length) return;
    const blob = new Blob([buffer], {
      type: 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(blob);
    downloadFile('bit-melody.bmn', url);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const handleMint = async () => {
    if (!data.length) return;
    onMint?.(await bufferToBase64(buffer));
  };

  const handleImport = useCallback(
    (data: BitMelodyData, tempo: number) => {
      const usedNotes = data.flatMap((notes) => notes);
      const withAccidentals = usedNotes.some((note) => note.includes('#'));
      const octaveCount = Math.min(
        ...new Array(5).fill(0).map((_, i) => {
          const notes = getUsableNotes(i + 1, withAccidentals);

          return usedNotes.every((note) => notes.includes(note)) ? i + 1 : 5;
        }),
      );

      setConfig((prev) => ({
        ...prev,
        tempo,
        withAccidentals,
        octaveCount,
        isPlaying: autoPlay,
      }));
      setData(data);
    },
    [autoPlay],
  );

  const importFromJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        setTitle(json.title || '');
        handleImport(json.data, json.config.tempo);
      } catch (e) {
        setError('Error importing json file');
      }
    };
    reader.onerror = () => setError('Error importing json file');
    reader.readAsText(file);

    event.target.value = '';
  };

  const importFromBmn = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
        const { data, tempo, title: parsedTitle } = bmnToData(buffer);

        setTitle(parsedTitle);
        handleImport(data, tempo);
      } catch (e) {
        setError('Error importing bmn file');
      }
    };
    reader.onerror = () => setError('Error importing bmn file');
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  useEffect(() => {
    if (!base64) return;
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const { data, tempo, title: parsedTitle } = bmnToData(buffer);

    setTitle(parsedTitle);
    handleImport(data, tempo);
  }, [base64, handleImport]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  return (
    <div className={`${classes.bitMelody} ${base64 ? classes.readOnly : ''}`}>
      <div className={classes.config}>
        <button
          className={classes.play}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              isPlaying: !prev.isPlaying,
            }))
          }
          disabled={!data.length}
        >
          {config.isPlaying ? '⏸' : '⏵'}
        </button>
        {!base64 && (
          <>
            <ConfigInputs config={config} setConfig={setConfig} />
            <div className={classes.buttons}>
              <button onClick={clearAll}>Clear all</button>
              <button className={classes.importButton}>
                Import Json
                <input type="file" onChange={importFromJson} />
              </button>
              <button className={classes.importButton}>
                Import .bmn
                <input type="file" onChange={importFromBmn} />
              </button>
              <button onClick={saveToJson}>Export to Json</button>
              <button onClick={saveToBmn}>Export to .bmn</button>
              {onMint && (
                <button className={classes.mintButton} onClick={handleMint}>
                  Mint
                </button>
              )}
            </div>
            <div className={!buffer.length || error ? classes.error : ''}>
              {!buffer.length
                ? 'Error create bmn File'
                : error || `${buffer.length} Bytes`}
            </div>
          </>
        )}
        <a
          className={classes.link}
          href="https://github.com/SN-Noop/bit-melody"
          target="_blank"
          rel="noreferrer"
        >
          {!base64 ? 'Github' : 'NinjaBitMelody'}
        </a>
      </div>
      <Player
        config={config}
        data={data}
        title={title}
        setTitle={setTitle}
        onChange={setData}
        readOnly={!!base64}
      />
    </div>
  );
};
