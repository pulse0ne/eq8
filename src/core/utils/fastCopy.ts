export default function fastCopy<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}
