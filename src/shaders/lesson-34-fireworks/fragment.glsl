uniform sampler2D uTexture;

void main() {

    // instead of uv, we have to use gl_PointCoord to map the position of texture
    // because points don't have surfaces (no faces => no UVs)
    // THREE.Points object is just a collection of vertices (points in space), not a connected mesh with faces. 
    float textureAlpha = texture2D(uTexture, gl_PointCoord).r;
    gl_FragColor = vec4(1, 1, 1, textureAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}