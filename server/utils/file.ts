export const formatBytes = (bytes: number, decimals = 2) => {
  const k = 1024;
  if (bytes < k) return `${bytes} Bytes`;

  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};