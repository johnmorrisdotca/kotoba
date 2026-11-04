import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "kotoba-game": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { words?: string; letters?: string; daily?: string; easy?: boolean; seed?: string; lang?: string; size?: string; theme?: string };
    }
  }
}
