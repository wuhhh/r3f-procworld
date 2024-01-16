varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() { 
	vUv = uv;
	vNormal = normal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
	// Pass varying variables to the fragment shader
	vViewPosition = -vec3(modelViewMatrix * vec4(position, 1.0)).xyz;
}