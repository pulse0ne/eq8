import isDefined from "./isDefined.js";

export function truncate(raw: string|null|undefined, size: number = 96): string|null|undefined {
  if (isDefined(raw) && raw.length > size) {
    return `${raw.substring(0, size)}...`;
  }
  return raw;
}
