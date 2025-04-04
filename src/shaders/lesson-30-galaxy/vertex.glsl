
attribute float aScale;
attribute vec3 aRandomness;

uniform float uTime;
uniform float uSize;

varying vec3 vColor;

void main() {
    // position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Spin animation
    // since the galaxy looks flat, we can rotate the vertices only on the x and z coordinates
    // - calculate the particle angle and its distance to the center
    // - increase the angle according to uTime and distance (if the vertex is close to the center, it rotates faster, which creates spin effect)
    // - update the position according to the new angle
    float angle = atan(modelPosition.x, modelPosition.z); // get angle of the vertex using atan()
    float distanceToCenter = length(modelPosition.xz); // get distance but you can not use distance()

    // calculate the offset angle: according to the time and distance, how much does the particle should have spin
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter; // since sin() and cos() will return -1 to 1, we need to apply back the distance
    modelPosition.z = sin(angle) * distanceToCenter;

    // randomness
    modelPosition.xyz += aRandomness;


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


    // color
    vColor = color;

}