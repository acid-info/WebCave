export type WebGl = WebGLRenderingContext & {
  viewportWidth?: number;
  viewportHeight?: number;
}

export type WebGLTextureWithImage = WebGLTexture & {
  image?: HTMLImageElement;
}

export type WebGLBufferWithVertices = WebGLBuffer & {
  vertices?: number;
}