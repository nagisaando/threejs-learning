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
const particleTexture = textureLoader.load('/textures/particles/3.png')

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

const count = 20000
// to store vertex of particle, we need 3 element (x, y, z) from the array 
// [|x|y|z||x|y|z||x|y|z||....]
//  ------- these three items are used to create one vertex of particle
// Hence we need Float32Array that has the length of point * 3. 
const positions = new Float32Array(count * 3)

// creating color for each particles. we need 3 element (r, g, b) from the array 
// The geometry holds per-vertex colors and we can set colors!
// [|r|g|b||r|g|b||r|g|b||....]
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}



// create buffer attribute based on the position array
const positionAttribute = new THREE.BufferAttribute(positions, 3) // 3 means each vertex uses 3 consecutive values from the array. 

// create buffer attribute based on the colors array 
const colorAttribute = new THREE.BufferAttribute(colors, 3)


// create geometry based on the buffer attribute 
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute("position", positionAttribute)
particlesGeometry.setAttribute("color", colorAttribute)

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    alphaMap: particleTexture,
    transparent: true,
    // color: '#ff88cc'
})

particlesMaterial.vertexColors = true // This tells Three.js to use the colors defined in the geometry instead of the color property in the material. 



// particlesMaterial.color = new THREE.Color('#ff88cc') // if we want to specify the color after instantiating the material, we have to use new THREE.Color()


// [texture issue]
// It is using alpha map and the edge of particle is supposed to be transparent, and the element in the behind should be visible but instead it is hiding it. 
// It is because the particles are drawn in the same order as they are created, and WebGL does not really know which one is in front of the other. 

// [Solution 1: alphaTest]
// the alphaTest is a value between 0 and 1 that enables the WebGL t know when not to render the pixel according to that pixel’s transparency. By default, the value is 0 meaning that the pixel will be rendered anyway. Use 0.001
//  But some black-ish part might not be completely transparent. For this case, still the edge of the black is visible and hiding the back element
// particlesMaterial.alphaTest = 0.001

// [Solution 2: depthTest]
// When drawing, the WebGL tests if what’s being drawn is closer than what’s already drawn. That is called depth testing and can be deactivated with depthTest
// particlesMaterial.depthTest = false

// However, deactivating the depth testing might create bugs if you have other objects in the scene or particles with different colors 

// const box = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(box)

// [Solution 3: DepthWrite]
// The depth of what’s being drawn is stored in what we call a depth buffer (like a grey scale texture, and when drawing something else it checks the depth buffer to determine if the element should be in front or back). 
// Instead of not testing if the particle is closer than what’s in this depth buffer, we can tell the WebGL not to write particles in that depth buffer with depthWrite

// There might be some buggy stuff but it works most of the times 
// particlesMaterial.depthWrite = false

// const box = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(box)


// [Solution 4: Blending (has more performance impact compared to the solutions above)]
// The WebGL currently draws pixels one on top the other. With the blending property, we can tell the WebGL to add the color of the pixel to the color of the pixels already drawn. 
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
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

    // animate the particles
    // particles.rotation.y = elapsedTime


    // animate each particle (not ideal)
    // updating the whole attribute on each frame causes a lot of performance issue unless the number of particles is smaller
    // later lesson we will use custom shader and if we want this kind of animation, we should use it instead

    for (let i = 0; i < count; i++) {

        const x = 0 // position of array [x, y, z, x, y, z, ....]
        const y = 1
        const z = 2

        const vertex = 3 // 3 elements from array create a vertex for particle


        const xVertexValue = particlesGeometry.attributes.position.array[i * vertex + x]
        particlesGeometry.attributes.position.array[i * vertex + y] = Math.sin(elapsedTime + xVertexValue) // we are changing the position of y depending on x position, making it wavy motions
    }

    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()