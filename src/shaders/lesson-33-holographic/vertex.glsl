uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

#include ../includes/random2D.glsl
void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0); // when we add 1.0, it is "homogeneous", and three transformations (translation, rotation, scale) will be applied 
    // [glitch effect]
    // we want the effect to look like waves from bottom to top 
    float glitchTime = uTime - modelPosition.y;
    
    // add randomness for the waves by combining multiple sin()
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);

    // multiplying 3 sins can result from -3 to 3
    // we can divide by 3 so that it will go from -1 to 1
    glitchStrength /= 3.0;

    glitchStrength = smoothstep(0.3, 1.0, glitchStrength); // we keep 0 if it's less than 0.3 
    glitchStrength *= 0.25; // weaken the wave effect


    // we have to move the vertices randomly on the x and z axes

    // if the model stops moving and rotating, the glitch will not move either
    // modelPosition.x += random2D(modelPosition.xz) * 0.1;

    // by adding the uTime uniform, we will make the glitch happening even if the object is not moving
    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength; // by subtracting -0.5, the return value will be -0.5 to 0.5, keep the object position to be in the center of the scene;
    // using modelPosition.zx instead of modelPosition.xz returns different random number
    modelPosition.z += (random2D(modelPosition.zx + uTime)- 0.5) * glitchStrength;
    

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vPosition = modelPosition.xyz; // instead of world position, we can pass the relative position "position.xyz" so fragment patterns moves along with the object movement
    
    // [problem]
    // normal orientation 
    // the fresnel value should not change with the object rotation
    // using base normal attribute does not take into account the transformation of the object
    // vNormal = normal;

    vec4 modelNormal = modelMatrix * vec4(normal, 0.0); // when we add 0.0, the vector is NOT "homogeneous" amd the translation won't be applied. we don't need to apply translation to normal because the normal is not a position, it's a direction
    vNormal = modelNormal.xyz;


}



