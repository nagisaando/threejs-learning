import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

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
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
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

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

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
renderer.shadowMap.enabled = true

// we can change the shadowMap algorithm 
console.log(renderer.shadowMap.type)
// renderer.shadowMap.type = THREE.PCFSoftShadowMap // PCFSoftShadowMap won't enable radius (blur)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()