precision mediump float;

uniform vec3 uCapsuleColourFar;
uniform vec3 uCapsuleColourNear;
uniform float uTime;
varying float vElevation;
varying vec3 vLevel;
varying vec2 vUv;

// vLevel.y 0 = capsule, 1 = cloud

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/color/blend/lighten.glsl"
#include "../lygia/color/brightnessContrast.glsl"

void main() {
	float speed = .45;
	float xp = 32.; // x period
	float yp = 1.; // y period

	// Multiply the UVs by the period to get the repeating pattern
	vec2 uv = vec2(vUv.x * xp, vUv.y * yp);

	// Add time to y to make it travel
	uv.y += uTime * speed;

	// Main colour mix
	vec3 base = mix(uCapsuleColourNear, uCapsuleColourFar, vUv.y);

	// Brighter version of main colour
	vec3 brighter = brightnessContrast(base, .2, 1.); 

	//  Periodic noise (wraps seamlessly around tubes, spheres etc.)
	float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.)); 

	// Alpha feathering
	float stepWidth = .06;
	float stepStart = .63;
	float alpha = smoothstep(stepStart, stepStart + stepWidth, noise); 

	// Vary alpha around x
	alpha *= sin(vUv.x * 16.) * .5 + .5; 
	alpha *= 1. - pow(vUv.y, 4.0);

	// Mix the base colour with the brighter colour
	vec3 blend = blendLighten(base, brighter, 1.);

	// Mix between capsule and cloud
	vec4 postColour = mix(vec4(base, 1. - pow(vUv.y, 16.0)), vec4(blend, alpha), vLevel.y);

	// Add some brighter patches using elevation from the vertex shader
	postColour = brightnessContrast(postColour, pow(vElevation, 2.0) * .25, 1.05);
	
	gl_FragColor = postColour;
	// gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
} 