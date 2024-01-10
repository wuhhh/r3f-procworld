precision mediump float;

uniform float uTime;
varying vec2 vUv;

#include "../lygia/generative/pnoise.glsl"
#include "../lygia/color/blend/lighten.glsl"
#include "../lygia/color/brightnessContrast.glsl"

void main() {
	float speed = .8;
	vec2 uv = vUv;
	uv.y += uTime * speed;
	vec3 base = vec3(vUv.y, .133, .2);
	vec3 brighter = brightnessContrast(base, 3.2, 1.2);
	float noise = pnoise(sin(vUv * 3.0) * 2.0, vec2(8.0, 4.0));
	brighter *= smoothstep(.2, 1., noise);
	vec3 blend = blendLighten(base, brighter, .1);
	// base *= 1.0 + noise * 0.5;
	gl_FragColor = vec4(base, 1.0);
}