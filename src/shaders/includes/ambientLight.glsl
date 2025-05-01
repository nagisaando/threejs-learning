// An ambient light applies a uniform light on the surface of the objects, regardless of their orientation. 
// It’s not realistic, but in small doses, it helps lighten up the part of the objects in the shade
// as if the light was bouncing on walls and getting back to the object.


// NOTE: 
// in real life, if object is perfect blue and light is perfect red, the object absorbs the light and not reflect back, resulting the objects are invisible in the scene 
vec3 ambientLight(vec3 lightColor, float lightIntensity) {
    return lightColor * lightIntensity;
}