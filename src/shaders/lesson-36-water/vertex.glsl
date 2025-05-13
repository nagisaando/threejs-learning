uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position) {
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                      sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                      uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    return elevation;
}

void main()
{

    // Base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // [neightbours technique]
    // neighbours base positions 

    // shift => to determine the distance to the neighbours that we are going to calculate.
    // With a smaller shift, we might catch elevation details that won’t be visible in the final waves.
    // With a bigger shift, we might miss elevation details.
    // The general rule is to put a shift small enough to catch the details of the smallest wave. We can tweak the value to get the best result
    float shift = 0.01;

    // create neightbour A
    //         
    //           |
    // Y←-------BASE--(A)---→ X
    //           |
    //           |
    //           ↓ Z
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    // create neightbour B
    //           ↑ -Z
    //           |
    //          (B)
    //           |
    // Y←-------BASE-------→ X
    //           |
    //           |
    //           ↓ Z
    // we need to place B to negative Z because of cross product
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);
   
   
   // Elevation

    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;

    // apply elevation to the neighbours
    // NOTE: computing normals and use waveElevation multiple times can be concerning for the performance
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    // calculate neighbour directions (the orange arrow of src/assets/lesson-36/vector-to-neighbour.png)
    
    // we can calculate the neighbour direction by subtracting destination from the origin
    // src/assets/lesson-35/view-direction-calculation.png
    // since it is direction, we need to normalize it. Also cross product function required the vector to be normalized (length of 1)
    vec3 toA = normalize(modelPosition.xyz - modelPositionA.xyz);
    vec3 toB = normalize(modelPosition.xyz - modelPositionB.xyz);

    // compute normal using cross product
    // https://threejs-journey.com/lessons/raging-sea-shading-shaders#compute-the-normal-1
    // src/assets/lesson-36/cross-product-with-hand.png
    // And this is why we shifted the neighbour B on negative z and not positive z. 
    // Try to rotate your hand around to match the A and the B neighbours and you’ll notice that with positive z, the cross product would be pointing downward.
    vec3 computedNormal = cross(toA, toB);

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    
    // Varyings
    vElevation = elevation;

    // when we add 0.0, the vector is NOT "homogeneous" amd the translation won't be applied. we don't need to apply translation to normal because the normal is not a position, it's a direction
    // vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    // vNormal = modelNormal.xyz; // <==== this causes issue with light, so we will use neighbour technique, see the explanation in fragment file
    vNormal = computedNormal;

    vPosition = modelPosition.xyz;

}