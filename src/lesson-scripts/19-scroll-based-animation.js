import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Texture
 */

const textureLoader = new THREE.TextureLoader()

const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

// gradient texture is consist of 1 x 3 pixels. 
// instead of choosing one of those 3 pixels according to the light, WebGL will try to merge the color and apply to the material
// resulting the smooth gradient color being applied instead of three different color being applied accordingly

// if we want to disable the feature, we have to change how the texture being rendered
//  minFilter => when a texel covers less than one screen pixel
//               when you zoom out on a texture 
gradientTexture.minFilter = THREE.NearestFilter // webGL takes the nearest color based on the light intensity

// magFilter => when a texel covers more than one screen pixel
//              it controls when you zoom in on a texture
gradientTexture.magFilter = THREE.NearestFilter



/**
 * Objects
 */

const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})



gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 26, 69),
    material

)
mesh1.position.x = 2

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

mesh2.position.x = -2
mesh2.position.y = -4


const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 199, 16),
    material
)

mesh3.position.x = 2
mesh3.position.y = -8

scene.add(mesh1, mesh2, mesh3)
const materials = [mesh1, mesh2, mesh3]


/**
 * Light
 */

//  we will need the lights that adds shadow to use MeshToonMaterial
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.x = 2
directionalLight.position.y = 2


scene.add(directionalLight)

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6

// since we want to change the position in 2 situations: 
// 1. when the user scrolls the page
// 2. when the user moves the cursor to give parallax experience to the user
// we will group the camera so we can change the position of the camera when the user scrolls, and of the camera group when the user moves the cursor
const cameraGroup = new THREE.Group()
cameraGroup.add(camera)

scene.add(cameraGroup)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true // making a background (the clear color) to transparent
})

// renderer.setClearColor('pink', 0.3) (we can tweak clear color and transparency as well)

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Event
 */
let scrollY = 0
let canvasUnit = 4
let section = 0
let newSection
window.addEventListener('scroll', (e) => {
    scrollY = window.scrollY
    camera.position.y = canvasUnit * (-scrollY / sizes.height) // -scrollY / sizes.height will show how far the page is scrolled for the view point

    section = Math.round(scrollY / sizes.height)

})

let mouseMoves = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    mouseMoves.x = e.clientX
    mouseMoves.y = e.clientY
})
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()


    if (section !== newSection) {
        newSection = section
        gsap.to(materials[newSection].rotation, { x: `+=${Math.random() * 8}`, y: `+=${Math.random() * 5}` })
    }
    //  parallax object
    cameraGroup.position.x = mouseMoves.x / sizes.width - 0.5
    cameraGroup.position.y = -mouseMoves.y / sizes.height + 0.5


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()