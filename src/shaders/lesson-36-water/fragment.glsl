uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/pointLight.glsl

void main()
{



    // using normal directly causes a grid artifact
    // the artifact is caused by the normal not having a length of 1 because of the interpolation 
    // src/assets/lesson-35/interpolated-value-between-normal.png
    // we will fix it by normalizing normal
    vec3 normal = normalize(vNormal);

     // View Direction (https://threejs-journey.com/lessons/lights-shading-shaders#view-direction): 
    // It’s a vector going from the view (our camera position), toward the fragment position. (src/assets/lesson-35/view-vector.png)
    // To calculate the view direction, we need the vector from the cameraPosition, to the vPosition.
    // Calculating the vector between two vectors is as simple as subtracting the destination from the origin: (src/assets/lesson-35/view-direction-calculation.png)
    // and for the direction, we normalize it. (otherwise if two position is really far, it returns big number, we want direction not distance)
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    
    
    // Base color
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    // enhance the gradient's feel
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // light 
    vec3 light = vec3(0, 0, 0);

    light += pointLight(
        vec3(1.0),            // Light color
        10.0,                 // Light intensity,
        normal,               // Normal
        vec3(0.0, 0.25, 0.0), // Light position
        viewDirection,        // View direction
        30.0,                 // Specular power
        vPosition,            // Position
        0.95                  // Decay
    );

    color *= light;
    
    // Final color

    // [Problem with using normal attribute] 
    // normal is facing upwards, resulting the wave color being green
    // and ignoring the shape of the wave
    // src/assets/lesson-36/normal-issue.png
    // this is happening because it is plane geometry and the normal does not care about the updated vertices from vertex shader
    // gl_FragColor = vec4(normal, 1.0);  => rgb(0, 1, 0) => xyz(0, 1, 0)
    // we can not just update the normal attribute which required to do it each frame and cause big performance issue

    // [Solution => neighbors technique]
    // we can fix by using neighbors technique (in the case of grid, and plane is grid)
    // https://threejs-journey.com/lessons/raging-sea-shading-shaders#theory
    // See the vertex shader's modelPositionA and modelPositionB for the implementation 
    
    // 1. we ignore the normal attribute sent with the geometry
    // 2. instead, we are going to compute the theoretical position of neighbours to calculate the normal
    // [compute the theoretical position of neighbours to calculate the normal]
    // 1. get two points based on the vertex (our neighbour will be further away on the x axis (A) and another on z axis (B) (these are theoretical) src/assets/lesson-36/neighbours.png)
    // 2. then update the elevation of those neighbours exactly like we did for the current vertex (wave) src/assets/lesson-36/update-elevation.png
    // 3. we calculate a vector going from the vertex to the A (toA), then vector going from the vertex to B (toB) (src/assets/lesson-36/vector-to-neighbour.png)
    // 4. our computed normal should be the vector perpendicular to both toA and toB and we can do so with the function called "cross product" (src/assets/lesson-36/computed-normal.png)
    // NOTE: in the reference image, toB is positioned in positive Z axes but it is important to put it in NEGATIVE Z AXES!!!

    
    
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



