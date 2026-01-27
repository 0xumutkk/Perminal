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
    priority?: boolean;
    quality?: number | string;
    placeholder?: 'blur' | 'empty' | 'data:image/...';
    blurDataURL?: string;
    sizes?: string;
    loader?: (props: { src: string; width: number; quality?: number }) => string;
    unoptimized?: boolean;
  }

  const Image: React.FC<ImageProps>;
  export default Image;
}
