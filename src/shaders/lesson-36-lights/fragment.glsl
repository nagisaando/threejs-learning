uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl


// The directional light:
// the intensity varies according to the orientation of the face and the direction of the light.
// If the face faces the light, it’ll receive the full power of the light. If the face is at a perfect 90° angle, it won’t receive any of the light. Values in between will be interpolated
// Also, note that we consider the light rays to be parallel and the intensity to be constant regardless of the distance (just like the Three.js DirectionalLight).
// we can get the orientation of face using "normal"
vec3 directionalLight(
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition, 
    vec3 viewDirection, 
    float specularPower
    ) {
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

    // currently lightDirection is pointing from the object to light but light direction should point from light to object 
    // so we invert it by adding "-" before lightDirection
    vec3 lightReflection = reflect(-lightDirection, normal);




    float shading = dot(normal, lightDirection);
    // using dot() makes the back face as -1, which result too dark, we will limit minimum value as 0
    // max returns the maximum of the two parameters. It returns y if y is greater than x, otherwise it returns x.
    shading = max(0.0, shading);

    

    // specular (https://threejs-journey.com/lessons/lights-shading-shaders#specular)
    // We need the light reflection. the light is illuminating the surface, but in real life we can also see the light itself reflecting on the surface of the object and we call this “specular”.
    // In order to calculate the specular, we are going to calculate the reflecting vector of the light on the surface and compare it to the view vector.
    // The more they are aligned, the more specular: src/assets/lesson-35/specular.png

    float specular = - dot(lightReflection, viewDirection); // since the value we want and the value the dot is returning is opposite so we will invert it using -1
    specular = max(0.0, specular); // since dot can go -1 to 1 but we want 0 to 1, we clamp it using max()
    specular = pow(specular, specularPower); // since specular is too strong and hs a lot of specular in the back of face so we will weaken it using power

return vec3(specular );
    // return lightColor * lightIntensity * shading;
}


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


    color *= light; // combine light with color by multiplying it

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}