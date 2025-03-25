
// Learning resource: https://threejs-journey.com/lessons/shaders#:~:text=Learning-,Coordinate%20Systems,-The%20Book%20of
// * the values are used below are three.js specific and provided from three.js

// Each matrix will transform the "position" until we get the final clip space coordinates
// For this case, there are three matrices.
// uniform => they are the same for all the vertices
//            - It is useful for having the same shader but with different results
//            - Being able to tweak values
//            - It can be used to animate
//            - It can be used in both vertex and fragment shaders

// each matrix will do a part of the transformation. 
// To apply a matrix, we multiply it ( projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0))
// The matrix must have the same size as the coordinate (mat4 for vec4, mat3 for vec3 etc)
// The order of multiplication matters: projectionMatrix * viewMatrix * modelMatrix * position

// projectionMatrix: transform the coordinates into the clip space coordinates
// Clip space: A normalized space where coordinates outside the range [-1, 1] are clipped (not rendered).
uniform mat4 projectionMatrix;

// viewMatrix: apply transformations relative to the camera (position, rotation, field of view, near, far)
// if the camera is away, the vertices should shrink, if the camera looks on the left, so do the vertices
uniform mat4 viewMatrix; 

// modelMatrix: apply transformations relative to the Mesh (position, rotation, scale)
// example: Mesh.position.x = 1 will be converted to modelMatrix, and apply it to the position coordinate
uniform mat4 modelMatrix; 

// attribute - the data that changes in every vertex
// the "position" is being retrieved from "geometry" (console.log(new THREE.PlaneGeometry(1, 1, 32, 32)))
// and to use for gl_Position, we have to convert to vec4
attribute vec3 position; 


// this is coming from the custom attribute we added (aRandom => attribute random);
attribute float aRandom;

// if we want to send a value from vertex shader to fragment shader, we have to declare it in vertex shader
varying float vRandom;

void main() // called automatically, does not return anything hence, it has a keyword "void"
{
    // gl_Position already exists in the shader, and we are just "reassigning" the value.
    // IT contains the position of the vertex of the screen/render

    //  gl_Position returns vec4
    // because the coordinates that we are providing is in "clip space", and it's like positioning things in a box.
    // the "z" is for the depth (to know which part is in front of the other) and the "w" is responsible for the perspective
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); // the order matters

    // this is same as: 
    vec4 modelPosition = modelMatrix * vec4(position, 1.0); // Transform to world space
    // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1; // Apply wave effect in model space
    modelPosition.z += aRandom * 0.1; // we can get terrain effect

    vec4 viewPosition = viewMatrix * modelPosition; // Transform to camera space
    vec4 projectionPosition = projectionMatrix * viewPosition; // Transform to clip space
    gl_Position = projectionPosition; // Set final vertex position

    // we want to send aRandom to fragment shader using vRandom so we assign aRandom to vRandom
    vRandom = aRandom;
}