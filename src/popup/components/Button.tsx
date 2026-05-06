import { ButtonHTMLAttributes } from "react";
import { styled } from "styled-components";

const StyledButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.accentPrimary};
  border-radius: 4px;
  padding: 6px 10px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.accentPrimary};
  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    border-color: ${({ theme }) => theme.colors.disabled};
  }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentSecondary};
    outline-offset: -2px;
  }
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.background};
    cursor: pointer;
  }
`;

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => <StyledButton {...props} className={`themed accentSecondary accentPrimary disabled background ${props.className ?? ""}`} />;

export { Button };
