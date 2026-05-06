import { DefaultTheme, styled } from "styled-components";

export type FlexBoxProps = {
  id?: string,
  $display?: React.CSSProperties["display"],
  $position?: React.CSSProperties["position"],
  $flex?: React.CSSProperties["flex"],
  $flexBasis?: React.CSSProperties["flexBasis"],
  $flexFlow?: React.CSSProperties["flexFlow"],
  $flexDirection?: React.CSSProperties["flexDirection"],
  $flexGrow?: React.CSSProperties["flexGrow"],
  $flexShrink?: React.CSSProperties["flexShrink"],
  $flexWrap?: React.CSSProperties["flexWrap"],
  $height?: React.CSSProperties["height"],
  $width?: React.CSSProperties["width"],
  $margin?: number,
  $marginTop?: number,
  $marginBottom?: number,
  $marginRight?: number,
  $marginLeft?: number,
  $padding?: number,
  $paddingTop?: number,
  $paddingBottom?: number,
  $paddingRight?: number,
  $paddingLeft?: number,
  $alignContent?: React.CSSProperties["alignContent"],
  $alignItems?: React.CSSProperties["alignItems"],
  $justifyContent?: React.CSSProperties["justifyContent"],
  $justifyItems?: React.CSSProperties["justifyItems"],
  $overflow?: React.CSSProperties["overflow"],
  $theme?: DefaultTheme,
};

export const FlexBox = styled.div<FlexBoxProps>(({
  $display,
  $position,
  $flex,
  $flexBasis,
  $flexFlow,
  $flexDirection,
  $flexGrow,
  $flexShrink,
  $flexWrap,
  $height,
  $width,
  $margin,
  $marginTop,
  $marginBottom,
  $marginRight,
  $marginLeft,
  $padding,
  $paddingTop,
  $paddingBottom,
  $paddingRight,
  $paddingLeft,
  $alignContent,
  $alignItems,
  $justifyContent,
  $justifyItems,
  $overflow
}) => ({
  display: $display ?? "flex",
  position: $position,
  flex: $flex,
  flexBasis: $flexBasis,
  flexFlow: $flexFlow,
  flexDirection: $flexDirection,
  flexGrow: $flexGrow,
  flexShrink: $flexShrink,
  flexWrap: $flexWrap,
  height: $height,
  width: $width,
  margin: $margin === undefined ? undefined : `${4 * $margin}px`,
  marginTop: $marginTop === undefined ? undefined : `${4 * $marginTop}px`,
  marginBottom: $marginBottom === undefined ? undefined : `${4 * $marginBottom}px`,
  marginRight: $marginRight === undefined ? undefined : `${4 * $marginRight}px`,
  marginLeft: $marginLeft === undefined ? undefined : `${4 * $marginLeft}px`,
  padding: $padding === undefined ? undefined : `${4 * $padding}px`,
  paddingTop: $paddingTop === undefined ? undefined : `${4 * $paddingTop}px`,
  paddingBottom: $paddingBottom === undefined ? undefined : `${4 * $paddingBottom}px`,
  paddingRight: $paddingRight === undefined ? undefined : `${4 * $paddingRight}px`,
  paddingLeft: $paddingLeft === undefined ? undefined : `${4 * $paddingLeft}px`,
  alignContent: $alignContent,
  alignItems: $alignItems,
  justifyContent: $justifyContent,
  justifyItems: $justifyItems,
  overflow: $overflow
}));

export const HBox = styled(FlexBox)({
  flexDirection: "row"
});

export type HSpacerProps = {
  size?: number
};

export const HSpacer = styled.div<HSpacerProps>(({ size = 1 }) => `
  width: ${size * 8}px;
  min-width: ${size * 8}px;
  max-width: ${size * 8}px;
`);

export const VBox = styled(FlexBox)({
  flexDirection: "column"
});

export type VSpacerProps = {
  size?: number
};

export const VSpacer = styled.div<VSpacerProps>(({ size = 1 }) => `
  height: ${size * 8}px;
  min-height: ${size * 8}px;
  max-height: ${size * 8}px;
`);
