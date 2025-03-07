import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Red Green Blue Exponent Loader where exponent stores the brightness
// It is the encoding for HDR format
import { GroundedSkybox, RGBELoader } from 'three/examples/jsm/Addons.js'


/**
 * Loaders
 */

const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
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


// [LDR cube texture (Low Dynamic Range)]
// const environmentMap =
//     cubeTextureLoader.setPath('/textures/environmentMap/0/')
//         // the order matters
//         .load([
//             'px.png', // px => positive x
//             'nx.png', // nx => negative x
//             'py.png',
//             'ny.png',
//             'pz.png',
//             'nz.png'
//         ])

// scene.background = environmentMap
// scene.environment = environmentMap

// // [HDR (RGBE) equirectangular]
// // compared to LDR solution, it is much heavier to load and render
// // It can be mitigated with lower resolution and blurred background
// // Recommendation is to use only for lightning 

// rgbeLoader.load('/textures/environmentMap/blender/blender-2k-2.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     // scene.background = environmentMap
//     scene.environment = environmentMap
// })


// [Ground projected skybox]
// this effect makes the object is on top of the "ground" instead of floating in the scene
// this effect makes the environment map flat, so if there is object in the center of the scene, it might render weird such as '/textures/environmentMap/lesson24-1/2k.hdr'
// compared to LDR solution, it is much heavier to load and render
// It can be mitigated with lower resolution and blurred background
// Recommendation is to use only for lightning 

// rgbeLoader.load('/textures/environmentMap/lesson24-2/2k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     scene.background = environmentMap
//     scene.environment = environmentMap

//     const skybox = new GroundedSkybox(environmentMap, 15, 75) // this makes environment map like a hemisphere
//     // skybox.material.wireframe = true // we can see the environment becoming a hemisphere
//     skybox.position.y = 15
//     scene.add(skybox)
// })

// [Real time environment map]
const environmentMap = textureLoader.load('/textures/environmentMap/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = environmentMap


const holyDonuts = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
)

holyDonuts.position.y = 3.5
scene.add(holyDonuts)


// Cube render target: so models and objects can get the light from the holyDonuts. 
// The main idea is that we are going to render the scene inside our own environment map texture and that it’s going to be a cube texture.
// To render into a cube texture, we need to use a WebGLCubeRenderTarget.Render targets are textures in which we can store renders of any scene.

// Be careful with real-time environment maps. Doing 6 renders on each frame can be quite a lot in terms of performance. This is why you should keep an eye on the frame rate, try to use the smallest possible resolution on the WebGLCubeRenderTarget, and keep the scene that is being rendered in the environment map simple.
// Also, be careful with layers. It’s easy to get lost in what is being rendered. In addition, note that lights aren’t affected by layers.


// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
    256, // it will be 256 pixel for each square for the cube, so it will be 256 x 6
    {

        // The second parameter is an object whose properties will be used to set up the render target.
        // The only property that matters here is "type" in which we can choose the type of value that will be stored.
        // Since we want the same behaviour as an HDR with a high range of data, we should use THREE.HalfFloatType or THREE.FloatType. (default is LDR)
        // Float: uses 32 bits to store a wide range of values.
        // HalfFloat:  uses only 16 bits, but it’s still quite a wide range, the difference won’t be noticeable and it’s better for performance since it requires less memory:
        type: THREE.HalfFloatType
    }

)

// for the lighting, we will use the our own texture (cube render target)
scene.environment = cubeRenderTarget.texture

// Since we need to render one texture for each face of a cube, we need to render 6 square textures.
// We could use a PerspectiveCamera, do some maths, make sure the field of view fills one side perfectly, do the 6 renders, and combine them. 
// Or we can use the [CubeCamera] which will do that for us.

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)

// As you can see, all objects in the scene are now part of the environment map. (make torusKnot's roughness to 0 )
// It’s not necessarily a big deal and it depends on what you want in your environment map, but the helmet and the torus knot are blocking the light which is not ideal.
// We can fix with Layer

// Layer:
// Layer works like categories and can be set on any object inheriting from Object3D (Like Mesh)
// By setting layers on a camera, this camera will only see objects matching the same layers.
// As an example, if a camera has its layers set to 1 and 2, it’ll only see objects that have layers set to 1 or 2.
// By default, all objects and camera layers are set to 0.
// Note: layer does not work with lights

// To change the layers of an object or a camera, we can use 3 methods:
// object.layers.enable(...) which will add a layer;
// object.layers.disable(...) which will remove a layer;
// object.layers.set(...) which will enable a layer and disable all other layers automatically.

// In our case, we want the cubeCamera to only see the holyDonut, so let’s set its layers to 1:
cubeCamera.layers.set(1)

// We then want our holyDonut to be visible for both the default camera and the cubeCamera. And since the default layer is 0, we just need to add 1:
holyDonuts.layers.enable(1)

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
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


    if (holyDonuts) {
        holyDonuts.rotation.x = Math.sin(elapsedTime) * 2
        cubeCamera.update(renderer, scene)
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()