import { useCallback, useMemo, useState } from "react";
import { styled } from "styled-components";
import { useEvent } from "../../core/utils/useEvent.ts";
import { HBox, VBox } from "./FlexBox.tsx";

const DialWrapper = styled.div`
  position: relative;
  display: block;
`;

const DialGrip = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
`;

const DialGripTick = styled.div<{disabled: boolean}>`
  user-select: none;
  position: absolute;
  top: 15%;
  left: 50%;
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.accentPrimary};
`;

const DialSvg = styled.svg`
  position: absolute;
  stroke-linecap: round !important;
`;

const DialTrack = styled.path`
  stroke: ${({ theme }) => theme.colors.controlTrack};
  transition: all 0.3s cubic-bezier(0, 0, 0.24, 1);
`;

const DialTrackFill = styled.path<{disabled: boolean}>`
  stroke: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.accentPrimary};
`;

const DialHandle = styled.circle`
  fill: ${({ theme }) => theme.colors.dialKnob};
`;

const DialLabel = styled.span`
  color: ${({ theme }) => theme.colors.controlLabel};
  text-align: center;
  user-select: none;
`;

const Zeroer = styled.i<{ disabled: boolean }>`
  color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.accentPrimary};
  font-size: 14px;
  margin: -2px;
`;

function ZeroerWrapper(props: { disabled: boolean, onZero: () => void }) {
  return (
    <HBox $justifyContent="center">
      <Zeroer disabled={props.disabled} className="eqplus arrow_drop_down" onClick={props.onZero} />
    </HBox>
  );
}

type DialProps = {
  value?: number,
  min?: number,
  max?: number,
  size?: number,
  disabled?: boolean,
  sensitivity?: number,
  onChange?: (value: number) => void,
  label?: string,
  onZero?: () => void
};

type XY = {
  x: number,
  y: number
}

function Dial({
  value = 0,
  min = 0,
  max = 100,
  size = 55,
  disabled = false,
  sensitivity = 2048,
  onChange = () => undefined,
  label,
  onZero
}: DialProps) {
  const [ xy, setXy] = useState<XY>({ x: 0, y: 0 });

  const rotation = useMemo(() => {
    const p = 264 * ((value + Math.abs(min)) / (max - min));
    return p - 132;
  }, [min, max, value]);

  const dialCircleRadius = useMemo(() => size * 0.38, [size]);

  const dialCircleAdjustment = useMemo(() => size * 0.5, [size]);

  const svgStyle: React.CSSProperties = useMemo(() => ({
    strokeDasharray: size * 1.84,
    strokeWidth: `${size * 0.06}px`
  }), [size]);

  const dialStyle: React.CSSProperties = useMemo(() => ({ width: `${size}px`, height: `${size}px` }), [size]);

  const tickStyle: React.CSSProperties = useMemo(() => ({
    width: `${size * 0.08}px`,
    height: `${size * 0.08}px`,
    borderRadius: "50%"
  }), [size]);

  const gripStyle: React.CSSProperties = useMemo(() => ({
    width: `${size * 0.82}px`,
    height: `${size * 0.82}px`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`
  }), [size, rotation]);

  const viewBox = useMemo(() => `0 0 ${size} ${size}`, [size]);

  const trackPath = useMemo(() => {
    const startx = size / 5;
    const starty = size - (size / 4.5);
    const rxy = size * 0.4;
    return `M${startx},${starty} A ${rxy} ${rxy} 0 1 1 ${size - startx} ${starty}`;
  }, [size]);

  const fillStyle: React.CSSProperties = useMemo(() => {
    const s = size;
    const r = rotation;
    const o = s * 1.84;
    const d = o - o * ((r + 132) / 264);
    return {
      strokeDashoffset: d,
      strokeWidth: `${s * 0.06}px`
    };
  }, [size, rotation]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const mouseMove = useEvent((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { pageX, pageY } = e;
    const scaleY = (max - min) / 128;
    const deltaY = (pageY - xy.y) * scaleY;
    setXy({ x: pageX, y: pageY });
    let nv = value - deltaY;
    if (nv < min) {
      nv = min;
    }
    if (nv > max) {
      nv = max;
    }
    if (deltaY !== 0) {
      onChange(nv);
    }
  });

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const mouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const { pageX, pageY } = e;
    setXy({ x: pageX, y: pageY });
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }, [disabled, mouseMove, mouseUp]);

  const mouseWheel = useCallback((e: React.WheelEvent) => {
    if (disabled) return;
    const scale = (max - min) / sensitivity;
    const d = -e.deltaY * scale;
    const nv = Math.max(min, Math.min(value + d, max));
    if (d !== 0) {
      onChange(nv);
    }
  }, [disabled, min, max, sensitivity, value, onChange]);

  const handleZero = useCallback(() => {
    !disabled && onZero?.();
  }, [disabled, onZero]);

  return (
    <VBox className="themed disabled accentPrimary">
      {label && <DialLabel className="themed controlLabel">{label}</DialLabel>}
      {onZero ? (
        <ZeroerWrapper disabled={disabled} onZero={handleZero} />
      ) : (
        <Zeroer disabled={true} className="eqplus arrow_drop_down" style={{ color: "transparent" }} />
      )}
      <DialWrapper style={dialStyle} onDrag={handleDrag} className="themed controlTrack dialKnob">
        <DialGrip style={gripStyle} onMouseDown={mouseDown} onWheel={mouseWheel}>
          <DialGripTick disabled={disabled} style={tickStyle} />
        </DialGrip>
        <DialSvg viewBox={viewBox} style={svgStyle}>
          <DialHandle cx={dialCircleAdjustment} cy={dialCircleAdjustment} r={dialCircleRadius} />
          <DialTrack d={trackPath} fill="none" />
          <DialTrackFill disabled={disabled} d={trackPath} fill="none" style={fillStyle} />
        </DialSvg>
      </DialWrapper>
    </VBox>
  );
}

export {
  Dial
};
