const z: string[] = [];
for (let i = 0; i < 256; i++) {
  z.push((i < 16 ? "0" : "") + i.toString(16));
}

export default () => {
  const a = Math.random() * 0xffffffff | 0;
  const b = Math.random() * 0xffffffff | 0;
  const c = Math.random() * 0xffffffff | 0;
  const d = Math.random() * 0xffffffff | 0;
  return `${z[a&0xff]}${z[a>>8&0xff]}${z[a>>16&0xff]}${z[a>>24&0xff]}-${z[b&0xff]}${z[b>>8&0xff]}-${z[b>>16&0x0f|0x40]}${z[b>>24&0xff]}-${z[c&0x3f|0x80]}${z[c>>8&0xff]}-${z[c>>16&0xff]}${z[c>>24&0xff]}${z[d&0xff]}${z[d>>8&0xff]}${z[d>>16&0xff]}${z[d>>24&0xff]}`;
};
