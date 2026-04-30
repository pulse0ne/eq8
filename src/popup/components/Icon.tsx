import { DetailedHTMLProps, HTMLAttributes } from "react";
import { useTheme } from "styled-components";

export type IconProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  id?: string;
  glyph: string;
  isAudio?: boolean;
  size?: number;
};

function Icon({
  id,
  glyph,
  isAudio = false,
  size = 16,
  onClick,
  style,
  className,
  ...rest
}: IconProps) {
  return (
    <i
      id={id}
      className={`${isAudio ? "fontaudio" : "eqplus"} ${glyph} themed ${className ?? "text"}`}
      style={{ fontSize: `${size}px`, ...style }}
      onClick={onClick}
      {...rest}
    />
  );
}

export type IconButtonProps = IconProps & { disabled?: boolean };

function IconButton({
  id,
  glyph,
  isAudio = false,
  size = 16,
  onClick,
  style,
  disabled = false,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Icon
      id={id}
      glyph={glyph}
      isAudio={isAudio}
      size={size}
      onClick={onClick}
      style={{
        color: disabled ? theme.colors.disabled : theme.colors.accentPrimary,
        cursor: disabled ? "default" : "pointer",
        ...style
      }}
      className="accentPrimary disabled"
      {...rest}
    />
  );
}

export { Icon, IconButton };
