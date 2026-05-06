function toDecibel(scalar: number): number {
  return 20 * Math.log10(scalar);
}

function toScalar(decibel: number): number {
  return Math.pow(10, decibel / 20);
}

export {
  toDecibel,
  toScalar
};
