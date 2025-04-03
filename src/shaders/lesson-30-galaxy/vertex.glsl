
attribute float aScale;

uniform float uSize;

void main() {
    // position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // size
    gl_PointSize = uSize * aScale;

    // also we need to apply size attenuation otherwise regardless of the camera distance,
    // the particle does not change its size
    // we can apply by taking the code from Three.js dependency
    // node_modules/three/src/renderers/shaders/ShaderLib/points.glsl.js
     gl_PointSize *= ( 1.0 / - viewPosition.z);
}