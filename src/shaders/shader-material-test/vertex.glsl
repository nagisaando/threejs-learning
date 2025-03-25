attribute float aRandom;

uniform float uTime;
uniform vec2 uFrequency;

varying vec2 vUv;
varying float vElevation;

void main() 
{

    vec4 modelPosition = modelMatrix * vec4(position, 1.0); // Transform to world space
    
    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    modelPosition.z += elevation;


    vec4 viewPosition = viewMatrix * modelPosition; // Transform to camera space
    vec4 projectionPosition = projectionMatrix * viewPosition; // Transform to clip space
    gl_Position = projectionPosition; // Set final vertex position

    vUv = uv;
    vElevation = elevation;
}