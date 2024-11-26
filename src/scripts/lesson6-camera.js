import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5 // this will go from -0.5 to 0.5 if the cursor is within the canvas
    cursor.y = -(e.clientY / sizes.height - 0.5)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Scene
const scene = new THREE.Scene()

// Object
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ wireframe: true, color: '#129490' })
)
scene.add(mesh)

const mesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: '0xECA400' })
)

// mesh1.position.x = 4
// mesh1.position.y = 1
// mesh1.position.z = 0.5 // even if I change the z axes, with new THREE.OrthographicCamera, the size will be same as the other object
// scene.add(mesh1)

// const mesh3 = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
//     new THREE.MeshBasicMaterial({ color: '#129490' })
// )

// mesh3.position.x = -2

// scene.add(mesh3)


// Camera

// 1st parameter [field of view]: vertical vision angle. 45-75 is common. 
//                                if the number is real big, it can cause disorientation on objects (object stretch out) 
// 2st parameter [aspect]
// 3rd parameter [near]         : object closer than "near" or further than "far" won't show up (object does not render)
// 4th parameter [far]          : do not use extreme number for these which can cause z-fighting. GPU will have a problem to determine which project should come front etc
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)


const aspectRatio = sizes.height / sizes.width


// Orthographic camera: renders the scene without perspective (It is to represent three-dimensional objects in two dimensions ). Even if the element is far, the size won’t change
// If the aspect ratio is wider(e.g., 16: 9), the left [1st param] and right [2st param] boundaries need to extend outward to maintain the proportions.
// If the aspect ratio is taller(e.g., 4: 3), the top [3rd param] and bottom [4th param] boundaries might need adjustment instead. (but horizontal scaling using left and right are more common)
// const camera = new THREE.OrthographicCamera(-1, 1, -1 * aspectRatio, 1 * aspectRatio, 0.1, 100)


// camera.position.x = 4
// camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

console.log(camera.position.length())

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate manually 
// const clock = new THREE.Clock()

// const tick = () => {
//     // const elapsedTime = clock.getElapsedTime()

//     // creates full circle effects by moving mouse from left to right
//     camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
//     camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
//     camera.position.y = cursor.y * 10
//     camera.lookAt(mesh.position)
//     // Update objects
//     // mesh.rotation.y = elapsedTime;

//     // Render
//     renderer.render(scene, camera)

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }


// Animate using three.js 

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
const tick = () => {
    controls.update()
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()