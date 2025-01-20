import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/shadows/bakedShadow.jpg')

bakedShadow.colorSpace = THREE.SRGBColorSpace

const simpleShadow = textureLoader.load('/textures/shadows/simpleShadow.jpg')
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
 * Lights
 */
// [Ambient light]
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// [Directional light]
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

directionalLight.castShadow = true
// optimizing shadow map by controlling mapSize
directionalLight.shadow.mapSize.width = 1024 // number needs to be a power of 2 for mipmapping
directionalLight.shadow.mapSize.height = 1024

// toggling near and far
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 5

// toggling amplitude to optimize the shadow map
// directionalLight camera is OrthographicCamera, that's why we have to adjust the size by `camera.top` `camera.right` etc

directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.bottom = -2

// blur shadow
// This technic doesn't use the proximity of the camera with the object (so it will have the same blur effect, to the all edges regardless of the distance of the light),
// it's a general and cheap blur
directionalLight.shadow.radius = 10 // or directionalLight.shadow.mapSize.width/height can be used to simulate "blurry"


const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)

directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)


// [SpotLight]

const spotLight = new THREE.SpotLight(0xffffff, 4, 10, Math.PI * 0.3)
spotLight.castShadow = true
spotLight.position.set(0, 2, 2)

scene.add(spotLight)

gui.add(spotLight, 'intensity').min(0.1).max(10).step(0.001).name('spotLight intensity')


// optimizing shadow map by controlling mapSize
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024


// toggling amplitude to optimize the shadow map
spotLight.shadow.camera.fov = 30 // this seems to get overwritten by angle of new THREE.SpotLight

// toggling near and far
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

// this needs to be instantiated after toggling shadow camera property otherwise the change won't be reflected on ui
// const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// scene.add(spotLightCameraHelper)


// [PointLight]
const pointLight = new THREE.PointLight(0xffffff, 2.7)
pointLight.castShadow = true

pointLight.position.set(-1, 1, 0)
scene.add(pointLight)


pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024

pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 4

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
// PointLight shadow camera uses PerspectiveCamera but in all 6 directions and finishes downward (so cameraHelper always will look downward) 
scene.add(pointLightCameraHelper)
/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)

// [Using Three.js real time shadow]
// To get real-time shadows in three.js, we must use a material that supports shadows (e.g., MeshStandardMaterial, MeshPhongMaterial, etc.).

// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     material
// )


// [Using baked shadow: option 1]
// If we use baked shadows instead, we can skip real-time shadow calculations
// and use MeshBasicMaterial, which is more performant, as it simply displays the baked shadow texture.

// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     new THREE.MeshBasicMaterial({
//         map: bakedShadow
//     })
// )

// plane.position.x = 1 // if we move the object, shadow is coming from texture so the shadow can not follow the position of the object

// [Using baked shadow: option 2]
// we create extra mesh/object and we add shadow texture there, and moves it when the object moves so we can "mimic" the shadow follows the object
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true, // to use alpha map, we have to make transparent prop as true
        alphaMap: simpleShadow
    })
)


plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5


sphereShadow.rotation.x = - Math.PI * 0.5 // this moves plane 90 degrees (it will be horizontally flat)
// sphereShadow.position.y = plane.position.y // the same number as plane.position.y will cause z-fighting
sphereShadow.position.y = plane.position.y + 0.01

scene.add(sphereShadow)



scene.add(sphere, plane)



sphere.castShadow = true
plane.receiveShadow = true


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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// activate the shadow map
// shadow does not being displayed with only this config
// we also need to 
// 1. go through each object and toggle if it can cast a shadow with `castShadow` and if it can receive shadow with `receiveShadow`
// 2. active the shadow on the lights
// renderer.shadowMap.enabled = true
renderer.shadowMap.enabled = false // without commenting out all the shadow related code, we can disable shadow just by adding this line
// we can change the shadowMap algorithm 
console.log(renderer.shadowMap.type)
// renderer.shadowMap.type = THREE.PCFSoftShadowMap // PCFSoftShadowMap won't enable radius (blur)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()



    // moves as circle

    // Math.cos return the number from -1 to 1 and we are multiplying by 1.5 so sphere can travel from -1.5 to 1.5
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    // by multiplying elapsedTime by 3, the Math.sin function completes more cycles in the same time pf time, causing the object's movement to appear faster and more frequent
    // by wrapping Math.abs, it will return the positive number all the times, enabling to mimic the bouncing effect
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

    // updateShadow
    sphereShadow.position.x = Math.cos(elapsedTime) * 1.5
    sphereShadow.position.z = Math.sin(elapsedTime) * 1.5
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    const scale = Math.max(1 - Math.abs(sphere.position.y), 0.6)
    sphereShadow.scale.set(scale, scale, scale)



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()