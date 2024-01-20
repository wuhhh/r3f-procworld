precision highp float;

uniform float uDepth;
uniform vec3 uCapsuleColourFar;
uniform vec3 uCapsuleColourNear;
uniform float uTime;

varying float vElevation;
varying vec3 vLevel;
varying vec2 vUv;
varying float vDebrisOpacity;
varying float vDebrisShape;
varying float vDebrisColour;
varying float vTravellerDistance;
varying float vZDistanceFromCamera;

// vLevel.x : 1.0 debris (planes)
// vLevel.x : 0.0 terrain and clouds

// vLevel.y : 0.0 terrain
// vLevel.y : 1.0 clouds

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/color/blend/lighten.glsl"
#include "../lygia/color/brightnessContrast.glsl"

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

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
	vec4 terrainCloudMix = mix(vec4(base, 1. - pow(vUv.y, 16.0)), vec4(blend, alpha), vLevel.y);

	// Add some brighter patches using elevation from the vertex shader, bump contrast
	terrainCloudMix = brightnessContrast(terrainCloudMix, pow(vElevation, 2.0) * .25, 1.05);

	// Debris colour 
	// vec4 debrisColour = vec4(1., 1., 1., pow(1.0 - (distance(vUv, vec2(.5, .5)) * 2.), 4.0) * vDebrisOpacity * 2.);
	float debrisFog = 1. - pow(vZDistanceFromCamera, 8.0);
	
	// vec4 debrisColour = vec4(1., 1., 1., debrisFog * pow(1.0 - (distance(vUv, vec2(.5, .5)) * 2.), 4.0) * vDebrisOpacity);
	vec4 debrisColour = vec4(1., .8, .7, debrisFog * vDebrisOpacity * smoothstep(.01, .99, 1.0 - (distance(vUv, vec2(.5, .5)) * 4.)) );

	// Traveller proximity
	float proximityTest = 1.; // Should be a uniform
	float travellerProximity = vTravellerDistance <= proximityTest ? 1.0 - vTravellerDistance : 0.0;
	// vec4 travellerColour = vec4(brighter, travellerProximity);

	// Post 
	vec4 postColour = mix(mix(terrainCloudMix, debrisColour, vLevel.x), vec4(uCapsuleColourFar, 1.0), travellerProximity * vLevel.y);
	
	gl_FragColor = postColour;
	// gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
} 