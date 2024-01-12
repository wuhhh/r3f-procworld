precision mediump float;

uniform float uParam1;
uniform float uParam2;
uniform float uParam3;
uniform float uParam4;
uniform float uParam5;
uniform float uParam6;
uniform float uParam7;
uniform float uTime;
varying vec3 vLevel;
varying vec2 vUv;

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/color/blend/lighten.glsl"
#include "../lygia/color/blend/screen.glsl"
#include "../lygia/color/brightnessContrast.glsl"

void main() {
	float speed = .45;
	float xp = 32.;
	float yp = 1.;
	vec2 uv = vec2(vUv.x * xp, vUv.y * yp);
	uv.y += uTime * speed;
	vec3 base = vec3(vUv.y, .133, .2);
	vec3 brighter = brightnessContrast(base, .2, 1.);
	float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.));
	float stepWidth = .06;
	float stepStart = .63;
	float alpha = smoothstep(stepStart, stepStart + stepWidth, noise);
	vec3 blend = blendLighten(base, brighter, 1.);
	gl_FragColor = mix(vec4(base, 1.0), vec4(blend, alpha), vLevel.y);
}