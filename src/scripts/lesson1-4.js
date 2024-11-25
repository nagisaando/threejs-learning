import * as THREE from 'three'

const canvas = document.querySelector('canvas.webgl')

// Scene: Like a container in which we put objects, models, particles, lights, etc
const scene = new THREE.Scene()


const group = new THREE.Group()
scene.add(group)



const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xECA400, })
)

group.add(cube1)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xF4EDEA, })
)

cube2.position.x = -1

group.add(cube2)


const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x847979, })
)

group.add(cube3)

cube3.position.x = 1


group.position.y = -1
group.position.z = 0.2
group.scale.y = 0.5
group.rotation.y = 0.6


console.log(cube3.ge)




// Object (Mesh): primitive geometers, imported models, particles, lights etc. It can be transform using `position`, `rotation` and `scale`
// const geometry = new THREE.CircleGeometry()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
    color: '#129490',
    //  wireframe: true
})



// Mesh(Visible Object): A combination of a geometry(the shape) and a material(how it looks)
const greenBox = new THREE.Mesh(geometry, material)

// transforming property can be anywhere as long as it is before renderer.render(scene, camera) is called
greenBox.position.y = -1
greenBox.position.x = -1
// greenBox.position.z = -1

// change the scale (size)
// greenBox.scale.x = 3
// greenBox.scale.y = 0.2
// greenBox.scale.z = 3

// or 
greenBox.scale.set(2, 0.2, 1)



// greenBox.rotation.z = 0.4
// greenBox.rotation.y = 0.8
// greenBox.rotation.x = 1
// 

greenBox.rotation.reorder("YXZ") // needs to call this BEFORE rotation execution

// greenBox.rotation.y = Math.PI // half rotation
greenBox.rotation.y = Math.PI / 2 // quater rotation
greenBox.rotation.x = Math.PI / 2

scene.add(greenBox)




// length between the center of the scene and the object
console.log(greenBox.position.length())

// It normalizes the position vector, which means it changes the vector's length (magnitude) to 1, while keeping its direction the same.
// greenBox.position.normalize()
console.log(greenBox.position.length())
console.log(greenBox.position.x)

const sizes = {
    width: 800,
    height: 600
}

// this is helper and displays a colored line for each axes
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)
// Camera (technically object): Theoretical point of view used when rendering(we can have multiple but normally only one)
// first param [Field of View]: How large tier vision angle is, Expressed in degrees and corresponds to the vertical vision angle
// second param [Aspect of Ratio]: The width of the canvas divided by its height
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

// By default render put all objects to the centre including a camera
// and when camera is inside the another object, camera can not see the object. 
// so we have to move camera so it can see the object
// camera.position.x = 1; // Move the camera to the right
// camera.position.y = 1; // Move the camera up
camera.position.z = 3; // Keep it backward for depth
// or
// camera.position.set(-1, -1, 3)


// camera.lookAt(greenBox.position);
scene.add(camera)

// distance from object to camera
// console.log(greenBox.position.distanceTo(camera.position))

// The render will render the scene from the camera’s point of view. 
// The result will be drawn into canvas. (Renderer can create by itself or can be created manually)
const renderer = new THREE.WebGLRenderer({
    canvas
})

renderer.setSize(sizes.width, sizes.height)
// renderer.render(scene, camera)


// function animate() {
//     group.rotation.y += 0.001;

//     // Reset the rotation value to avoid infinite growth
//     group.rotation.y = group.rotation.y % (2 * Math.PI);

//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
// }

// animate();