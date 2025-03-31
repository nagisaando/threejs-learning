uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uTime;
uniform float uBigWaveSpeed;
void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float waveX = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWaveSpeed);
    float waveZ = sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWaveSpeed);
    float elevationY = waveX * waveZ * uBigWavesElevation;

    modelPosition.y += elevationY;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

}