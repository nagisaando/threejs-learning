varying vec3 vColor;

void main() {


    // we can also draw particle pattern
    // but we can not use "uv" as a varying because each vertex is a particle 
    // but we can use gl_PointCoord

    // // [1. Disc pattern] (we could use texture depending on the complexity of pattern)
    // float strength = distance(gl_PointCoord, vec2(0.5)); // getting distance from the center
    // strength = step(0.5, strength); // if strength is more than 0.5, it becomes 1 (white)
    // strength = 1.0 - strength; // we revert where is 1 and where is 0
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // // [2. diffuse point pattern] 
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0; // this will make the edge 1. (currently the edge of fragment will be 0.5)
    // strength = 1.0 - strength;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // // [3. light point pattern] 
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0); // apply a power on it with a high number, this makes fade color fast: we can see the value being reduced rapidly based on the strength value
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // Final color 
    // mix vColor with black color according to the strength
    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}