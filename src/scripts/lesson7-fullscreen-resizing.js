import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xECA400 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
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
// this will limit to max 2 so even if for the device that has higher pixel ratio,
// this ensures the rendering looks good without creating unnecessary performance overhead.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // update camera
    camera.aspect = sizes.width / sizes.height

    // [camera.updateProjectionMatrix()] 
    // It recalculates the camera's projection matrix, which is the mathematical transformation used to project 3D points onto the 2D canvas. 
    // When you change certain camera properties (like aspect, fov, near or far), the projection matrix becomes invalid and needs to be recalculated.
    // If you don't call this method after modifying the camera's params, the rendered scene will not reflect the updated camera settings
    camera.updateProjectionMatrix()

    // update renderer (updating the canvas size as well)
    renderer.setSize(sizes.width, sizes.height)

    // this will ensure that if user who has multiple devices with different pixel ratio, 
    // moves the canvas to another screen (for example some users have 2 screens) and resizes,
    // we can adjust the pixel ratio
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

})

window.addEventListener('dblclick', () => {
    if (document.fullscreenElement) { // checking if it is full screen mode
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

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