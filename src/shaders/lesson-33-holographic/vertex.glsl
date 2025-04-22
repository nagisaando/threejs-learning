varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0); // when we add 1.0, it is "homogeneous", and three transformations (translation, rotation, scale) will be applied 
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