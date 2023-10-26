export { bmnToData } from './bmnToData';
export { dataToBmn } from './dataToBmn';
export { getUsableNotes } from './getUsableNotes';

export const bufferToBase64 = async (buffer: Uint8Array) => {
  const base64url = (await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([buffer]));
  })) as string;

  return base64url.slice(base64url.indexOf(',') + 1);
};

export const downloadFile = (fileName: string, url: string) => {
  const anchor = document.createElement('a');

  anchor.setAttribute('href', url);
  anchor.setAttribute('download', fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};
