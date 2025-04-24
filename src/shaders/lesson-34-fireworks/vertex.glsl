uniform float uSize;
uniform vec2 uResolution;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // For the particles (officially named points), we need to set the size
    gl_PointSize = uSize * uResolution.y; // by multiplying uResolution, the particle size changes depending on the screen size

    // we have to add perspective to the particles otherwise the size of the particle does not change according to the camera distance
    // we can apply by taking the code from Three.js dependency
    // node_modules/three/src/renderers/shaders/ShaderLib/points.glsl.js
    gl_PointSize *= (1.0 / -viewPosition.z);

}