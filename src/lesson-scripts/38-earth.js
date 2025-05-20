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
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture)
    }
})

const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)


// light helper 
const sunHelper = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial())
sunHelper.material.color.setRGB(1.0, 0.1, 0.1)
sunHelper.position.set(0, 0, 2)
scene.add(sunHelper)

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