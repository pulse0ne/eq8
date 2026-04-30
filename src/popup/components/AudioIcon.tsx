import { styled } from "styled-components";

export type AudioIconProps = {
  glyph: string,
  size?: number
};

const AudioIconStyle = styled.i`
  color: ${({ theme }) => theme.colors.controlLabel};
`;

function AudioIcon ({
  glyph,
  size = 16
}: AudioIconProps) {
  return (
    <AudioIconStyle className={`fontaudio fad-${glyph} themed controlLabel`} style={{ fontSize: `${size}px` }} />
  );
}

export { AudioIcon };
