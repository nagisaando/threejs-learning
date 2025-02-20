import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#FFEAAE' })
)
object1.position.x = - 2.1

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#FFEAAE' })
)

object2.position.x = -0.7


const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#FFEAAE' })
)
object3.position.x = 0.7

const object4 = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2),
    new THREE.MeshBasicMaterial({ color: '#FFEAAE' })
)

object4.position.x = 2.1

scene.add(object1, object2, object3, object4)

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
 * Model
 */
let model
const loader = new GLTFLoader()
loader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
    model = gltf.scene
    model.position.y = -2
    scene.add(model)
})


/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster()


// ===========================================
// // [How to use raycaster (basic)]
// const rayOrigin = new THREE.Vector3(-3, 0, 0)


// // // Normalize the direction vector to ensure it has a length of 1
// // // This is required because Raycaster expects a unit vector for direction
// // // If not normalized, the ray's distance calculations may be incorrect
// const rayDirection = new THREE.Vector3(10, 0, 0)
// // console.log(rayDirection.length()) // shows 10
// rayDirection.normalize()
// // console.log(rayDirection.length()) // shows 1
// raycaster.set(rayOrigin, rayDirection)

// // // if we want to visualize raycaster
// scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 100, '#faebd7'))


// // [cast a ray]

// // Three.js updates the object's coordinates (called matrices) right before rendering them. 
// // Since the ray casting is called immediately (for this specific case), none of the objects have been rendered
// // and show the wrong information (such as distance from intersects array's item). 
// // We can fix that by updating the matrices manually before ray casting:
// object1.updateMatrixWorld()
// object2.updateMatrixWorld()
// object3.updateMatrixWorld()
// object4.updateMatrixWorld()

// // - to test a one object
// const intersect = raycaster.intersectObject(object4)
// // it returns array even if only one object is tested because aa ray can go through the same object multiple times 
// // such as torus geometry
// // const intersect = raycaster.intersectObject(object4)
// console.log(intersect)

// // - to test an array of object
// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersects)


// // This is the info from each item of array 
// // - distance: the distance between the origin of the ray and the collision point.
// // - face: what face of the geometry was hit by the ray.
// // - faceIndex: the index of that face.
// // - object: what object is concerned by the collision.
// // - point: a Vector3 of the exact position in 3D space of the collision.
// // - uv: the UV coordinates in that geometry.
// ===========================================


/**
 * Light
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 2, 2)
scene.add(directionalLight)
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



/**
 * Mouse Event 
 */
let hoveredObject
const pointer = new THREE.Vector2()


// we are interacting objects with raycaster but when the page is loaded, 
// by default the mouse position is set to the center of the page
// if we don't want the behaviour, we need to manually set the initial mouse position 
window.addEventListener('mousemove', (e) => {

    // Convert from pixel to three.js normalized coordinates (-1 to +1)

    // 1. e.clientX / sizes.width => returns from 0 to 1
    // 2. (e.clientX / sizes.width) * 2 => returns 0 to 2
    pointer.x = (e.clientX / sizes.width) * 2 - 1
    pointer.y = -(e.clientY / sizes.height) * 2 + 1

    // we can call raycaster here and interacted with intersected objects but 
    // since some browser fires mousemove more than the frame rate so it's better to do it on tick
})

window.addEventListener('click', (e) => {
    if (hoveredObject) {
        hoveredObject.object.material.color.set('#000')

        switch (hoveredObject.object) {
            case object1:
                console.log('click on object1')
                break
            case object2:
                console.log('click on object2')
                break
            case object3:
                console.log('click on object3')
                break
            case object4:
                console.log('click on object4')
                break
        }
    }
})


const tick = () => {
    const elapsedTime = clock.getElapsedTime()



    object1.position.y = Math.sin(elapsedTime * 0.8) * 1.2
    object2.position.y = Math.sin(elapsedTime * 0.6) * 2
    object3.position.y = Math.sin(elapsedTime * 0.3)
    object4.position.y = Math.sin(elapsedTime * 0.5) * 3

    const objectsToBeTested = [object1, object2, object3, object4]
    // ===========================================
    // [Test moving object using raycaster]
    // const intersects = raycaster.intersectObjects(objectsToBeTested)

    // for (const item of objectsToBeTested) {
    //     item.material.color.set('#FFEAAE')
    // }

    // for (const item of intersects) {
    //     item.object.material.color.set('#FFC100')
    // }
    // ===========================================

    // ===========================================
    // [Changing raycaster position according to the mouse position and camera]
    // Also we can mimic mouseenter and mouseleave events by using hoveredObject
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(objectsToBeTested)

    // [mouseenter]
    // if an object intersects, but there wasn't one before, a "mouseenter" happened
    if (intersects.length && !hoveredObject) {
        hoveredObject = intersects[0]
        hoveredObject.object.material.color.set('#3B341F')
        // [mouseleave]
        // if no object intersects, but there was one before, a "mouseleave" happened
    } else if (intersects.length === 0 && hoveredObject) {
        hoveredObject.object.material.color.set('#FFEAAE')
        hoveredObject = null
    }

    // ===========================================
    // [Raycaster with model]
    // 
    if (model) {
        // - raycaster with recursive
        // we are calling intersectObject on model, which is a Group, not a Mesh (intersectObject expect Mesh only)
        // by default, raycaster will check the children of the object recursively
        // we can deactivate it if needed

        // - modelIntersect can return several items sometimes 
        // since raycaster is testing children, if some children intersect with the ray, 
        // it can return multiple objects, also if one Mesh can intersect multiple times with a ray as well

        const modelIntersect = raycaster.intersectObject(model)
        if (modelIntersect.length) {
            model.scale.set(1.4, 1.4, 1.4)
        } else {
            model.scale.set(1, 1, 1)
        }
    }



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()