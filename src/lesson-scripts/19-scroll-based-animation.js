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





const objectDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 26, 69),
    material

)
mesh1.position.x = 2
mesh1.position.y = - objectDistance * 0


const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

mesh2.position.x = -2
mesh2.position.y = - objectDistance * 1


const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 199, 16),
    material
)

mesh3.position.x = 2
mesh3.position.y = - objectDistance * 2

scene.add(mesh1, mesh2, mesh3)
const sectionMeshes = [mesh1, mesh2, mesh3]


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



/**
 * Particles
 */

// particles help to make the experience more immersive and to help the user feel the depth
const count = 200
const positions = new Float32Array(count * 3)


for (let i = 0; i < count; i++) {
    const vertex = 3

    const x = 0
    const y = 1
    const z = 2

    positions[vertex * i + x] = (Math.random() - 0.5) * 10

    // objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
    // objectDistance * 0.5 = 2 => will cover the half top of the first section
    // Math.random() * objectDistance * sectionMeshes.length => will create a random negative number (0 to -12) which will add the particle to the bottom part of the page 
    positions[vertex * i + y] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
    positions[vertex * i + z] = (Math.random() - 0.5) * 10
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

const particleMaterial = new THREE.PointsMaterial({
    sizeAttenuation: true,
    size: 0.03,
    color: parameters.materialColor
})
const particle = new THREE.Points(
    particleGeometry,
    particleMaterial

)

scene.add(particle)



gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
        particleMaterial.color.set(parameters.materialColor)
    })

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
let currentSection = 0
let newSection
window.addEventListener('scroll', (e) => {
    scrollY = window.scrollY

    // sizes.height is equivalent to one section, we can get the current section by scrollY / sizes.height
    // if it is 0 => viewpoint is displaying first section
    currentSection = Math.round(scrollY / sizes.height)

})

let mouseMoves = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {

    // currently the value of the cursor position (amplitude) depends on te size of the viewpoint 
    // and users with different screen resolutions will have the different results

    // Normalize the value (from 0 to 1) by dividing them by the size of the viewpoint (e.clientX / sizes.width)

    // since this value will be used to change the position of three.js camera,
    // we will need negative value if we want to move the camera to left (x coordination) or bottom (y coordination)
    // we will minus 0.5 to have a value from -0.5 to 0.5 so we can have the translation smoothly
    mouseMoves.x = e.clientX / sizes.width - 0.5
    mouseMoves.y = e.clientY / sizes.height - 0.5
})
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    // [animate camera]
    // we can not pass scrollY directly to camera's position because
    // for the camera, we just want to move 8 units to move the camera to the bottom of the page,
    // so we need to convert the number to fit three.js unit

    // -scrollY / sizes.height will show how far the page is scrolled against the view point,
    // if we scroll for full viewport height, it will show 1
    // also we have to add - to scrollY because in three.js, the negative value of y coordination moves the objects down.

    // and we have to multiply it to the objectDistance.
    // objectDistance is the height of viewport for three.js (which is 4 units in three.js)
    // if we multiply objectDistance * 0.8, the camera will be positioned where first section is visible
    // if we multiply objectDistance * 2, the camera will positioned where third section is visible


    camera.position.y = objectDistance * (-scrollY / sizes.height)


    // [animate meshes]
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }


    if (currentSection !== newSection) {
        newSection = currentSection
        gsap.to(sectionMeshes[newSection].rotation, { x: `+=8`, y: `+=5`, duration: 1.5, ease: 'power2.inOut' })
    }
    // [parallax object]
    // parallax is the action of seeing one object through different observation points.
    // This is done naturally by our eyes and it's how we feel the depth of things
    // cameraGroup.position.x = mouseMoves.x
    // cameraGroup.position.y = -mouseMoves.y

    // with above solution, the parallax animation feels too mechanic. Hence, we will add "easing" (aka smoothing or learping)
    // on each frame, instead of moving the camera straight to the target, we are going to move it a 1/10 closer to the destination
    // then, on the next frame, another 10th (1/10) closer, then next frame, another 10th closer and repeating...

    // cameraGroup.position.x += (mouseMoves.x - cameraGroup.position.x) * 0.1  // (or (mouseMoves.x - cameraGroup.position.x) / 10)
    // cameraGroup.position.y += (-mouseMoves.y - cameraGroup.position.y) * 0.1

    // The problem of the above solution is, if you test the experience on a high frequency screen, the tick function will be called more often and the camera will move faster towards the target.
    // it is not a big issue but it's not accurate and it's preferable to have the same result across device as much as possible
    // we can adjust the speed by multiplying deltaTime, if the computer has high frequency, deltaTime will return smaller value, and if it is lower frequency, it will return bigger value

    // cameraGroup.position.x += (mouseMoves.x - cameraGroup.position.x) * 0.1 * deltaTime
    // cameraGroup.position.y += (-mouseMoves.y - cameraGroup.position.y) * 0.1 * deltaTime


    // since deltaTime is in seconds, the value will be very small (around 0.016 for most common screens running at 60fps)
    // we can change 0.1 to something bigger number like 5
    // cameraGroup.position.x += (mouseMoves.x - cameraGroup.position.x) * 5 * deltaTime
    // cameraGroup.position.y += (-mouseMoves.y - cameraGroup.position.y) * 5 * deltaTime


    //  also we can lower the amplitude of the effect for the better user experience by multiplying cursor position by 0.5
    cameraGroup.position.x += (mouseMoves.x * 0.5 - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (-mouseMoves.y * 0.5 - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()