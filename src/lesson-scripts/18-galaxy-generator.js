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
 * Galaxy
 */

const parameters = {}
parameters.count = 1000
parameters.size = 0.02


let particles
gui.add(parameters, 'count')
    .min(100)
    .max(10000000)
    .step(100)
    .onFinishChange((value) => {
        particles.geometry.setAttribute('position', createBufferAttribute(value))
    })

gui.add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange((value) => {
        particles.material.size = value

    })

function createBufferAttribute(count) {
    const positions = new Float32Array(count * 3) // we need three values per vertex

    for (let i = 0; i < count; i++) {
        const positionX = 0
        const positionY = 1
        const positionZ = 2

        const vertex = 3 // 3 elements from array create a vertex for particle


        positions[vertex * i + positionX] = (Math.random() - 0.5) * 3
        positions[vertex * i + positionY] = (Math.random() - 0.5) * 3
        positions[vertex * i + positionZ] = (Math.random() - 0.5) * 3
    }

    return new THREE.BufferAttribute(positions, 3)
}
const generateGalaxy = () => {





    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', createBufferAttribute(parameters.count))


    const particleMaterial = new THREE.PointsMaterial()
    particleMaterial.size = parameters.size
    particleMaterial.depthWrite = false // disable to store the depth of each particle
    particleMaterial.sizeAttenuation = true // the particle looks smaller when it is far from the camera
    particleMaterial.blending = THREE.AdditiveBlending // particle's color will be added to the particle behind enabling glow effect


    particles = new THREE.Points(
        particleGeometry,
        particleMaterial
    )




    scene.add(particles)
}


generateGalaxy()


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
camera.position.x = 3
camera.position.y = 3
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