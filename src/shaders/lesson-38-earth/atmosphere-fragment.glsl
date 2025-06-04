varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // we will check the orientation of sun against the normal of the earth
    // src/assets/lesson-38/sun-direction.png

    // dot product:
    // - If they are in the same direction, we get 1
    // - If they they are perpendicular, we get 0
    // - If they are opposite, we get -1
    // - In between values are interpolated (e.g. -0.5)

    float sunOrientation = dot(uSunDirection, normal);


    // Atmosphere 

    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    

    
    // this code was used for fragment shader for earth, but since this can make the atmosphere black in the night side
    // instead we play with alpha
    color = atmosphereColor;



    // Alpha: We need the alpha to lower fast at the very edge of the sphere but also on the night side.
    // src/assets/lesson-38/alpha.png

    // edgeAlpha is used to fade the atmosphere from the inside to outside

    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);
    // color = vec3(edgeAlpha); <------ try!!


    // dayAlpha is used to fade the atmosphere on the night side
    float dayAlpha = sunOrientation;
    dayAlpha = smoothstep(-0.5, 0.0, dayAlpha);

    float alpha = edgeAlpha * dayAlpha;

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



