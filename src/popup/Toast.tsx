import { useEffect } from "react";
import { styled } from "styled-components";
import { HBox, Icon, VBox } from "./components/index.tsx";

const ToastWrapper = styled.div`
  position: absolute;
  z-index: 99999;
  left: 12px;
  bottom: 12px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  max-width: 300px;
`;

const ToastMessage = styled(VBox)`
  font-size: 11px;
`;

export type ToastProps = {
  messages: string[],
  glyph: string,
  onClose: () => void,
  timeoutMs?: number
};

function Toast({
  messages,
  glyph,
  onClose,
  timeoutMs = 5000
}: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onClose, timeoutMs);
    return () => clearTimeout(id);
  }, [onClose, timeoutMs]);
  return (
    <ToastWrapper>
      <HBox $alignItems="center" style={{ gap: "6px" }}>
        <Icon glyph={glyph} />
        <ToastMessage>{messages.map(m => <span key={m}>{m}</span>)}</ToastMessage>
      </HBox>
    </ToastWrapper>
  );
}

export { Toast };
