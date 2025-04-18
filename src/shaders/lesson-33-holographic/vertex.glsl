varying vec3 vPosition;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vPosition = modelPosition.xyz; // instead of world position, we can pass the relative position "position.xyz" so fragment patterns moves along with the object movement
}