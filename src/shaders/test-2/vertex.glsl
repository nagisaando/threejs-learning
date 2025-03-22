uniform mat4 projectionMatrix;
uniform mat4 viewMatrix; 
uniform mat4 modelMatrix; 
attribute vec3 position; 

attribute float aRandom;

void main() 
{

    vec4 modelPosition = modelMatrix * vec4(position, 1.0); // Transform to world space
    vec4 viewPosition = viewMatrix * modelPosition; // Transform to camera space
    vec4 projectionPosition = projectionMatrix * viewPosition; // Transform to clip space
    gl_Position = projectionPosition; // Set final vertex position
}