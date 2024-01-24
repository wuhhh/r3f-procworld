precision highp float;

uniform vec3 uBaseColour;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec3 vTextureCoord;
varying vec2 vUv;

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/generative/snoise.glsl"

void main() {
	vec3 textureCoord = vTextureCoord;
	textureCoord.z *= .01;
	textureCoord.x -= uTime * .02;
	vec3 v = vec3(32.0*textureCoord);
	vec3 p = vec3(120.0,120.0,120.0);
	vec3 g;

	float n = smoothstep(.8, .9, psrdnoise(v, p, 2.0, g));
	// n *= 8.0;
  gl_FragColor = vec4(n, n, n, 1.0);
	
	// vec2 uv = vUv;
	// float xp = 8.0;
	// float yp = 8.0;
	// uv.x *= xp;
	// uv.y *= yp;

	// float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.)); 
	// gl_FragColor = vec4(uBaseColour, noise);
	// gl_FragColor = mix(vec4(uBaseColour, 1.0), vec4(uColor1, 1.0), noise);
}