import { ChangeEvent, FC } from 'react';
import { BitMelodyConfig } from '../types.ts';
import classes from './ConfigInputs.module.scss';

interface ConfigInputsProps {
  config: BitMelodyConfig;
  setConfig: (config: BitMelodyConfig) => void;
}

export const ConfigInputs: FC<ConfigInputsProps> = ({ config, setConfig }) => {
  const handleChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === 'checkbox')
      return setConfig({
        ...config,
        [name]: e.target.checked,
      });

    const value = e.target.value
      ? Math.abs(parseInt(e.target.value))
      : undefined;

    if (name === 'tempo' && value !== undefined)
      return setConfig({
        ...config,
        [name]: Math.min(200, value),
      });

    if (name === 'octaveCount' && value !== undefined)
      return setConfig({
        ...config,
        [name]: Math.min(5, Math.max(1, value)),
      });

    setConfig({ ...config, [name]: value });
  };

  return (
    <>
      <label className={classes.configLabel}>
        Tempo:
        <input
          type="number"
          min={0}
          max={200}
          step={10}
          value={config.tempo}
          onChange={handleChange('tempo')}
        />
      </label>
      <label className={classes.configLabel}>
        Octaves:
        <input
          type="number"
          min={1}
          max={5}
          value={config.octaveCount}
          onChange={handleChange('octaveCount')}
        />
      </label>
      <label className={classes.configLabel}>
        With #:
        <input
          type="checkbox"
          checked={config.withAccidentals}
          onChange={handleChange('withAccidentals')}
        />
      </label>
      <label className={classes.configLabel}>
        <span>
          <span className={classes.clef}>𝄞</span> Clef:
        </span>
        <input
          type="number"
          min={0}
          max={5}
          step={1}
          value={config.trebleClef}
          onChange={handleChange('trebleClef')}
        />
      </label>
      <label className={classes.configLabel}>
        <span>
          <span className={classes.clef}>𝄢</span> Clef:
        </span>
        <input
          type="number"
          min={0}
          max={5}
          step={1}
          value={config.bassClef}
          onChange={handleChange('bassClef')}
        />
      </label>
      <label className={classes.configLabel}>
        Scroll play:
        <input
          type="checkbox"
          checked={config.scrollPlay}
          onChange={handleChange('scrollPlay')}
        />
      </label>
    </>
  );
};
