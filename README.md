# @ninja-bit/melody

Lightweight melody maker for React.

Build and listen 2-3min music file under 1kB.

## Install

```sh
npm install @ninja-bit/melody
```

## Usage

```typescript jsx
import { BitMelody } from '@ninja-bit/melody';
import '@ninja-bit/melody/style.css';

const Container = () => <BitMelody />
```

## Props

```typescript jsx
interface BitMelodyProps {
  // base64 string of music file, Read-Only if provided
  base64?: string;

  // Callback to use base64 string of music file
  onMint?: (base64: string) => void;
}
```

## Contributing

Require node.js, built on node 20

```sh
# Install dependencies
npm install

# Run dev server
npm run dev
```

And usual pull request flow.

## Inspiration

- Inspired by the [Music Box Fun](https://github.com/bryanbraun/music-box-fun) project.
