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
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

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
    const colors = new Float32Array(parameters.count * 3) // r,g,b => to make color
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {

        // ==============================================[Position]============================================================

        const positionX = 0
        const positionY = 1
        const positionZ = 2


        const vertex = 3

        const radius = Math.random() * parameters.radius
        // [How to get branch angle] 
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


        // [How the spin angle affects particle placement]
        //
        // The `spinAngle` determines how far a particle is rotated based on its radius.
        // - As `radius` increases, `spinAngle = radius * parameters.spin` grows larger.
        // - This causes particles to be positioned further along a spiraling path.
        // - The result is a galaxy-like structure with particles following curved arms.
        //
        // 1. `radius` controls how far a particle is from the center.
        // 2. `parameters.spin` determines the amount of rotation applied.
        // 3. The combination of both results in a **spiral** shape.
        //
        // Visualization of how `spinAngle` affects particle placement:

        /**
         *              |           
         *              |           
         *              |           
         *              |           
         *              |           
         * -------------+--+--+--+--+--+--+-> x (horizontal axis)
         *              |  .        
         *              |     .      
         *              |           
         *              |        .   
         *              |          
         *              |       . 
         *              |    .
         *             .|
         *          .   |
         *              |
         *               v z (depth axis)
         */

        const spinAngle = radius * parameters.spin;  // Rotation effect increases as radius grows


        // (Math.random() - 0.5) * parameters.randomness will spread particles more on the outside by creating a random value for each axis and multiply it by the radius and randomness parameters
        // const randomX = (Math.random() - 0.5) * parameters.randomness
        // const randomY = (Math.random() - 0.5) * parameters.randomness
        // const randomZ = (Math.random() - 0.5) * parameters.randomness

        // However, want less randomness on the inside of the branch and more on the outside of the branch, and we can achieve using Math.pow:
        // Math.pow(0.25, 2) => 0.0625
        // Math.pow(0.5, 2)  => 0.25
        // Math.pow(0.75, 2) => 0.5625
        // Math.pow(1, 2)    => 1
        /**
         *  1  |                     *
         *     |                            
         *     |                          
         * 0.75| 
         *     |                       
         *     |                *        
         * 0.5 | 
         *     |                      
         *     |               
         * 0.25|          *   
         *     |     *              
         *     |_________________________> x
         *      0   .25   .5   .75   1   
         *          (0.25²) (0.5²) (0.75²)
         */

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) // we randomly multiply by 1 or -1 since assigning negative number to Math.pow() will give unintended result
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)


        // printing something 20 times to test the values
        // if (i < 20) {
        //     console.log(`spinAngle: radius => ${radius}, parameters.spin => ${parameters.spin}`)
        //     console.log(`radius * parameters.spin => ${spinAngle}`)
        //     console.log('=================================')
        // }

        positions[i * vertex + positionX] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i * vertex + positionY] = 0 + randomY
        positions[i * vertex + positionZ] = Math.sin(branchAngle + spinAngle) * radius + randomZ


        // ==========================================================================================================

        // ===============================================[Color]===========================================================

        const color = 3

        const r = 0
        const g = 1
        const b = 2

        //  create a third color by cloning colorInside and use the "lerp(...)" method to mix it with colorOutside and create a middle color
        const mixedColor = colorInside.clone() // if we directly assign colorInside to "lerp()", we will mutate colorInside so we have to clone it
        // the second parameter [alpha] determine how much we want to mix the other color (0 is none).
        // by radius / parameters.radius, we can get the ratio of the radius (0 to 1)
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i * color + r] = mixedColor.r
        colors[i * color + g] = mixedColor.g
        colors[i * color + b] = mixedColor.b
    }


    particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    particleMaterial = new THREE.PointsMaterial()
    particleMaterial.size = parameters.size
    particleMaterial.depthWrite = false // disable to store the depth of each particle
    particleMaterial.sizeAttenuation = true // the particle looks smaller when it is far from the camera
    particleMaterial.blending = THREE.AdditiveBlending // particle's color will be added to the particle behind enabling glow effect
    // particleMaterial.color = new THREE.Color('red')
    particleMaterial.vertexColors = true // notifying we are going to use vertexColor by passing color attribute to the geometry


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

gui.add(parameters, 'spin')
    .min(-5)
    .max(20)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'randomness')
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)


gui.addColor(parameters, 'insideColor')
    .onFinishChange(generateGalaxy)

gui.addColor(parameters, 'outsideColor')
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