const VERTEX =
  "uniform mat4 uProjMatrix;"+
  "uniform mat4 uViewMatrix;"+
  "uniform mat4 uModelMatrix;"+
  "attribute vec3 aPos;"+
  "attribute vec4 aColor;"+
  "attribute vec2 aTexCoord;"+
  "varying vec4 vColor;"+
  "varying vec2 vTexCoord;"+
  "void main() {"+
  "	gl_Position = uProjMatrix * uViewMatrix * ( uModelMatrix * vec4( aPos, 1.0 ) );"+
  "	vColor = aColor;"+
  "	vTexCoord = aTexCoord;"+
  "}";

const FRAGMENT =
  "precision highp float;"+
  "uniform sampler2D uSampler;"+
  "varying vec4 vColor;"+
  "varying vec2 vTexCoord;"+
  "void main() {"+
  "	vec4 color = texture2D( uSampler, vec2( vTexCoord.s, vTexCoord.t ) ) * vec4( vColor.rgb, 1.0 );"+
  "	if ( color.a < 0.1 ) discard;"+
  "	gl_FragColor = vec4( color.rgb, vColor.a );"+
  "}";

export type CanvasPosition = {
  x: number,
  y: number
}

export const WEB_GL_SOURCE = {
  VERTEX,
  FRAGMENT
}