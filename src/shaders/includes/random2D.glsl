// in glsl file, there is no built in Math.random() but we can make function and mimic the random function
// get random value (it is pattern but hard to predict for human brain) from 0 to 1
float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
