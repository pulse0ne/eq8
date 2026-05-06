import { SelectHTMLAttributes } from "react";
import { styled } from "styled-components";

const StyledSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.selectBorder};
  padding: 0.3em;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.selectBackground};
  color: ${({ theme }) => theme.colors.selectText};
  min-width: 100px;
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
    outline-offset: -2px;
  }
`;

export function NativeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <StyledSelect {...props} className="themed selectBorder selectBackground selectText accentPrimary" />;
}
