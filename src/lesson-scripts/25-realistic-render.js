import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
// how to configure environment map data in polyHaven around 40:00
// https://threejs-journey.com/lessons/realistic-render#
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

// activate the shadows on all the Meshes
const updateAllMaterials = () => {
    scene.traverse((child) => { // scene.traverse will go through all children and grandchildren of the scene 

        if (child.isMesh && child.material?.isMeshStandardMaterial) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Texture
 */

const textureLoader = new THREE.TextureLoader()

// for data texture such as normal, metal, roughness etc, it is better to go with jpg. 
const wallColorTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg')

// SRBG => to optimize how colors are being stored.

// Color space is a way to optimize how colors are being stored according to the human eye sensitively.
// It is not saving the color like from 0 to 255, because eye is more sensitive to small changes when it's dark and less sensitive when it's bright
// and also sensitive differs when using R and B and G. So, sRBG will change how it's being stored.

// usually textures that contain color that will be seen by the users are saved with the sRBG color (castle_brick_broken_06_diff_1k.jpg) space NOT linear color space. 
// textures related to storing data (Normal, AO) is stored in linear color space

// when three.js load the textures, it sets the color space to linear including color texture
// so we have to tell three.js explicitly that for the color texture, we are using SRGB Color space

// For the model (FlightHelmet.gltf), we don't need to set SRBG color space because the information is already set inside the GLTF file and Three.js knows what color space to use on the textures

wallColorTexture.colorSpace = THREE.SRGBColorSpace


wallColorTexture.repeat.x = 2.5 // this will make the image 1/2 however instead of repeating the image, the last pixel of the image is used to fill the rest of 1/2 space 

wallColorTexture.wrapS = THREE.RepeatWrapping // this will make the image repeat correctly

const wallARMTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg')
const wallNormalTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg')


const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg')
floorColorTexture.colorSpace = THREE.SRGBColorSpace

const floorARMTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png')



const wall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), new THREE.MeshStandardMaterial(
    {
        map: wallColorTexture,
        metalnessMap: wallARMTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    }
))

wall.position.y = 4
wall.position.z = -4

scene.add(wall)

const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), new THREE.MeshStandardMaterial(
    {
        map: floorColorTexture,
        metalnessMap: floorARMTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        normalMap: floorNormalTexture
    }
))

floor.rotation.x = -Math.PI / 2
scene.add(floor)

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

// Hamburger
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)


gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.x = 6
        scene.add(gltf.scene)
    }
)




/**
 * Lights
 */
// Environment maps can not cast shadows. 
// We need to add a light that roughly matches the lighting od the environment  map and use it to cast shadows 

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 20
// if there are enough details in the model/scene, having a smaller shadow map would not cause much problems (smaller shadow map males shadow blurry)
directionalLight.shadow.mapSize.set(512, 512) // power of 2 and square is strongly recommended!
gui.add(directionalLight, 'castShadow')

directionalLight.position.set(-4., 6.5, 2.5)
gui.add(directionalLight.position, 'x')
    .min(-10)
    .max(10)
    .step(0.001)

gui.add(directionalLight.position, 'y')
    .min(-10)
    .max(10)
    .step(0.001)


gui.add(directionalLight.position, 'z')
    .min(-10)
    .max(10)
    .step(0.001)

gui.add(directionalLight, 'intensity')
    .min(-10)
    .max(10)
    .step(0.001)

scene.add(directionalLight)

// by default, the light targets the center of the scene. 
// we can change the target position by directionalLight.target.position.set()
// 
// Three.js is using matrices to send them to the shaders and define object transform. 
// When we change properties like position, rotation and scale, those will be complied into a matrix
// This process is done right before the object is rendered and only if it's in the scene. 
//  
// if we try to change the position by directionalLight.target.position.set(), it would not change the position really 
// because directionalLight.target is not in the scene. so we have to add directionalLight.target to the scene first
scene.add(directionalLight.target)
directionalLight.target.position.set(0, 4, 0)

// or instead of scene.add(directionalLight.target), we can update the matrix manually using the updateWorldMatrix()
// directionalLight.target.updateMatrixWorld()

// 
directionalLight.shadow.camera.right = 6
directionalLight.shadow.camera.top = 4
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.bottom = -4


// [Shadow acne]
// The problem of using hamburger model: there is strips cover its face. It can be more obvious by lowering envMapIntensity
// scene.environmentIntensity = 0

// Shadow acne can occur on both smooth and flat surface for precision reasons when calculating if the surface is in the shadow or not. 
// THe hamburger is casting a shadow on its own surface (See: src/assets/lesson-25/shadow-acne.png)

// solutions
// We have to tweak the light shadow's "bias" and "normalBias", and we need to tweak the both to get the good result
// "bias": usually helps for flat surfaces (moving everything away or closer from the camera shadow)
// "normalBias": usually helps for rounded surface (make the hamburger/object bigger or smaller)

directionalLight.shadow.normalBias = 0.027
directionalLight.shadow.bias = - 0.04

gui.add(directionalLight.shadow, 'normalBias').min(-0.05).max(0.05).step(0.001)
gui.add(directionalLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001)

// It is to help to understand where the light is coming from and where it is pointing.
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(directionalLightHelper)


// helper for the shadow
// It is to see the area of the scene that is being used to calculate shadows
const directionalLightShadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightShadowCameraHelper)






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



// Shadows

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

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