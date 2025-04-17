uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2D.glsl // this is different from #include <> from three.js, this is for vite plugin
void main () {
    vec3 newPosition = position; // since we can't modify the position variable because it's an attribute, we have to create new one based on position attribute



    // [animate vertex]
    // - make smoke twist
    // we want the vertices to rotate around the center of the plane and 
    // have that rotation changing according to the elevation.
    // This means that vertices are going to rotate on an "xz" plane along to the "Y" axis

    // we are going to use the uTime and uPerlinTexture to animate 
    // pick the color on the uPerlinTexture using texture()
    // and pick one value that will change according to the elevation
    // we are going to set that line at the center of the texture
    // +-------+
    // |   |   |
    // |   |   |
    // |   |   |
    // +-------+

    float twistPerlin = texture(
        uPerlinTexture, 
        // 0.5 indicates we are taking the value of the middle of the texture
        vec2(0.5, uv.y * 0.2 - uTime * 0.005) // by - uTime, animation moves upwards. Also by multiplying 0.005. animation gets slow
    ).r; 
    float angle = twistPerlin * 10.0;

    newPosition.xz = rotate2D(newPosition.xz, angle);

    // [animate vertex 2]
    // - move with the wind
    // to calculate the strength of the wind, we are  going to use the same technique as for the twist by, 
    // picking a color from perlin texture and move the vertices on the x and z axes

    // wind 
    // we will get the offset based on the perlin texture
    // but to avoid the same pattern as twist, we will get from the different x axes
    // +-------+
    // | |     |
    // | |     |
    // | |     |
    // +-------+

    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5, // we subtract 0.5, so the value becomes -0.5 to 0.5 enabling animate the both left and right side
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );


    // windOffset.x *= uv.y * 10.0; // this will let the bottom part of the smoke in the cup but offset the top smoke
    // we can make the curve effect using the power based on 0 to 1 value
    windOffset.x *= pow(uv.y, 2.0) * 10.0;


    newPosition.xz += windOffset;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0); // and we use newPosition here
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vUv = uv;
}