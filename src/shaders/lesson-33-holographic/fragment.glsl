varying vec3 vPosition;

void main() {
    // stripes
    // to create small gradients that go up and keep on repeating, we can use shader pattern using modelPositions
    float stripes = mod(1.0 - vPosition.y * 20.0, 1.0);
    stripes = pow(stripes, 3.0); // make the stripe sharper using power https://www.desmos.com/calculator/o7muw7cqik



    gl_FragColor = vec4(stripes, stripes, stripes, 1);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}


