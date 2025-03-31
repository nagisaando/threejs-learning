void main()
{
    gl_FragColor = vec4(0, 1, 1, 1);
    // In the latest versions of Three.js, we need to output the colors in sRGB color space with #include
    #include <colorspace_fragment>
}