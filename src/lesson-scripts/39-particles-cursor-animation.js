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
displacement.canvas.style.width = '256px'
displacement.canvas.style.height = '256px'

displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillStyle = 'black'
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

document.body.append(displacement.canvas)

displacement.glowImage = new Image()
displacement.glowImage.src = '/textures/lesson-39/glow.png'


// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates for Raycaster:
// with new THREE.Vector2(), the cursor's default position will be at the center of the picture, 
// and animation for particles occurs without user interacting actively. 
// so we set 9999 so that we can "simulate" the cursor is really far
displacement.screenCursor = new THREE.Vector2(9999, 9999)

// Coordinates for canvas:
displacement.canvasCursor = new THREE.Vector2(9999, 9999)

// Displacement as a texture
// To send displacement canvas to our particle shader.
// We have to convert it to a Three.js texture, using the CanvasTexture. https://threejs.org/docs/#api/en/textures/CanvasTexture
// Canvases are perfectly compatible with Three.js textures and the CanvasTexture is actually nothing but a Texture updating itself as soon as it is instantiated.
// and we need to update the texture after updating the canvas on tick()
displacement.texture = new THREE.CanvasTexture(displacement.canvas)



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
displacement.interactivePlane.visible = false
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
        uPictureTexture: new THREE.Uniform(textureLoader.load('/textures/lesson-39/picture-4.png')),
        uDisplacementTexture: new THREE.Uniform(displacement.texture)
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
        // uv coordinates are positive when going up while canvas coordinates are positive when going down
        // so we have to adjust it: (1 - uv.y), so cursor movement on uv matches with canvas
        // src/assets/lessom-39/uv-canvas-coordinate.png
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
    }

    /**
     * Displacement
     */

    // fade out
    // To fade it out, we are going to fill the whole canvas with a black rectangle as we did at the beginning, but that black rectangle will have a low opacity so that it doesn’t occlude everything in its draw.
    displacement.context.globalCompositeOperation = 'source-over' // since we are using  displacement.context.globalCompositeOperation = 'lighten in the code below, before we fill the black rectangle, we have to revert globalCompositeOperation back to default 'source-over
    displacement.context.globalAlpha = 0.02; // we will fade the glow image out
    displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

    // draw glow 
    // NOTE: As you can see, the trail never completely disappears. This is a common issue with 2D canvas where the precision of the color makes it hard to introduce small variations.
    displacement.context.globalCompositeOperation = 'lighten' // this is to accumulate color, a bit like the AdditiveBlending from Three.js. 
    displacement.context.globalAlpha = 1 // we want the latest glow to be completely visible, so we have to revert the globalAlpha to 1
    const glowSize = displacement.canvas.width * 0.25
    displacement.context.drawImage(
        displacement.glowImage,
        // since the glow image is drawn where the cursor is top, left, src/assets/lessom-39/cursor-and-image.png
        // not where the cursor is center src/assets/lessom-39/cursor-and-image-correct.png
        // so we need to adjust by subtracting glowSize * 0.5
        displacement.canvasCursor.x - glowSize * 0.5,
        displacement.canvasCursor.y - glowSize * 0.5,
        glowSize,
        glowSize
    )


    // Texture
    // we need to update the texture after updating the canvas.
    displacement.texture.needsUpdate = true

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()