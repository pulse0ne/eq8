import { styled } from "styled-components";
import { Button, Icon, VBox } from "./components/index.tsx";

const IndicatorLayer = styled.div`
  z-index: 999;
  position: absolute;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
`;

const TextOverflowClip = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
`;

const DialogWrapper = styled(VBox)`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  z-index: 9999;
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClickableIcon = styled(Icon)`
  cursor: pointer;
`;

const CloseButton = styled(ClickableIcon)`
  &:hover {
    color: red;
  }
`;

const InlineButton = styled(Button)`
  padding: 2px 6px;
  font-size: 11px;
`;

const InlineInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  padding: 2px;
  font-size: 11px;
`;

const ScrollBox = styled.div`
  height: 200px;
  width: 200px;
  max-width: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export {
  ClickableIcon,
  CloseButton, DialogWrapper, IndicatorLayer, InlineButton,
  InlineInput,
  ScrollBox, TextOverflowClip
};
