export function buildCsvDownloadDisposition(fileName: string) {
  const fallback = "download.csv";
  const encoded = encodeRFC5987ValueChars(fileName);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function encodeRFC5987ValueChars(value: string) {
  return encodeURIComponent(value).replaceAll(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
