attribute float aSize;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;



// the animation 
// 1. [exploding] the particles start to expand fast in every direction
// 2. they scale up even faster
// 3. they start to fall down slowly
// 4. they scale down
// 5. they twinkle as they disappear
// src/assets/lesson-34/animation-phase.png

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}


void main() {
    vec3 newPosition = position;

    // [exploding animation]
    // we can not use smoothstep because it starts slowly and ends slowly but we want explosion which transitions fast
    // there is no built-in function so we need customized one
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    
    gl_Position = projectionPosition;

    // For the particles (officially named points), we need to set the size
    gl_PointSize = uSize * uResolution.y; // by multiplying uResolution, the particle size changes depending on the screen size

    // make the particle size random
    gl_PointSize *= aSize;
    // we have to add perspective to the particles otherwise the size of the particle does not change according to the camera distance
    // we can apply by taking the code from Three.js dependency
    // node_modules/three/src/renderers/shaders/ShaderLib/points.glsl.js
    gl_PointSize *= (1.0 / -viewPosition.z);

  

}