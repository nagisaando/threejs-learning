import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from '../shaders/lesson-39/particles/vertex.glsl'
import particlesFragmentShader from '../shaders/lesson-39/particles/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()


/**
 * Displacement
 */
// https://simon.html5.org/dump/html5-canvas-cheat-sheet.html

const displacement = {}

displacement.canvas = document.createElement('canvas')
displacement.canvas.width = 128 // 128 is the same number of the particles on the screen from particlesGeometry
displacement.canvas.height = 128

displacement.canvas.style.position = 'fixed'
displacement.canvas.style.top = 0
displacement.canvas.style.left = 0
displacement.canvas.style.width = '512px'
displacement.canvas.style.height = '512px'

displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillStyle = 'black'
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

document.body.append(displacement.canvas)

displacement.glowImage = new Image()
displacement.glowImage.src = '/textures/lesson-39/glow.png'

window.setTimeout(() => {
    displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32)

}, 1000)


// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates for Raycaster:
// with new THREE.Vector2(), the cursor's default position will be at the center of the picture, 
// and animation for particles occurs without user interacting actively. 
// so we set 9999 so that we can "simulate" the cursor is really far
displacement.screenCursor = new THREE.Vector2(9999, 9999)

// Coordinates for canvas:
displacement.canvasCursor = new THREE.Vector2(9999, 9999)




window.addEventListener('pointermove', (e) => {
    // convert the screen coordinates (which are in pixels) to clip space coordinates (from -1 to +1):
    displacement.screenCursor.x = e.clientX / sizes.width * 2 - 1
    displacement.screenCursor.y = -(e.clientY / sizes.height * 2 - 1) // we want y coordinate to be 1 on top and -1 in the bottom
})



// interactive plane 

// To draw that glow image on 2d canvas (displacement.canvas) on each frame relative to the cursor on the particles, 
// we are going to use a [Raycaster] to do so.

// But, the Raycaster won’t work with the particles because it requires a geometry made out of vertices and triangles. (and we are using particle new THREE.Points())
// To fix that, we are going to create a plane at the exact same position as the particles, make it invisible, and use the Raycaster on that plane.
displacement.interactivePlane =
    new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({
            color: 'red'
        }))

scene.add(displacement.interactivePlane)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)



/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPictureTexture: new THREE.Uniform(textureLoader.load('/textures/lesson-39/picture-4.png'))
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()


    /**
     * Raycaster
     */

    displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)

    if (intersections.length) {
        const uv = intersections[0].uv
        displacement.canvasCursor.x = uv.x * displacement.canvas.width
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
    }

    displacement.context.drawImage(displacement.glowImage, displacement.canvasCursor.x, displacement.canvasCursor.y, 32, 32)


    /**
     * Displacement
     */

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()