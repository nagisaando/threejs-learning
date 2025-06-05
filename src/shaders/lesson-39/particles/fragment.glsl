varying vec3 vColor;

void main()
{
    vec2 uv = gl_PointCoord;

    // float distanceToCenter = distance(uv, vec2(0.5));
    float distanceToCenter = length(uv - vec2(0.5)); // this gives the same result

    // to trim the outside of the center, we can use alpha, 
    // however, alpha tends to create visual bug
    // so instead we use "discard"
    // Discard is an instruction that can be called just by writing discard;. 
    // It’ll prevent the fragment from being drawn entirely without even relying on transparency.
    // It’s as if there is nothing there even though the geometry says otherwise.
    // Note that discard; can have a performance impact that is hard to predict, but it’s usually negligible.
    
    if(distanceToCenter > 0.5) 
        discard;
    
    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}