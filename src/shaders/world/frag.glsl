precision highp float;

uniform float uDepth;
uniform vec3 uCapsuleColourFace;
uniform vec3 uCapsuleColourFar;
uniform vec3 uCapsuleColourNear;
uniform vec3 uOutsideColour;
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
	vec3 base = mix(uCapsuleColourFace, mix(uCapsuleColourNear, uCapsuleColourFar, vUv.y), smoothstep(0.001, 0.1, 1.0 - vUv.y));

	// Brighter version of main colour
	vec3 brighter = brightnessContrast(base, .2, 1.); 

	//  Clouds from periodic noise (wraps seamlessly around tubes, spheres etc.)
	float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.)); 

	// Alpha feathering
	float stepWidth = .06;
	float stepStart = .63;
	float noiseAlpha = smoothstep(stepStart, stepStart + stepWidth, noise); 

	// Vary noise alpha around x
	noiseAlpha *= sin(vUv.x * 16.) * .5 + .5; 

	// Fade noise in from far end
	noiseAlpha *= 1. - pow(vUv.y, 4.0);

	// Mix the base colour with the brighter colour
	vec3 blend = blendLighten(base, brighter, 1.);

	// Mix between capsule and cloud
	vec4 terrainCloudMix = mix(vec4(base, 1.0), vec4(blend, noiseAlpha), vLevel.y);

	// Add some brighter patches using elevation from the vertex shader, bump contrast
	terrainCloudMix = brightnessContrast(terrainCloudMix, pow(vElevation, 2.0) * .25, 1.05);

	// Debris colour 
	// vec4 debrisColour = vec4(1., 1., 1., pow(1.0 - (distance(vUv, vec2(.5, .5)) * 2.), 4.0) * vDebrisOpacity * 2.);
	float debrisFog = 1. - pow(vZDistanceFromCamera, 8.0);
	
	// vec4 debrisColour = vec4(1., 1., 1., debrisFog * pow(1.0 - (distance(vUv, vec2(.5, .5)) * 2.), 4.0) * vDebrisOpacity);
	vec4 debrisColour = vec4(1., .8, .7, debrisFog * vDebrisOpacity * smoothstep(.01, .99, 1.0 - (distance(vUv, vec2(.5, .5)) * 4.)) );

	// Traveller proximity
	float proximityTest = 1.5; // Should be a uniform

	// This will be 0.0 to proximityTest, with 0.0 being at the farthest point within proximityTest
	float travellerProximity = vTravellerDistance <= proximityTest ? proximityTest - vTravellerDistance : 0.0; // 0.0 to proximityTest

	// Remap to 1.0 to 0.0
	travellerProximity = map(travellerProximity, 0.0, proximityTest, 1.0, 0.0);
	// travellerProximity = pow(travellerProximity, .1);
	// vec4 travellerColour = vec4(brighter, travellerProximity);

	// Post 
	// vec4 postColour = mix(mix(terrainCloudMix, debrisColour, vLevel.x), vec4(brighter, 1.), pow(travellerProximity * vLevel.y, 2.0));
	vec4 postColour = mix(vec4(uOutsideColour, 0.0), mix(terrainCloudMix, debrisColour, vLevel.x), travellerProximity);
	
	gl_FragColor = postColour;
	// gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
} 