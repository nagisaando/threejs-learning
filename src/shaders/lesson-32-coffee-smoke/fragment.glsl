void main () {
    gl_FragColor = vec4(0, 1, 0, 1);

    // when three.js compiles the shader, it will check the #include and checks Three.js shaderChunks folder to check if there is something corresponding
    // and it will remove the code of #include and add the code instead

    // will add support to the toneMapping
    // there is no toneMapping in lesson 32 but it's good practice to anticipate it
    #include <tonemapping_fragment>

    // make sure to color space to work
    // will convert the colors to comply with the renderer color space setting
    #include <colorspace_fragment>
}