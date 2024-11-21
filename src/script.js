import * as THREE from 'three'

const canvas = document.querySelector('canvas.webgl')

// Scene: Like a container in which we put objects, models, particles, lights, etc
const scene = new THREE.Scene()

// Object (Mesh): primitive geometers, imported models, particles, lights etc. It can be transform using `position`, `rotation` and `scale`
// const geometry = new THREE.CircleGeometry()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: '#129490' })



// Mesh(Visible Object): A combination of a geometry(the shape) and a material(how it looks)
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)


const sizes = {
    width: 800,
    height: 600
}

// Camera (technically object): Theoretical point of view used when rendering(we can have multiple but normally only one)
// first param [Field of View]: How large tier vision angle is, Expressed in degrees and corresponds to the vertical vision angle
// second param [Aspect of Ratio]: The width of the canvas divided by its height
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

// By default render put all objects to the centre including a camera
// and when camera is inside the another object, camera can not see the object. 
// so we have to move camera so it can see the object
camera.position.x = -1; // Move the camera to the right
camera.position.y = -1; // Move the camera up
camera.position.z = 3; // Keep it backward for depth
camera.lookAt(mesh.position);
scene.add(camera)

// The render will render the scene from the camera’s point of view. 
// The result will be drawn into canvas. (Renderer can create by itself or can be created manually)
const renderer = new THREE.WebGLRenderer({
    canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)