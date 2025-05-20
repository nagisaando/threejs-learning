varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation: 
    vec3 uSunDirection = vec3(0, 0, 2.0);

    // we will check the orientation of sun against the normal of the earth
    // src/assets/lesson-38/sun-direction.png

    // dot product:
    // - If they are in the same direction, we get 1
    // - If they they are perpendicular, we get 0
    // - If they are opposite, we get -1
    // - In between values are interpolated (e.g. -0.5)

    float sunOrientation = dot(uSunDirection, normal);

    // the bright part (1) is going to be day light and the dark part (-1) is going to be night
    // color = vec3(sunOrientation); <==== we can check how dot product is working
    // https://www.desmos.com/calculator/nqrwjvu6tc
    // smoothstep makes the value(-1 to 1) to 0 to 1
    float mixDay = smoothstep(-0.25, 0.5, sunOrientation); // we are making the day part bigger since the light reflects and never half dark half bright


      
    // Day / night color

    // texture2D is deprecated
    // use texture() instead
    // https://stackoverflow.com/questions/12307278/texture-vs-texture2d-in-glsl
    vec3 dayTexture = texture(uDayTexture, vUv).rgb; // by default, texture() returns vec4 rgba
    vec3 nightTexture = texture(uNightTexture, vUv).rgb;

    // mix() will mix the two colors
    // 1st, 2nd params => color
    // 3rd param => ratio of mixing color
    //              if 3rd param is "0" => it will take the first color
    //              if 3rd param is "1" => it will take the second color
    vec3 dayNight = mix(nightTexture, dayTexture, mixDay);
    color = dayNight;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}