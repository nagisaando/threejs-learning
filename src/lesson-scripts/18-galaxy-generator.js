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
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3

let particles
let particleGeometry
let particleMaterial

const generateGalaxy = () => {

    // destroying the old galaxy before re-calling this function when parameter is changed through GUI 
    if (particles !== undefined) {
        // https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
        particleGeometry.dispose() // this will free the memory 
        particleMaterial.dispose()
        scene.remove(particles)
    }

    const positions = new Float32Array(parameters.count * 3) // we need three values per vertex

    for (let i = 0; i < parameters.count; i++) {
        const positionX = 0
        const positionY = 1
        const positionZ = 2

        const vertex = 3

        const radius = Math.random() * parameters.radius
        // How to get branch angle 
        // 1. i % parameters.branches
        //    use modulo against index. if the "parameters.branches" is 3 (i % 3), it never reaches to 3.
        //    index[0] % 3 will be 0, index[1] % 3 will be 1, index[2] % 3 will be 2, index[3] % 3 will be 0 and so on
        //
        // 2. (i % parameters.branches) / parameters.branches)
        //    divide the result of i % parameters.branches by parameters.branches, which give a result of the ratio of full circle (assuming full circle is 1)
        //    (index[0] % 3 branches) / 3 branches = 0, (index[1] % 3 branches) / 3 branches = 0.33, (index[2] % 3 branches) / 3 branches = 0.66, (index[3] % 3 branches) / 3 branches = 0, and so on
        //
        // 3. ((i % parameters.branches) / parameters.branches) * (Math.PI * 2)
        //    we multiply the ratio by full circle (Math.PI * 2) which will give a angle for the circle
        // 4. assign it using Math.cos(angle) to x and  Math.cos(angle) to y, which will position to the circle angle

        const branchAngle = ((i % parameters.branches) / parameters.branches) * (Math.PI * 2)

        positions[i * vertex + positionX] = Math.cos(branchAngle) * radius
        positions[i * vertex + positionY] = 0
        positions[i * vertex + positionZ] = Math.sin(branchAngle) * radius
    }


    particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))


    particleMaterial = new THREE.PointsMaterial()
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

gui.add(parameters, 'count')
    .min(100)
    .max(10000000)
    .step(100)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)

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