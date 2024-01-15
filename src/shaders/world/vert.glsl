precision mediump float;

uniform float uDepth;
uniform float uParam1;
uniform float uParam2;
uniform float uScapeMix;
uniform float uRadius;
uniform float uTime;

attribute vec3 level;

varying float vElevation;
varying vec3 vLevel;
varying vec2 vUv;

#include "../lygia/generative/snoise.glsl"

void main() {
	
	vUv = uv;
	vLevel = level;

	vec3 pos = position;
	float speed = 1.3;
	vec3 travel = vec3(pos.x, pos.y, pos.z - uTime * speed);
	// travel.z += (smoothstep(.5, 1., uv.x) * uv.y * 5.); // ceiling vortex

	vec3 scape1 = pos;
	vec3 scape2 = pos;
	vec3 scape3 = pos;

	// Range (make sure not to distort far end)
	float range = 1. - pow(vUv.y, 20.);

	// Landscape 1
	vec3 s1a = snoise3(travel * .25);
	scape1.xy -= range * normal.xy * abs(s1a.z) * .6;
	vec3 s1b = snoise3(vec3(scape1.xy * sin(uTime * .8 * .02 + vUv.y * uDepth * .02) * 2., 0.0));
	scape1.xy -= range * (sin(uTime * .8 + vUv.y * uDepth) * 0.5 + 0.5) * normal.xy * abs(s1b.z) * 0.16;

	// Landscape 2
	scape2.xy += range * normal.xy * smoothstep(-.1, 1.3, snoise3(travel * .8).z);

	// Position post noise / mix
	vec3 postPos = mix(scape1, scape2, .22);

	// Fan the near ring of points along their normals
	// Prevents seeing the edges collapse near the camera
	postPos.xy += normal.xy * pow((1. - vUv.y), 8.0) * .7;

	// Bring the ring of points at far end in towards the centre
	postPos.xy -= normal.xy * pow(vUv.y, 48.0) * .3;
	
	// Only for points
	// vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  // gl_PointSize =  ( 10.0 / -mvPosition.z );

	// Elevation 
	vElevation = distance(postPos.xy, position.xy);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(postPos), 1.);
	// gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(position), 1.);
}