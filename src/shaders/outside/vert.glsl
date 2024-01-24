uniform float uTime;

varying vec3 vTextureCoord;
varying vec2 vUv;

void main() {
	vTextureCoord = position;
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}