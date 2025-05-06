// Point Light: it’s very similar to the directional light, except for two main differences:
// 1. the light comes from a point and not a general direction.
// 2. Light decays, meaning that’ll be weaker with the distance.
vec3 pointLight(    
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition, 
    vec3 viewDirection, 
    float specularPower,
    vec3 position,
    float lightDecay
    ) {
    // we have to get lightDirection so that it’s a vector going from the surface of the object, toward the light
    vec3 lightDelta = lightPosition - position;
    vec3 lightDirection = normalize(lightDelta); 

    // if we want to get the length of vector, we need to use length()
    float lightDistance = length(lightDelta);


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



    // Decay: 
    // We want the light intensity to diminish with the distance.
    // We get nothing with below solution in the scene because the light decays too fast. The point light is currently 2.5 units above Suzanne and after 1 unit, the decay is already down to 0.0:
    // float decay = 1.0 - lightDistance; // if distance is close which is 0 for example, decay returns 1, which shows the light clearer (no decay)

    // so we weaken the decay
    float decay = 1.0 - lightDistance * lightDecay; // NOTE: this is not really a realistic decay logic, but in the scene, it looks fine
    decay = max(0.0, decay); // prevents decay from going below 0
    
    return lightColor * lightIntensity * decay * (shading + specular);

}
