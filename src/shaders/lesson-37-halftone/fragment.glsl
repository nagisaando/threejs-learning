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

    // =======
    // previous implementation: (correct implementation is below)
    // // Meaning that if you are rendering with a 1920x1080 resolution, the gl_FragCoord.xy on the top right corner will have the values 1919.0 and 1079.0.
    // // To apply color correctly, We want to have a normalized value, meaning that regardless of the render resolution and the pixel ratio, we want something that goes from 0, 0 (bottom left) to 1, 1 (top right).
    // vec2 uv = gl_FragCoord.xy / uResolution;
    // uv *= 50.0; // this will make the value from 0,0 on the bottom left to 50.0, 50.0 right top

    // correct implementation: 

    // we add modulo to add grid effect: uv = mod(uv, 1.0);
    // however this grid is not showing as square (more like rectangle) because uResolution.x and y have a different values "vec2 uv = gl_FragCoord.xy / uResolution;"
    // so we divide only on y axes, so if user change the height of the screen, the grid size changes accordingly (three.js and standard of the gaming change the size of the object based on the screen height)
    // with this, the number of the vertical grid matches with the value of repetitions variable (float repetitions = 50.0; means there is 50 squares vertically) 
    float repetitions = 50.0;
    vec2 uv = gl_FragCoord.xy / uResolution.y; 
    uv *= repetitions;
    
    uv = mod(uv, 1.0);

    // make circle mark inside each grid: 
    // distance(uv, vec2(0.5)): 
    // heck the distance of two points. 
    // vec2(0.5) represents center of the grid, and it is checking the distance between uv and the center of the grid
    float point = distance(uv, vec2(0.5));

    // step(0.5, point):
    // step(edge, x) returns:
    // - 0.0 when x < edge (black)
    // - 1.0 when x >= edge (white)
    point = step(0.5, point);

    // we will revert the black and white. (white circle, black outside)
    point = 1.0 - point;

    
    // Final color
    gl_FragColor = vec4(vec3(point), 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

// Intensity and radius of grid: 
// - we want to control their radius according to the intensity of the halftone effect.
// this is similar to directional light
// 1. decide on a direction for halftone. 
// 2. If the faces are orientated toward that direction, we want a high value. 
// 3. If they are in the opposite direction, we want a low value.
// src/assets/lesson-37/halftone-direction.png
// we can do this using "dot product"
