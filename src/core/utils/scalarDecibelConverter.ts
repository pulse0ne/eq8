function toDecibel(scalar: number): number {
  return 10 * Math.log10(scalar);
}

function toScalar(decibel: number): number {
  return Math.pow(10, decibel / 10);
}

export {
  toDecibel,
  toScalar
};
