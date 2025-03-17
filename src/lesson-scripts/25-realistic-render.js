import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child.isMesh) {
            // Activate shadow here
        }
    })
}

/**
 * Environment map
 */

// Intensity
scene.environmentIntensity = 1
gui
    .add(scene, 'environmentIntensity')
    .min(0)
    .max(10)
    .step(0.001)

// HDR (RGBE) equirectangular (using HDR causes performance issue)
rgbeLoader.load('/textures/environmentMap/lesson24-0/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
})


/**
 * Models
 */
// Helmet
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Lights
 */
// Environment maps can not cast shadows. 
// We need to add a light that roughly matches the lighting od the environment  map and use it to cast shadows 

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
// const directionalLightCameraHelper
directionalLight.castShadow = true
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true


/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: window.devicePixelRatio > 1 // Multi sampling (MSAA), we will enable it only when the screen has the pixel ratio of 1 for performance concern
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



// Tone mapping 
// intends to convert High Dynamic Range (HDR) values to Low Dynamic Range (LDR) values
// Tone mapping in Three.js will actually fake the process of converting LDR to HDR even if the colors aren't HDR resulting in a very realistic render

// - THREE.NoToneMapping (default)
// - THREE.LinearToneMapping
// - THREE.ReinhardToneMapping
// - THREE.CineonToneMapping
// - THREE.ACESFilmicToneMapping

// we can also customize Tone mapping
renderer.toneMapping = THREE.ReinhardToneMapping // Color looks washed out but very realistic like with a poorly set camera

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    ReinHard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})

// This will determine how much light to let in / How strong the tone mapping is. 
renderer.toneMappingExposure = 3

gui.add(renderer, 'toneMappingExposure')
    .min(0)
    .max(10)
    .step(0.001)


// [Antialiasing]
// aliasing, an artifact that might appear in some situations where we can see a stair-like effect especially in the edge of the geometries
// sometimes aliasing is more obvious depending on how detail the model is, and the pixel ratio


// Why this occurs? => When the rendering of a pixel occurs, it tests what geometry is being rendered in that pixel. 
// It calculates the color, and in the end, that color appears on the screen. 
// example: when the circle is drawn the screen, it will calculates whether the color should be applied to the color
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲

// the edge is causing the stair-like effect (aliasing)
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🟧🟧
// 🔲🔲🔲🔲🔲🔲🔲🟧🟧🟧🟧
// 🔲🔲🔲🔲🔲🔲🟧🟧🟧🟧🟧
// 🔲🔲🔲🔲🔲🔲🟧🟧🟧🟧🟧
// 🔲🔲🔲🔲🔲🔲🟧🟧🟧🟧🟧
// 🔲🔲🔲🔲🔲🔲🔲🟧🟧🟧🟧

// - Solution 1: Super sampling (SSAA) / full screen sampling (FSAA) 
// (There are more but these are the common one)
// we increase the resolution beyond the actual one. 
// When resized to its normal-sized, each pixel color will automatically be averaged from the 4 pixel rendered. It is easy but BAD for performance
// But depending on the other factors (whether there are other elements that cause performance issue or not), it can be beneficial
// one pixel will be: 
// 🔲
// increase to 4 pixels: 
// 🔲🔲
// 🔲🔲
// and shrink down to the original pixel size: 
// 🔲


// Solution2: Multi sampling (MSAA) (Performance is better than first solution since it applies only to the edges)
// Automatically performed by most recent GPUs
// Will check the neighbors of the pixel being rendered, and if it's the edge of the geometry, will mix its color with those neighbor's colors
// Only works on geometry

// example: 
// to apply a color of the point of red
// it will also check the color of the neighbors' color as well (✅) and blends the color
// 🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲✅✅🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲✅🟥🟧🟧🟧
// 🔲🔲🔲🔲🔲🔲🟧🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🟧🔲🔲🔲🔲
// 🔲🔲🔲🔲🔲🔲🟧🔲🔲🔲🔲

// we can enable it by adding true to antialias property
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     antialias: window.devicePixelRatio > 1 <------ we will enable it only when the screen has the pixel ratio of 1 for performance concern
// })

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()