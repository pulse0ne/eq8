import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  #root,
  body,
  html {
    width: 800px;
    margin: 0;
    padding: 0;
    font-family: Roboto, "Helvetica Neue", Arial, sans-serif;;
    font-size: 12px;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    overscroll-behavior: none;
  }
`;

export default GlobalStyles;
