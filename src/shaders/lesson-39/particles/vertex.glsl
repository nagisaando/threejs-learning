uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

varying vec3 vColor;
void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // pictureIntensity is used to change the color and the size
    // We do have access to the uv attribute of the geometry even though we are using that geometry for points. In addition, the uv corresponds to the default UV of a plane (0, 0 in the bottom left corner and 1, 1 in the top right corner).
    float pictureIntensity = texture(
        uPictureTexture, 
        uv // this is uniform of plane geometry not uv of point!
    ).r;

    // Point size
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);


    // varying 
    vColor = vec3(pow(pictureIntensity, 2.0)); // pow makes the color more darker (stronger)

    

}


// 1. the particles to be discs
// 2. the size of the particle depends on the brightness of the picture
// 3. modify the color of the particles to match the picture