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

    // Atmosphere 
    // One beautiful aspect of planets is the atmosphere and how the light passes through it.
    // This effect is more pronounced at a narrow angle because we see more of the atmosphere:
    // src/assets/lesson-38/atmosphere-angle.png

    // It looks blueish on the day side, it’s invisible on the night side and it looks redish in the twilight, which is where the day side meets the night side.
    // src/assets/lesson-38/atmosphere-color.png

    // Fresnel for Atmosphere 
    // we need fresnel to make the atmosphere more visible on the edges of the planet.
    // We can do that the normal and view angle
    // we want a value to be 1.0 when the view angle is perpendicular to normal and
    // 0.0 when the view angle is aligned with the normal

    // to compare viewDirection(view angle) with normal(normal), we are going to use a dot product
    // considering two vectors of the same length: 
    // - If they are in the same direction, we get 1
    // - If they they are perpendicular, we get 0
    // - If they are opposite, we get -1
    // - In between values are interpolated (e.g. -0.5)
    
    // keep in mind, to get the fresnel effect, we want 1 if they are perpendicular and 0 if they are the opposite direction
    // so we will add 1 so we can get the appropriate value to get fresnel effect

    float fresnel = dot(viewDirection, normal) + 1.0;

    // apply power to the fresnel to make it sharper
    fresnel = pow(fresnel, 2.0);


    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    
    // with color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);, 
    // the atmosphere is way too visible on the night side of the Earth.
    // we can multiply fresnel by atmosphereDayMix which lower the value on the night side 
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular (the reflection of the sun) 
    // src/assets/lesson-38/specular.png


    // specular (https://threejs-journey.com/lessons/lights-shading-shaders#specular)
    // We need the light reflection. the light is illuminating the surface, but in real life we can also see the light itself reflecting on the surface of the object and we call this “specular”.
    // In order to calculate the specular, we are going to calculate the reflecting vector of the light on the surface and compare it to the view vector.
    // The more they are aligned, the more specular: src/assets/lesson-35/specular.png

    // currently lightDirection is pointing from the object to light but light direction should point from light to object 
    // so we invert it by adding "-" before lightDirection
    vec3 lightReflection = reflect(-uSunDirection, normal);



    // we can check how specular looks
    // float specular = dot(lightReflection, viewDirection);
    // color = vec3(specular);
    // we can see the the light reflection where that is opposite to where the light is point to

    // this is because how dot works, if they are the same direction, we get 1, and if it's opposite, we get -1
    // since the value we want and the value the dot is returning is opposite so we will invert it using "-"
    float specular = -dot(lightReflection, viewDirection);

    // since dot can go -1 to 1, and we want 0 to be minimum value, 
    // we clamp it using max(). Otherwise when we do power by pow() it will messes up 
    // https://www.desmos.com/calculator/ix22rvaly0 
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);


    // Multiply the specular by the specular map which is available in the r channel of specularCloudColor
    // which will prevent reflection if the light is pointing to the continents
    specular *= specularCloudColor.r;

 

    // if we only add specular, which is white, if we see the earth from back side,
    // the light is too bright and overrides the color of atmosphere (red-ish color)
    // color += specular;

    // We want the specular to have the color of atmosphereColor, 
    // but only when that specular is on the edges. we can mix the color using the fresnel.
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    
    // apply specular with specularColor which take atmosphere color into consideration
    color += specular * specularColor;
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



