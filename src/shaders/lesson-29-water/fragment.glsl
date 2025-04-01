uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main()
{


    // mix() will mix the two colors
    // 1st, 2nd params => color
    // 3rd param => ratio of mixing color
    //              if 3rd param is "0" => it will take the first color
    //              if 3rd param is "1" => it will take the second color
    // With "vec3 color = mix(uDepthColor, uSurfaceColor, vElevation);"
    // we can not see the color difference much because vElevation goes from -0.2 to 0.2
    // we have to add uColorOffset and uColorMultiplier to play around
    
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength); 
    
    gl_FragColor = vec4(color, 1.0);
    
    // In the latest versions of Three.js, we need to output the colors in sRGB color space with #include
    #include <colorspace_fragment>
}