// variable that will never change, we can save it as a define
#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

// since there is no function to gives random number, we have to create one
// actually it is not a random number, if we pass 0.5, it always returns the same number, but it make it look like a number
// https://thebookofshaders.com/10/
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}


//	Classic Perlin 2D Noise https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83#classic-perlin-noise
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//

vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}



void main()
{
    // [pattern 1]:
    // default uv of Three.Plane geometry, it will return the value from 0 to 1
    // gl_FragColor = vec4(vUv, 1.0, 1.0); // same as vec4(vUv.x, vUv.y, 1.0, 1.0);

    // [pattern 2]:
    // gl_FragColor = vec4(vUv, 0, 1.0);

    // [pattern 3]:
    // float strength = vUv.x;
    // gl_FragColor = vec4(vec3(strength), 1.0); // same as  vec4(vUv.x, vUv.x, vUv.x, 1.0);
    
    // [pattern 4]:
    // float strength = vUv.y;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // [pattern 5]:
    // float strength = 1.0 - vUv.y;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // [pattern 6]:
    // float strength = vUv.y * 10.0;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // [pattern 7]:
    // At vUv.x = 0.15 → 0.15 * 10 = 1.5 → mod(1.5, 1.0) = 0.5
    // At vUv.x = 0.23 → 2.3 → mod(2.3, 1.0) = 0.3
    // At vUv.x = 0.99 → 9.9 → mod(9.9, 1.0) = 0.9
    // float strength = mod(vUv.y * 10.0, 1.0);
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // [pattern 8]:
    // DO NOT USE CONDITION FOR SHADER. It causes performance issue!
    // float strength = mod(vUv.y * 10.0, 1.0);
    // if(strength > 0.5) {
    //     strength = 0.0;
    // } else {
    //     strength = 1.0;
    // }

    // Instead, use STEP()
    // step(edge, x) returns:
    // - 0.0 when x < edge
    // - 1.0 when x >= edge

    // float strength = mod(vUv.y * 10.0, 1.0);
    // // it returns 0.0 for all values below 0.5 (first half of each stripe)
    // // and it returns 1.0 for all values equal to or above 0.5 (second half)
    // strength = step(0.5, strength);

    // [pattern 9]:
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.8, strength);

    // [pattern 10]:
    // float strength = mod(vUv.x * 10.0, 1.0);
    // strength = step(0.8, strength);

    // [pattern 11]:
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 10.0, 1.0));

    // [pattern 12]:
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // [pattern 13]:
    // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // [pattern 14]:
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // float barY = step(0.8, mod(vUv.x * 10.0, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

    // float strength = barX + barY;

    // [pattern 15]:
    // float barX = step(0.4, mod(vUv.x * 10.0 , 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));

    // float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

    // float strength = barX + barY;

    // [pattern 16]:
    // float strength = abs(vUv.x - 0.5); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)

    // [pattern 17]:
    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)

    // [pattern 18]:
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)

    // [pattern 19]:
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)

    // [pattern 20]:
    // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)
    // float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))); // it will return 0.5 when vUv.x is 0, and returns 0.5 when vUv.x is 1 (absolute number)
    // float strength = square1 * square2; 
     
    // [pattern 21]:
    // float strength = floor(vUv.x * 10.0) / 10.0; 

    // [pattern 22]:
    // float strength = floor(vUv.x * 10.0) / 10.0; 
    // strength *= floor(vUv.y * 10.0) / 10.0; 

    // [pattern 23]:
    // float strength = random(vUv);

    // [pattern 24]:
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0,
    //     floor(vUv.y * 10.0) / 10.0
    // );
    // float strength = random(gridUv);

    // [pattern 25]:
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0,
    //     floor(vUv.y * 10.0 + vUv.x * 5.0) / 10.0
    // );
    // float strength = random(gridUv);


    // [pattern 26]:
    // float strength = length(vUv); // getting the length of UV (0 to 1 from left bottom to outside)

    // [pattern 27]:
    // float strength = length(vUv - 0.5);

    // Instead, we will get the distance between vUv and the center of our plane. 
    // Because our plane UV goes from 0.0, 0.0 to 1.0, 1.0, the center is 0.5, 0.5. 
    // We are going to create a vec2 corresponding to the center and get the distance from the vUv with the distance(...) function:
    // float strength = distance(vUv, vec2(0.5, 0.5));

    // [pattern 28]:
    // float strength = 1.0 - distance(vUv, vec2(0.5));

    // [pattern 29]: spot light effect
    // float strength = 0.015 / distance(vUv, vec2(0.5));

    // [pattern 30]
    // float strength = 0.15 / (distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));

    // [pattern 31] star like effect
    // float strength = 0.15 / (distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
    // strength *= 0.15 / (distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5)));
    
    // [pattern 32] rotated star like effect
    // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5)); // PI * 0.25 => 1/8 rotation

    // vec2 lightUvX = vec2(rotatedUv.x * 0.1 + 0.45, rotatedUv.y * 0.5 + 0.25);
    // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
    
    // vec2 lightUvY = vec2(rotatedUv.y * 0.1 + 0.45, rotatedUv.x * 0.5 + 0.25);
    // float lightY = 0.015 / distance(lightUvY, vec2(0.5));

    // float strength = lightX * lightY;
   
    // [pattern 33] black circle in the middle
    // float strength = step(0.25, distance(vUv, vec2(0.5)));

    // [pattern 34] blurry black ring in the middle
    // float strength = abs(distance(vUv, vec2(0.5)) - 0.25);

    // [pattern 35] black ring in the middle
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
    
    // [pattern 36] white ring in the middle
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));

    // [pattern 37] floating white wavy string in the middle (looking like sinus wave)
    // vec2 wavedUv = vec2(
    //     vUv.x,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1 // 30.0 adjust the frequency of the wave, 0.1 makes the sin return number smaller (0 to 1 => 0 to 0.09)
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // [pattern 38] similar to 37
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 30.0) * 0.1,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1 // 30.0 adjust the frequency of the wave, 0.1 makes the sin return number smaller (0 to 1 => 0 to 0.09)
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // [pattern 39]
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 100.0) * 0.1,
    //     vUv.y + sin(vUv.x * 100.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));


    // [pattern 40]
    // to get the angle of a vector, use atan()
    // float angle = atan(vUv.x, vUv.y);
    // float strength = angle;


    // [pattern 41]
    // to get the angle of a vector, use atan()
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;

    // // [pattern 42]
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = angle;

    // [pattern 43]
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // angle *= 20.0;
    // angle = mod(angle, 1.0);
    // float strength = angle;

    // [pattern 44]
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;

    // float strength = sin(angle * 100.0);

    // [pattern 45]
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float sinusoid = sin(angle * 100.0);

    // float radius = 0.25 + sinusoid * 0.02;
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));

    // [pattern 46] Perlin noise, http://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83 (some of them in the link don't work)
    // which can be used to recreate nature shapes like cloud, water, fire, terrain, elevation,
    // but it can also be used to animate the grass or snow moving in the window
    // float strength = cnoise(vUv * 10.0);

    // [pattern 47]
    // float strength = step(0.0, cnoise(vUv * 10.0));

    // [pattern 48]
    // float strength = 1.0 - abs(cnoise(vUv * 10.0));

    // [pattern 49]
    // float strength = sin(cnoise(vUv * 10.0) * 20.0);
    

    // [pattern 50]
    float strength = step(0.9, sin(cnoise(vUv * 10.0) * 20.0));
   
    // clamp the strength
    // force the value to go min 0.0 and max 1.0
    strength = clamp(strength, 0.0, 1.0)
    // Color version 
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, 1.0);
    // if strength is 0, we get black
    // if strength is 1, we get the uvColor
    // if it's between, we get mix between those
    // when the value goes beyond one, the color gets extrapolated. 
    vec3 mixedColor = mix(blackColor, uvColor, strength);
    gl_FragColor = vec4(mixedColor, 1.0);

    // Black and white version
    // gl_FragColor = vec4(vec3(strength), 1.0);

}