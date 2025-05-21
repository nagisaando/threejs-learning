import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from '../shaders/lesson-38-earth/vertex.glsl'
import earthFragmentShader from '../shaders/lesson-38-earth/fragment.glsl'

// by using shader to make earth, we can do the following: 
// - Cities in the dark side are illuminated
// - There are clouds
// - The Sun’s reflection is mostly visible on the oceans, not on the continents
// - The part between the day and the night called twilight looks red - ish
// - The atmosphere creates a glow all around the Earth, feeling like a volume


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
// texture link: https://www.solarsystemscope.com/textures/
// - day.jpg and the night.jpg files are two separated textures. We are going to send both to the shader and mix between them according to the orientation of the sun. 
// They have been encoded in sRGB.
const textureLoader = new THREE.TextureLoader()

const earthDayTexture = textureLoader.load('/textures/earth/day.jpg')
// three.js color space is linear by default, for the sRGB color's texture, we have to tell three.js
earthDayTexture.colorSpace = THREE.SRGBColorSpace

const earthNightTexture = textureLoader.load('/textures/earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace


// Anisotropy
// If you check the textures at a narrow angle, you’ll notice that they are slightly blurred: src/assets/lesson-38/texture-blurry.png

// This is because of the texture resolution and the magnification filter. We could try another magFilter on the texture, but there is actually another solution named "anisotropy".
// anisotropy is a property available on textures that will improve the sharpness of the texture when seen at a narrow angle by applying different levels of filtering.
// The higher the anisotropy, the sharper the texture, and the default value is 1.

// [NOTE]
// there are hardware limitations and you can’t use any value on anisotropy.
// One way of determining the limitation, is to use the following instruction after instantiating the renderer:
// console.log(renderer.capabilities.getMaxAnisotropy())
// however usually 8 works fine without any issue
// some old device possibly works only with 4 so 4 is fine too. 
// Also anisotropy can impact performance if the number is too big
earthDayTexture.anisotropy = 8
earthNightTexture.anisotropy = 8
earthSpecularCloudsTexture.anisotropy = 8



// - specularClouds.jpg contains the specular texture (where it’s reflective) into the red channel and the clouds texture into the green channel.
// Combining data like this reduces the amount of memory we allocate to the GPU.The texture is encoded in linear.
const earthSpecularCloudsTexture = textureLoader.load('static/textures/earth/specularClouds.jpg')
/**
 * Earth
 */
// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3())
    }
})

const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

/**
 * Sun
 */
// we are going to use the Spherical class to handle the coordinates of sphere and convert them to a Vector3.
// phi (second param): Angle from the y-axis (0 to π). Poles are at phi = 0 (top) and phi = π (bottom).
// theta (third param): Angle around the y - axis(0 to 2π), starting from the positive z - axis.

const sunSpherical = new THREE.Spherical(
    1, // radius: Since the sunSpherical radius is set to 1, sunDirection length should be 1, meaning it’s already normalized, which is the requirement for dot product 
    Math.PI * 0.5, // phi: around middle point
    0.5 // theta
)

const sunDirection = new THREE.Vector3();


// Debug
const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)
scene.add(debugSun)

const updateSun = () => {

    // we are converting spherical coordinate to vec3
    sunDirection.setFromSpherical(sunSpherical)
    console.log(sunDirection)
    debugSun.position.copy(sunDirection)
    // since sunSpherical's radius is 1 and the earth radius is 2,
    // debugSun shows inside the earth. so instead we multiply the position and show it far away from the earth (it keep the same direction)
    // we don't want to change the radius of sunSpherical because sunDirection returns the length of 1 for the radius 1 which requires for dot product in fragment shader
    debugSun.position.multiplyScalar(5)

    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}

updateSun()


// Tweaks
gui.add(sunSpherical, 'phi')
    .min(0) // bottom
    .max(Math.PI) // top
    .onChange(updateSun)

gui.add(sunSpherical, 'theta')
    // this will enable bugSun to go all the around the earth
    .min(-Math.PI)
    .max(Math.PI)
    .onChange(updateSun)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()