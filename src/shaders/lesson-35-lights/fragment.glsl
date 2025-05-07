// NOTE: 
// lights implemented here are not physically based, especially when it comes to specular and point light decay, 
// but it looks realistic and it’s performant.


uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl

void main() {

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
    vec3 color = uColor;

    // Light
    vec3 light = vec3(0, 0, 0);
    light += ambientLight(vec3(1.0), 0.02);  
    light += directionalLight(
        vec3(0.1, 0.1, 1.0), 
        1.0, 
        normal, 
        vec3(0.0, 0.0, 3.0), 
        viewDirection,
        20.0
    );
    light += pointLight(
        vec3(1.0, 0.1, 0.1), 
        1.0, 
        normal, 
        vec3(0.0, 2.5, 0.0), 
        viewDirection,
        20.0,
        vPosition,
        0.25
    );

    light += pointLight(
        vec3(1.0, 1.1, 0.1), 
        1.0, 
        normal, 
        vec3(2.5, 1.5, 0.0), 
        viewDirection,
        20.0,
        vPosition,
        0.25
    );



    color *= light; // combine light with color by multiplying it

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}