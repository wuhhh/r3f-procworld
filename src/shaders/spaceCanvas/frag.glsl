precision mediump float;

uniform vec3 uColor;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime;
varying vec2 vUv;

#include "../lygia/generative/cnoise.glsl"

void main() {
	vec2 uv = vUv;
	uv.x += uTime * 0.1;
	uv.x *= .3;
	uv.y *= 4. * uv.y;
	float noise = smoothstep(.5, .55, cnoise(vec3(uv * 8., uTime * .1)));
	vec3 color = mix(uColor, uColor1, noise);
	gl_FragColor = vec4(vec3(color), 1.0);
	gl_FragColor = vec4(vec3(uColor), 1.0);
}