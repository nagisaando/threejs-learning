import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


/**
 * Loaders
 */

const loader = new GLTFLoader()

loader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
    console.log(gltf)
    gltf.scene.scale.set(10, 10, 10)
    scene.add(gltf.scene)
})



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
 * Environment Map
 */

scene.environmentIntensity = 1
gui.add(scene, 'environmentIntensity')
    .min(0)
    .max(20)
    .step(0.001)


// backgroundBlurriness is useful when resolution is low or if you want the user to focus on the object in the foreground
scene.backgroundBlurriness = 0
gui.add(scene, 'backgroundBlurriness')
    .min(0)
    .max(1)
    .step(0.001)

// this controls only background intensity not the environment 
scene.backgroundIntensity = 1
gui.add(scene, 'backgroundIntensity')
    .min(0)
    .max(20)
    .step(0.001)


scene.backgroundRotation.y = 0

gui.add(scene.backgroundRotation, 'y')
    .min(0)
    .max(Math.PI * 2)
    .step(0.001)

scene.environmentRotation.y = 0

gui.add(scene.environmentRotation, 'y')
    .min(0)
    .max(Math.PI * 2)
    .step(0.001)


// LDR cube texture (Low Dynamic Range)
const textureLoader = new THREE.CubeTextureLoader()

const environmentMap =
    textureLoader.setPath('/textures/environmentMap/0/')
        // the order matters
        .load([
            'px.png', // px => positive x
            'nx.png', // nx => negative x
            'py.png',
            'ny.png',
            'pz.png',
            'nz.png'
        ])

scene.background = environmentMap
scene.environment = environmentMap
/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 1, color: 0xaaaaaa })
)

// Assign an environment map to the material for reflective lighting effects / reflections of the environment on the object's surface.
// torusKnot.material.envMap = environmentMap 

// if there are a lot of materials needs to reflect envmaps, we can do so by:
// scene.environment = environmentMap

torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

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
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()