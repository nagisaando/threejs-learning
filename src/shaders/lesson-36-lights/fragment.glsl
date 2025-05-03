uniform vec3 uColor;
varying vec3 vNormal;


#include ../includes/ambientLight.glsl


// The directional light:
// the intensity varies according to the orientation of the face and the direction of the light.
// If the face faces the light, it’ll receive the full power of the light. If the face is at a perfect 90° angle, it won’t receive any of the light. Values in between will be interpolated
// Also, note that we consider the light rays to be parallel and the intensity to be constant regardless of the distance (just like the Three.js DirectionalLight).
// we can get the orientation of face using "normal"
vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition) {
    // the direction is normalized


    // We have the face orientation (normal) and we have the light direction (lightDirection).
    // - If they are in opposite direction, we want 1
    // - If they are at a 90° angle, we want 0
    // - In between, we want the interpolated value

    // to get the value, we are going to use the dot() which works as: 
    // - If they are in the same direction, we get 1
    // - If they they are perpendicular, we get 0
    // - If they are opposite, we get -1
    // - In between values are interpolated (e.g. -0.5)

    vec3 lightDirection = normalize(lightPosition);


    float shading = dot(normal, lightDirection);
    // using dot() makes the back face as -1, which result too dark, we will limit minimum value as 0
    // max returns the maximum of the two parameters. It returns y if y is greater than x, otherwise it returns x.
    shading = max(0.0, shading);

    

    return lightColor * lightIntensity * shading;
}

void main()
{
    vec3 color = uColor;

    // Light
    vec3 light = vec3(0, 0, 0);
    light += ambientLight(vec3(1.0), 0.02); 
    light += directionalLight(vec3(0.1, 0.1, 1.0), 1.0, vNormal, vec3(0.0, 0.0, 3.0));


    color *= light; // combine light with color by multiplying it

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}