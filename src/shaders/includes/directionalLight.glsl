
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

    return lightColor * lightIntensity * (shading + specular);
}
