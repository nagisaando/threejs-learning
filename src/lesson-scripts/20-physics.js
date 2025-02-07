import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */


// World
// (To update the World, we must use the step(...): https://gafferongames.com/post/fix_your_timestep/)
const world = new CANNON.World()
console.log(world)
world.gravity.set(0, -9.82, 0) // Cannon uses vec3 which is similar to Three.js Vector 3


// Material
// We can change the friction and bouncing behaviour by setting a material
// A Material is just a reference and we should create one for each type of material in the scene (plastic, concrete, jelly etc)

// ============================ option 1: with 2 different materials =========================================
// const concreteMaterial = new CANNON.Material('concrete')
// concreteMaterial.friction = 0.01
// const plasticMaterial = new CANNON.Material('plastic')

//  We can create a ContactMaterial which is the combination of two materials and how they should colide. 
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//     concreteMaterial,
//     plasticMaterial,
//     {
//         friction: 0.1,
//         restitution: 0.7 // this is needed to element to bounce
//     }
// )
// world.addContactMaterial(concretePlasticContactMaterial)
// ===============================o=============================================================================
// ===============================option 2: with default material======================================

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// we have to create a Body, which is an object that will fall and collide with other body (similar to mesh)
// To create a Body, we need a shape (similar to geometry)

// Sphere
const sphereShape = new CANNON.Sphere(0.5) // we are using the same radius as three.js sphere
const sphereBody = new CANNON.Body({
    mass: 1, // if there are two bodies collide, and the body has higher mass will push the other. 
    position: new CANNON.Vec3(0, 3, 0), // this will position to the center top (since y: 3), which we can imitate the ball falling movement 
    shape: sphereShape,
    // material: plasticMaterial
})

world.addBody(sphereBody)

// Plane 

const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body()

planeBody.mass = 0 // 0 means the body is static and won't move (default is 0 so we can omit. )
planeBody.addShape(planeShape)
// addShape accept many shapes to one body, it allows to create some complex body such as mug which consists of two parts (cup part and hand part) 
// planeBody.addShape(planeShape)
// planeBody.addShape(planeShape)
// planeBody.addShape(planeShape)

// planeBody.material = concreteMaterial

planeBody.quaternion.setFromEuler(-Math.PI * 0.5, 0, 0)
// or planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5) // this means, we are rotating on - Math.PI * 0.5 to x coordination 
world.addBody(planeBody)

/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const axisHelper = new THREE.AxesHelper(10)

scene.add(axisHelper)
/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0
var cannonDebugger = CannonDebugger(scene, world);
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    // Update Physics 
    // To update the World, we must use the step(...):
    // this is necessary to make sure that the physics world runs consistently even if the frame rate varies.

    // 1st param [dt]                 : a fixed time step (for animating object, we used deltaTime but for physics, we need a fixed timestamp)
    //                                  This makes the physics behave consistently across different frame rates.
    //                                  Without this, object might move faster or slower on different computers and when computer slows down

    // 2nd       [timeSinceLastCalled]: How much time passed since the last step(deltaTime)
    //                                  This counts for real-time variation in frame-time.
    //                                  If the frame rate drops (e.g., due to slow computer), this helps physics keep up.

    // 3rd       [maxSubSteps]        : How much iterations the world can apply to catch up with potential delay
    //                                  If deltaTime is large (due to lag), this lets Cannon.js run extra updates to catch up.
    //                                  If frames takes too long (e.g., 30ms), Cannon.js will apply multiple small steps to avoid jumpy sloppy broken physics
    //                                  If we set this too hight, it slows performance, if it's too slow, physics becomes inaccurate 
    // detail: https://gafferongames.com/post/fix_your_timestep/


    //  Example: How It Works in Different Situations
    // 
    //  (A) Running at 60 FPS(Ideal):
    //  Each frame takes ~16ms.
    //  deltaTime is ~0.016.å
    //  world.step(1 / 60, 0.016, 3) → Runs 1 update per frame(everything is smooth).
    //  
    // (B) Running at 30 FPS(Lagging):
    //  Each frame takes ~33ms.
    //  deltaTime is ~0.033.
    //  world.step(1 / 60, 0.033, 3) → Runs 2 updates per frame to catch up(0.033 / 0.016 ≈ 2).
    //  
    // (C) Running at 15 FPS(Very Laggy):
    //  Each frame takes ~66ms.
    //  deltaTime is ~0.066.
    //  world.step(1 / 60, 0.066, 3) → Runs 3 updates per frame(0.066 / 0.016 ≈ 4, but limited to maxSubSteps = 3).
    //  Some physics accuracy is lost, but it's better than objects "jumping."

    sphere.position.copy(sphereBody.position) // updates the three.js sphere position (Vector 3) by copying the position from Cannon (Vec 3) (They are compatible)
    world.step(1 / 60, deltaTime, 3)
    // Update controls
    controls.update()

    // update cannon debug
    cannonDebugger.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()