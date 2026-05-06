import { FREQ_START } from "../audio-constants.ts";

export type FilterParams = {
  id: string,
  frequency: number,
  gain: number,
  q: number,
  type: BiquadFilterType
};

export const FILTER_PARAM_MAPPING: Record<BiquadFilterType, { usesGain: boolean, usesQ: boolean }> = {
  allpass: { usesGain: false, usesQ: true },
  bandpass: { usesGain: false, usesQ: true },
  highpass: { usesGain: false, usesQ: true },
  highshelf: { usesGain: true, usesQ: false },
  lowpass: { usesGain: false, usesQ: true },
  lowshelf: { usesGain: true, usesQ: false },
  notch: { usesGain: false, usesQ: true },
  peaking: { usesGain: true, usesQ: true }
};

export interface IFilter {
  id: string,

  getFrequency(): number,
  setFrequency(freq: number): void,

  getGain(): number,
  setGain(gain: number): void,

  getQ(): number,
  setQ(q: number): void,

  getType(): BiquadFilterType,
  setType(type: BiquadFilterType): void,

  usesQ(): boolean,
  usesGain(): boolean,

  toFilterParams(): FilterParams
}

export class DisplayFilterNode implements IFilter {
  id: string;
  private node: FilterParams;

  constructor(id: string) {
    this.id = id;
    this.node = { id, frequency: FREQ_START, gain: 0.0, q: 1.0, type: "peaking" };
  }

  getFrequency(): number {
    return this.node.frequency;
  }

  setFrequency(freq: number): void {
    this.node.frequency = freq;
  }

  getGain(): number {
    return this.node.gain;
  }

  setGain(gain: number): void {
    this.node.gain = gain;
  }

  getQ(): number {
    return this.node.q;
  }

  setQ(q: number): void {
    this.node.q = q;
  }

  getType(): BiquadFilterType {
    return this.node.type;
  }

  setType(type: BiquadFilterType): void {
    this.node.type = type;
  }

  usesQ(): boolean {
    return FILTER_PARAM_MAPPING[this.node.type].usesQ;
  }

  usesGain(): boolean {
    return FILTER_PARAM_MAPPING[this.node.type].usesGain;
  }

  toFilterParams(): FilterParams {
    return {
      id: this.id,
      frequency: this.getFrequency(),
      gain: this.getGain(),
      q: this.getQ(),
      type: this.getType()
    };
  }

  static fromFilterParams(params: FilterParams): DisplayFilterNode {
    const node = new DisplayFilterNode(params.id);
    node.setType(params.type);
    node.setFrequency(params.frequency);
    node.setGain(params.gain);
    node.setQ(params.q);
    return node;
  }
}

export type FilterChanges = {
  frequency?: number,
  gain?: number,
  q?: number,
  type?: BiquadFilterType
};
