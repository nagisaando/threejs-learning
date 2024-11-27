import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



const helper = new THREE.AxesHelper(2)

scene.add(helper)
// Object


// [BoxGeometry’s parameter]
// - Width: the size on the x axis 
// - Height: the size on the y axis
// - Depth: the size on the z axis
// - WidthSegments: How many subdivisions in the x axis 
// - HeightSegments: How many subdivisions in the y axis
// - DepthSegments: How many subdivisions In the z axis 

// const geometry = new THREE.BoxGeometry(2, 3, 1, 2, 2, 2)




// ===============[How to make custom geometry]=============

// 1. Float32Array(or other typed arrays) is used to define the raw buffer data. (This is where you store your geometry data(e.g., positions, normals, UVs, etc.).)
// 2. You convert this buffer data into buffer attributes using THREE.BufferAttribute().
// 3. Finally, you attach these buffer attributes to a THREE.BufferGeometry object to define your custom geometry.

// const positionsArray = new Float32Array(9)
// positionsArray[0] = 1

// or 

// Step 1: Define buffer data
// WebGL (and thus Three.js) only supports Float32Array for buffer attributes.

// const positionsArray = new Float32Array([
//     0, 0, 0, // Vertex 1 (x, y, z)
//     0, 1, 0, // Vertex 2 (x, y, z)
//     1, 0, 0  // Vertex 3 (x, y, z)

// ])
// // Step 2: Convert it to a three.js buffer attribute using BufferAttribute 
// const positionAttribute = new THREE.BufferAttribute(positionsArray, 3) // The 3 indicates that each vertex uses 3 consecutive values from the positionsArray, if array is about UVs, it will be 2 for example

// // Step 3: Create a BufferGeometry and attach the attribute
// const geometry = new THREE.BufferGeometry()
// geometry.setAttribute("position", positionAttribute) // this name [position] is used in the shaders. and "position" is something recognized by the shaders and be able to create triangle
// =======================================================================
//  ===============[creating multiple triangles]=============
const count = 400
const componentsPerVertex = 3 // x, y, z for each vertex
const verticesPerFace = 3 // A face (triangle) requires 3 vertices

const positionArray = new Float32Array(count * componentsPerVertex * verticesPerFace)

for (let i = 0; i < count * componentsPerVertex * verticesPerFace; i++) {
    positionArray[i] = Math.random() - 0.5 // this will render -0.5 to 0.5
}



const positionAttribute = new THREE.BufferAttribute(positionArray, 3)

const geometry = new THREE.BufferGeometry()
geometry.setAttribute("position", positionAttribute)
// =======================================================================

// ===============[setting index to improve performance]=============

// Step 1: Define the vertices
// const vertices = new Float32Array([
//     0, 0, 0,   // Vertex 0 (x, y, z)
//     1, 0, 0,   // Vertex 1 (x, y, z)
//     1, 1, 0,   // Vertex 2 (x, y, z)
//     0, 1, 0    // Vertex 3 (x, y, z)
// ]);

// without indices, we have to define like this: 

// [0, 0, 0,   // Vertex 0
// 1, 0, 0,   // Vertex 1
// 1, 1, 0,   // Vertex 2 (Triangle 1)
// 1, 1, 0,   // Vertex 2 again (Triangle 2)
// 0, 1, 0,   // Vertex 3
// 0, 0, 0]   // Vertex 0 again

// Step 2: Define the indices
// Indices(Uint16Array):

// Defines how the vertices are connected to form two triangles.
// Each number refers to the index of a vertex in the vertices array.

// We can not use Float32Array for indices since it must be integers
// const indices = new Uint16Array([
//     0, 1, 2, // triangle 1 (Vertex 0, Vertex 1, Vertex 2)
//     2, 3, 0 // triangle 1 (Vertex 2, Vertex 3, Vertex 0)
// ])
// // Step 3: Create the BufferGeometry
// const geometry = new THREE.BufferGeometry();

// // Add vertices to the geometry
// geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

// // Add indices to the geometry
// geometry.setIndex(new THREE.BufferAttribute(indices, 1))

// =======================================================================
const material = new THREE.MeshBasicMaterial({
    color: 0x129490,
    // To see the subdivision wireframe is useful but it will cause stair effect and the line width won’t be ticker (1)
    wireframe: true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
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