precision highp float;

uniform float uTime;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

#include "../lygia/generative/psrdnoise.glsl"
#include "../lygia/lighting/fresnel.glsl"

void main() {
    vec2 uv = vUv;
    uv.x += uTime * .001;
    uv.y += uTime * .002;

		vec3 baseColor = vec3(.2, .2, .3);
		float noise = psrdnoise(vec3(uv * 4., uTime * .1), vec3(4.));
		vec3 normal = normalize(vNormal);
		vec3 viewVector = normalize(vViewPosition);

		vec3 fresnelColor = fresnel(baseColor, normal, viewVector);
		baseColor.r += .2 * noise;

    gl_FragColor = vec4(mix(baseColor, fresnelColor, .35), 1.0);
}