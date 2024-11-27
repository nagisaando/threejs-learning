import * as THREE from 'three'
import { gsap } from "gsap";
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xECA400 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)



// animating by number will cause problem since this function is called per frame and computer has a different FPS, 
// which will result different animation speed
// const tick = () => {
//     console.log("tick!")
//     mesh.position.x += 0.01
//     renderer.render(scene, camera)
//     requestAnimationFrame(tick) // requestAnimationFrame will call the tick function on next frame
// }


// [OPTION 1] animation by delta (the difference between current timestamp and previous timestamp)

// let time = Date.now() // millisecond, the timestamp is how much time has been spend since Jan 1st 1970
// const tick = () => {
//     console.log("tick!")
//     const currentTime = Date.now()
//     // Delta: the difference between current timestamp and previous timestamp 
//     const delta = currentTime - time
//     time = currentTime
//     mesh.rotation.y += delta * 0.001
//     renderer.render(scene, camera)
//     requestAnimationFrame(tick)
// }


// [OPTION 2] using Clock from Three.js

// let clock = new THREE.Clock()

// const tick = () => {
//     console.log("tick!")

//     // clock.getDelta() does not work well to use for animation
//     const elapsedTime = clock.getElapsedTime()

//     console.log(elapsedTime)
//     // mesh.rotation.y = elapsedTime
//     // mesh.rotation.y = elapsedTime * Math.PI * 2 // one rotation per 1 second 
//     mesh.position.y = Math.sin(elapsedTime)
//     mesh.position.x = Math.cos(elapsedTime)
//     camera.lookAt(mesh.position)

//     renderer.render(scene, camera)
//     requestAnimationFrame(tick)
// }


//[OPTION 3] use GSAP
// GSAP is calling own 'tick' by itself so no need to update here
// but we still need to call renderer.render(scene, camera) inside tick()
gsap.fromTo(mesh.position, { duration: 1, x: -2, }, { duration: 1, x: 2, yoyo: true, repeat: -1 })
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)


const tick = () => {
    console.log("tick!")

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
tick()
renderer.render(scene, camera)


