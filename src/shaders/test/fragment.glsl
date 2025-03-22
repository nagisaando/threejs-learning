// [Precision]
// We need to decide how precise can a float be:
// - highp: can have performance hit and might not work on some devices
// - mediump
// - lowp: can create bugs by the lack of precision
// if we use ShaderMaterial instead of RawShaderMaterial, it will be handled automatically
precision mediump float;

// getting a value from vertex shader
// the varying (color) will be interpolated
varying float vRandom;


void main() 
{
    // [gl_FragColor]
    // - the variable already exists and we are just re-assigning it
    // - will contain the color of the fragment
    // - vec4 (r, g, b, and a)

    // the varying (color) will be interpolated
    gl_FragColor = vec4(1.0, 0.0, vRandom, 1.0);
}