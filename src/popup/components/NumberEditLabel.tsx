import { useCallback, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";

const EditLabelInput = styled.input`
  padding: 4px 2px;
  font-size: 11px;
  font-family: inherit;
  width: 4em;
  border: none;
`;

const EditLabelText = styled.div`
  padding: 4px 2px;
  font-size: 11px;
  font-family: inherit;
  user-select: none;
  overflow: visible;
  color: ${({ theme }) => theme.colors.controlLabel};
`;

type NumberEditLabelProps = {
  value: number,
  label: string,
  min?: number,
  max?: number,
  disabled?: boolean,
  onChange: (value: number) => void
};

function NumberEditLabel({
  value,
  label,
  min,
  max,
  onChange,
  disabled = false
}: NumberEditLabelProps) {
  const [ edit, setEdit ] = useState(false);
  const [ lastValidValue, setLastValidValue ] = useState(value);
  const [ valInternal, setValInternal ] = useState("");
  const inputRef = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    if (edit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [edit]);

  const labelClicked = useCallback(() => {
    if (disabled) return;
    setValInternal(value.toString());
    setEdit(true);
  }, [disabled, value]);

  const handleBlur = useCallback(() => {
    let f = parseFloat(valInternal);
    if (isNaN(f)) {
      setValInternal(lastValidValue.toString());
      setEdit(false);
      return;
    }
    if (min && f < min) {
      f = min;
    }
    if (max && f > max) {
      f = max;
    }
    setLastValidValue(f);
    setValInternal(f.toString());
    setEdit(false);
    onChange(f);
  }, [valInternal, min, max, onChange, lastValidValue]);

  const handleInput = useCallback((e: React.InputEvent<HTMLInputElement>) => {
    setValInternal((e.target as HTMLInputElement).value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <div className="themed controlLabel">
      {edit ? (
        <EditLabelInput
          type="text"
          className="edit-label-input"
          value={valInternal}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
      ) : (
        <EditLabelText onClick={labelClicked}>{label}</EditLabelText>
      )}
    </div>
  );
}

export { NumberEditLabel };
