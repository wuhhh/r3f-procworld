precision mediump float;

uniform vec3 uCapsuleColourFar;
uniform vec3 uCapsuleColourNear;
uniform float uTime;
varying float vElevation;
varying vec3 vLevel;
varying vec2 vUv;

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/color/blend/lighten.glsl"
#include "../lygia/color/brightnessContrast.glsl"

void main() {
	float speed = .45;
	float xp = 32.; // x period
	float yp = 1.; // y period
	vec2 uv = vec2(vUv.x * xp, vUv.y * yp);
	uv.y += uTime * speed;
	vec3 base = mix(uCapsuleColourNear, uCapsuleColourFar, vUv.y); // main colour mix
	vec3 brighter = brightnessContrast(base, .2, 1.); // brighter version of main colour
	float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.)); // periodic noise
	float stepWidth = .06;
	float stepStart = .63;
	float alpha = smoothstep(stepStart, stepStart + stepWidth, noise); // alpha feathering
	alpha *= sin(vUv.x * 16.) * .5 + .5; // alpha variation around x
	alpha *= 1. - pow(vUv.y, 4.0);
	vec3 blend = blendLighten(base, brighter, 1.);
	vec4 postColour = mix(vec4(base, 1. - pow(vUv.y, 16.0)), vec4(blend, alpha), vLevel.y); // capsule/cloud mix
	postColour = brightnessContrast(postColour, pow(vElevation, 2.0) * .25, 1.05);
	gl_FragColor = postColour;
} 