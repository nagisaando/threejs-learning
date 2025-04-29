attribute float aSize;
attribute float aTimeMultiplier;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;


// the animation 
// 1. [exploding] the particles start to expand fast in every direction
// 2. they scale up even faster
// 3. they start to fall down slowly
// 4. they scale down
// 5. they twinkle as they disappear
// src/assets/lesson-34/animation-phase.png


#include ../includes/remap.glsl



void main() {

    // create a time multiplier as an attribute and make the particles randomly faster
    // but no more than 3 secs (when the fireworks gets disposed)
    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;

    // [exploding animation]
    // we can not use smoothstep because it starts slowly and ends slowly but we want explosion which transitions fast
    // there is no built-in function so we need customized one
   
    // remap function doesn’t stop the values from going above or below the limits we provide. and still keeps moving after 0.1
    // To fix that, we can clamp the value right after the remap using clamp:
    float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0); // when the progress value reaches 0.0, it starts the animation and it gets 1 when the progress is 0.1 (super fast animation)
    explodingProgress = clamp(explodingProgress, 0.0, 1.0);

    // animate super fast at the beginning and slow down before reaching 1 (the end of transition) by using pow
    // however we want the opposite of graph of pow(explodingProgress, 3.0) which starts slow and end fast
    // 1-(1-x)ᵃ https://www.desmos.com/calculator/jbdvrodjvu   
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
    newPosition *= explodingProgress;


    // [falling animation]
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0); // when the progress value reaches 0.1, it starts the animation and it gets 1 when the progress is 1
    fallingProgress = clamp(fallingProgress, 0.0, 1.0); // we clamp the value otherwise animation from remap() won't stop
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0); // fall fast and slow down as it gets
    newPosition.y -= fallingProgress * 0.2;

    // [scaling animation]
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0); // when the progress value reaches 0.0, it starts the animation and it gets 1 when the progress is 0.125 (going up fast)
    float sizeClosingProgress = remap(progress, 0.125, 1.0,1.0, 0.0); // when the progress value reaches 0.125, it starts the animation and it goes down from 1 and gets 0 when the progress is 1.0 (going down)
   
    // Both sizeOpeningProgress and sizeClosingProgress are calculated simultaneously in the shader (GPU processes all vertices in parallel).
    // However, their activation times are staggered based on progress:
    // sizeOpeningProgress: Active from progress = 0.0 to 0.125 (particles grow rapidly).
    // sizeClosingProgress: Active from progress = 0.125 to 1.0 (particles shrink slowly).
    // The min(sizeOpeningProgress, sizeClosingProgress) ensures the final sizeProgress transitions smoothly from growth to shrinkage.


    // The combined sizeProgress looks like this (approximated):
    //       /\
    //      /  \
    //     /    \
    //    /      \
    //   /        \
    //  /          \
    // /            \

    // [twinkling]
    // we want particle to twinkle (scale up and down fast using sin())
    // want to start the twinkle a little after the particles start to scale down
    float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
    
    // since sine goes from -1 to +1, and we would like a value from 0 to 1 using "* 0.5 (make sine value from -0.5 to 0.5)  + 0.5 (make the value 0 to 1)"
    // multiplying by progress * 30.0 make the sine progress more faster
    float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5; 
    sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;
    

    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    
    gl_Position = projectionPosition;

    // For the particles (officially named points), we need to set the size
    gl_PointSize = uSize * uResolution.y; // by multiplying uResolution, the particle size changes depending on the screen size

    // make the particle size random
    gl_PointSize *= aSize;

    // scaling animation 
    gl_PointSize *= sizeProgress; 

    // twinkling
    gl_PointSize *= sizeTwinkling; 


    // *note* we can combine them as this as well:  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;


    // we have to add perspective to the particles otherwise the size of the particle does not change according to the camera distance
    // we can apply by taking the code from Three.js dependency
    // node_modules/three/src/renderers/shaders/ShaderLib/points.glsl.js
    gl_PointSize *= (1.0 / -viewPosition.z);


    // we will make the particle outside of the screen if the gl_PointSize is below 1.0
    // this is mostly for windows, since some of windows can see the particles even if it's already extremely small
    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9);
    }

  

}


