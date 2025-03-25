precision mediump float;

uniform vec3 uColor; // THREE.Color() is vec3
uniform sampler2D uTexture; // sampler2D is a specific type for texture

varying vec2 vUv;
varying float vElevation;

void main() 
{

    // [texture2D(...)] to take pixel colors from a texture and apply the in the fragment shader, we must use the texture2D(...) function. 
    // the first param => texture
    // the second param => the coordinates of where to pick the color on that texture
    vec4 textureColor = texture2D(uTexture, vUv);


    // add shadow like effect
    textureColor.rgb *= vElevation * 2.0 + 0.5;

    gl_FragColor = textureColor;

    // gl_FragColor = vec4(uColor, 1.0);
}