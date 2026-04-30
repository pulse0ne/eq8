export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  const href = URL.createObjectURL(blob);
  link.setAttribute("href", href);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
