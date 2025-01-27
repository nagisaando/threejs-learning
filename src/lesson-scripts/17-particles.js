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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test cube
 */
// const particleGeometry = new THREE.SphereGeometry(1, 32, 32)
// const particleMaterial = new THREE.PointsMaterial({
//     size: 0.01,
//     sizeAttenuation: true // it toggles the size of particles depending on the distance from the camera, [false] is slightly more performant
// })

// // also we can set option by accessing particleMaterial[option]
// // particleMaterial.size = 1

// const particles = new THREE.Points(particleGeometry, particleMaterial)

// scene.add(particles)

// [creating random positions of particles]

const count = 5000
// to store vertex of particle, we need 3 element (x, y, z) from the array 
// [|x|y|z||x|y|z||x|y|z||....]
//  ------- these three items are used to create one vertex of particle
// Hence we need Float32Array that has the length of point * 3. 
const positions = new Float32Array(count * 3)

positions.forEach((point, i) => {
    positions[i] = (Math.random() - 0.5) * 10
})


// create buffer attribute based on the position array
const positionAttribute = new THREE.BufferAttribute(positions, 3) // 3 means each vertex uses 3 consecutive values from the array. 

// create geometry based on the buffer attribute 
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute("position", positionAttribute)

const material = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true
})

const mesh = new THREE.Points(particlesGeometry, material)
scene.add(mesh)

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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