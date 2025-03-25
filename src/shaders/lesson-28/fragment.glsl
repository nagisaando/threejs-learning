varying vec2 vUv;

void main()
{
    // [pattern 1]:
    // default uv of Three.Plane geometry, it will return the value from 0 to 1
    // gl_FragColor = vec4(vUv, 1.0, 1.0); // same as vec4(vUv.x, vUv.y, 1.0, 1.0);

    // [pattern 2]:
    // gl_FragColor = vec4(vUv, 0, 1.0);

    // [pattern 3]:
    // float strength = vUv.x;
    // gl_FragColor = vec4(vec3(strength), 1.0); // same as  vec4(vUv.x, vUv.x, vUv.x, 1.0);
    
    // [pattern 4]:
    // float strength = vUv.y;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // [pattern 5]:
    float strength = 1.0 - vUv.y;
    gl_FragColor = vec4(vec3(strength), 1.0);
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:
    // [pattern 3]:

}