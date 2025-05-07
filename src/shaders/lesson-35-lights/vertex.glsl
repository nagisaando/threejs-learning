varying vec3 vNormal;
varying vec3 vPosition;
void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

        
    // normal orientation 
    // [problem] using base normal attribute does not take into account the transformation of the object
    // so as the object rotates, the shade stays in the same place of the object (as if the light is moving as the object rotates)
    // to fix, we have to transform normals

    vec4 modelNormal = modelMatrix * vec4(normal, 0.0); // when we add 0.0, the vector is NOT "homogeneous" amd the translation won't be applied. we don't need to apply translation to normal because the normal is not a position, it's a direction
    vNormal = modelNormal.xyz;
    vPosition = modelPosition.xyz;
}


