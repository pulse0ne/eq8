import { useCallback } from "react";
import { styled } from "styled-components";

const CheckboxElement = styled.div<Omit<CheckboxProps, "onChange">>`
  border: 1px solid ${({ theme }) => theme.colors.controlTrack};
  background-color: ${({ disabled, checked, theme }) => disabled ? theme.colors.disabled : checked ? theme.colors.accentPrimary : "transparent"};
  min-width: 12px;
  max-width: 12px;
  min-height: 12px;
  max-height: 12px;
`;

type CheckboxProps = {
  checked: boolean,
  disabled?: boolean,
  onChange: (nv: boolean) => void
};

function Checkbox({
  checked,
  disabled = false,
  onChange
}: CheckboxProps) {
  const handler = useCallback(() => {
    if (disabled) return;
    onChange(!checked);
  }, [checked, disabled, onChange]);

  return (
    <CheckboxElement checked={checked} disabled={disabled} onClick={handler} className="themed controlTrack accentPrimary disabled" />
  );
}

export { Checkbox };
