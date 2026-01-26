declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "next/image" {
  import * as React from "react";

  export interface ImageProps
    extends React.ImgHTMLAttributes<HTMLImageElement> {
    fill?: boolean;
  }

  const Image: React.FC<ImageProps>;
  export default Image;
}

