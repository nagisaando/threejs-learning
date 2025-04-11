uniform float uTime;
uniform sampler2D uPerlinTexture; // sampler2D is a specific type for texture

varying vec2 vUv;



void main () {

    // scale and animate: 
    // we want to stretch the texture and animate it so that it goes up. 
    // To do it, we have to change the UV coordinates. 
    // since we can not modify a varying directly, we have to create a new variable out of it
    vec2 smokeUv = vUv;

    // scaling 
    // instead of using the full width of texture (0 to 1), it is using just 0 to 0.5 by multiplying uv.x by 0.5
    smokeUv.x *= 0.5; 
    // instead of using the full height of texture (0 to 1), it is using just 0 to 0.3
    smokeUv.y *= 0.3;

    // animate from bottom to top
    smokeUv.y -= uTime * 0.03; // * 0.03 slows the animation, -= will make the animation from bottom to top


    // since the perlin texture is a grayscale image, we can use the red channel only 
    // because for the grey color, all the channels will be the same value
    float smoke = texture(uPerlinTexture, smokeUv).r;

    // remap the value 
    // the perlin texture pixels go from 0 (black) to 1(white), which is why there are no large transparent areas within the texture
    // we need to "remap" the value so that it goes from 0 when it should be 0.4, to 1 when it should be 1 with a smooth transition (smoothstep function in GLSL)
    // we want to make it transparent for 0 (black), make it smoke effect
    // src/assets/lesson-32/remap.png
    smoke = smoothstep(0.4, 1.0, smoke); // everything below 0.4 will stay 0, and 1 will stay as 1, smoothstep returns 0 to 1 clamped value, it does not go below 0 or above 1
 

    // instead of having the texture on the plane, we will use smoke texture in alpha
    // so where the dark part in the texture becomes transparent 
    // instead of gl_FragColor = vec4(smoke, smoke, smoke, 1.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, smoke);

    //  gl_FragColor = vec4(vUv, 0, 1); // we can test if vUv is successfully passed 

    // when three.js compiles the shader, it will check the #include and checks Three.js shaderChunks folder to check if there is something corresponding
    // and it will remove the code of #include and add the code instead

    // will add support to the toneMapping
    // there is no toneMapping in lesson 32 but it's good practice to anticipate it
    #include <tonemapping_fragment>

    // make sure to color space to work
    // will convert the colors to comply with the renderer color space setting
    #include <colorspace_fragment>
}