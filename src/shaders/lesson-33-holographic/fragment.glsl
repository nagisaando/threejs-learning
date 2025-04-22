uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {


    // [normalize the normals]
    // there is a grid pattern on the surface
    // it is due to the normal length not being 1.0.
    // modelNormal returns length of 1 but between vertices, varying are interpolated. 
    // If two normalized vectors are interpolated, sometimes it ends up with the length of less than 1
    // so we have to re-normalized it
    vec3 normal = normalize(vNormal);



    // the below code "float fresnel = dot(viewDirection, normal) + 1.0;"
    // causes the back side to be 2, which causes invalid fresnel effect
    // we will invert the normal if normal is facing the back so it will get the correct effect
    // ========================
    // this is what normal looks like 
    //       back
    //        ⬆️
    //      *****     
    //    ********* ↗️  
    //   ***********  
    //   *********** ➡️
    //   ***********  
    //    ********* ↘️  
    //      *****     
    //        ⬇️
    //       front
    // ========================
    // => instead we will change invert the normal direction if it's facing to back
    // ========================
    //       back
    //        ⬇️ <---------------
    //      *****     
    //    ********* ↘️  <---------------
    //   ***********  
    //   *********** ➡️
    //   ***********  
    //    ********* ↘️  
    //      *****     
    //        ⬇️
    //      front
    // ========================
    
    if(!gl_FrontFacing) // if the fragment is facing back 
        normal *= -1.0; // we invert the normal

            
    
    
    
    // stripes
    // to create small gradients that go up and keep on repeating, we can use shader pattern using modelPositions
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0); // make the stripe sharper using power https://www.desmos.com/calculator/o7muw7cqik


    // [Fresnel effect] (also used for physically accurate rendering in three.js)
    // Holograms => represented with their outside looking brighter than the inside 
    // We can do that the normal and view angle
    // we want a value to be 1.0 when the view angle is perpendicular to normal and
    // 0.0 when the view angle is aligned with the normal

    // https://www.racoon-artworks.de/cgbasics/fresnel.php
    // https://www.dorian-iten.com/fresnel/
    // https://shanesimmsart.wordpress.com/2022/03/29/fresnel-reflection/

    // we are going to calculate the Fresnel in the fragment shader to avoid artifacts/ interpolation

    // - View vector 
    // It is a 3D vector that goes from the camera position to the fragment position
    // We can subtract vPosition by the cameraPosition

    // - Calculate vector position
    // => subtract the destination by the origin 

    // we are going to compare viewDirection with normal to see if the angle is perpendicular. 
    // we will need a special function that requires the vectors to have the same length, we can dy so by using normalize(), 
    // this will force the length to be 1
    vec3 viewDirection = normalize(vPosition - cameraPosition);

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


    // gl_FragColor = vec4(1, 1, 1, stripes); 
    // gl_FragColor = vec4(1, 1, 1, fresnel); 

    // falloff effect 
    // => fade out the alpha on the very edge of the object
    // we can use the same fresnel but remap it using a smoothstep
    float falloff = smoothstep(0.8, 0.0, fresnel);


    // holographic 
    // we can combine the stripes and fresnel by multiplying
    float holographic = stripes * fresnel;
    // add the fresnel on top of it to enforce the fresnel effect
    holographic += fresnel * 1.25;
    holographic *= falloff;

    gl_FragColor = vec4(uColor.rgb, holographic);


    // gl_FragColor = vec4(normal, 1); // we can use normal to see if the vNormal is working
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



