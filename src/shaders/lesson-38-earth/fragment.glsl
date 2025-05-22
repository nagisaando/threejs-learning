varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
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

    // the bright part (1) is going to be day light and the dark part (-1) is going to be night
    // color = vec3(sunOrientation); <==== we can check how dot product is working
    // https://www.desmos.com/calculator/nqrwjvu6tc
    // smoothstep makes the value(-1 to 1) to 0 to 1
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation); // we are making the day part bigger since the light reflects and never half dark half bright


      
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
    vec3 dayNight = mix(nightTexture, dayTexture, dayMix);
    color = dayNight;



    // Cloud
    // How to make clouds 
    // 1. adding the clouds on a sphere on top of the actual earth, which enables some flexibility like rotating the clouds independently.
    //    Unfortunately, rotating the clouds as a full mesh doesn’t look very good and we would need to make the sphere slightly bigger to prevent z-fighting which can look a bit weird.
    // 2. add Perlin noise and animate, which is pretty complex
    // 3. add the clouds directly in the shader and not animate them  <------ we will do this


    // Specular cloud color
    vec2 specularCloudColor = texture(uSpecularCloudsTexture, vUv).rg; 
    float cloudsMix = specularCloudColor.g;
    // to reduce the amount of the cloud, we will use smoothstep
    cloudsMix = smoothstep(0.4, 1.0, cloudsMix);

    // change cloud based on the day/night
    // option 1: make cloud darker at night, white at the day
    float cloudColor = smoothstep(-0.1, 1.0, dayMix); 
    vec3 cloud = mix(color, vec3(cloudColor), cloudsMix); // if cloudsMix is 1, it takes vec3(1, 1, 1) (white);
   
    // option 2: remove cloud at night
    // cloudsMix *= dayMix;
    // vec3 cloud = mix(color, vec3(1.0), cloudsMix);

    color = cloud;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}


