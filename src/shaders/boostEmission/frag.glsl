uniform vec3 uColor;
uniform float uTime;
varying vec2 vUv;

#include "../lygia/generative/psrdnoise.glsl"

void main() {
	float speed = -2.;
	float xp = 1.; // x period
	float yp = 10.; // y period
	vec2 uv = vec2(vUv.x * xp, vUv.y * yp);
	uv.y += uTime * speed;
	uv.x += uTime * speed * .5;
	float noise = psrdnoise(vec3(uv.x, uv.y, uTime * .1), vec3(xp, yp, 0.)); // periodic noise
	float alpha = smoothstep(.5, .52, noise); // alpha feathering
	// alpha *= sin(vUv.x * 16.) * .5 + .5; // alpha variation around x
	alpha *= 8.0;
	alpha *= pow(1. - vUv.y, 4.0);
	gl_FragColor = vec4(uColor, alpha);
}