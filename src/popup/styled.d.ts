import "styled-components";
import { Theme } from "../core/types/theme.ts";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
