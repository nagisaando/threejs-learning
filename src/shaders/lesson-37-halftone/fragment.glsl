uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec3 vPosition;


#include ../includes/ambientLight.glsl;
#include ../includes/directionalLight.glsl;
void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition); // this is for specular
    vec3 normal = normalize(vNormal); // to avoid visual effect
    vec3 color = uColor;

    // light 
    vec3 light = vec3(0.0);

    light += ambientLight(
        vec3(1.0), // Light color
        1.0        // Light intensity,
    );

    light += directionalLight(
        vec3(1.0, 1.0, 1.0), // Light color
        1.0,                 // Light intensity
        normal,              // Normal
        vec3(1.0, 1.0, 0.0), // Light position
        viewDirection,       // View direction
        1.0                  // Specular power
    );

    color *= light;

    // Grid:
    // halftone consists of a grid of points and that grid needs to stay static on screen and not follow the objects or the camera transformations.
    // we can utilize gl_FragCoord

    // [gl_FragCoord]:
    // is a vec4 where xy constitutes the “screen” coordinates and zw are used for the depth,
    // issue with gl_FragCoord:
    // gl_FragCoord.xy are fragment coordinates, meaning that the absolute bottom left fragment’s coordinates are 0.0, 0.0, 
    // the coordinates on its right’s are 1.0, 0.0, the next one 2.0, 0.0, and it goes on and on like that:
    //   |
    // 3 |
    // 2 |
    // 1 |
    // 0 |______________
    //    0  1  2  3 

    // Meaning that if you are rendering with a 1920x1080 resolution, the gl_FragCoord.xy on the top right corner will have the values 1919.0 and 1079.0.
    // To apply color correctly, We want to have a normalized value, meaning that regardless of the render resolution and the pixel ratio, we want something that goes from 0, 0 (bottom left) to 1, 1 (top right).
    vec2 uv = gl_FragCoord.xy / uResolution;
    // Final color
    gl_FragColor = vec4(uv, 1.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}