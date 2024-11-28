import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'; // GUI => graphic user interface :)

// gui works only for property of object
const gui = new GUI({
    width: 300,
    title: "Lesson 9: debug ui",
    // closeFolders: false

})

// gui.close()
// gui.hide()

window.addEventListener('keydown', e => {
    if (e.key === 'h') {
        gui.show(gui._hidden)
    }
})

const debugProps = {}
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

debugProps.color = '#F07167'
/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: debugProps.color, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


// can create nested folder too!
const cubeTweak = gui.addFolder('cube')
cubeTweak
    .add(mesh.position, 'y')
    .min(-1)
    .max(1)
    .step(0.01)
    .name("elevation")

cubeTweak.
    add(mesh, "visible")

cubeTweak.
    add(material, "wireframe")


// [Changing color]
// <Note> .addColor():
// we have to use .addColor() because 
// this changing color will cause issue because Three.js's color property is an instance of the Three.js Color class.
// because of that .add() does not work which tweaks boolean, string, number etc

// <Issue> the color code that three.js outputs and reads are different!:
// If we try to take this color value from the tweak we end up with the wrong color
// because three.js applies some color management in order to optimize the rendering.
// the color value that is being displayed in the tweak is not the same value as the one being used internally
// cubeTweak
//     .addColor(material, 'color') // if we copy the outputted color from the debug ui and paste it to `new THREE.MeshBasicMaterial({ color: '...' })` would result in the different color
//     .onChange((value) => {
//         // with this, we can get the "modified color": what three.js uses internally and
//         // by assigning this to the color property we can render the color that we are looking on tweak ui but 
//         // it is not efficient since we can not do this in code but need to copy and paste from dev tool
//         console.log(value.getHexString()) 

//     })

// instead we have to tweak "non-modified color" using debugProps
cubeTweak
    .addColor(debugProps, "color") // this updates debugProps.color
    .onChange(() => {
        material.color.set(debugProps.color) // and set to the color prop of material
        // and this code will update the material with new color. 
        // const material = new THREE.MeshBasicMaterial({ color: debugProps.color })
        // and we are never assigning the color that is rendered by three.js

    })

// [changing segment]
// segments parameters can not change as 
// gui.add(geometry, "widthSegments")
// because it will be used to generate the whole geometry only once
// we can not change the parameter and expect three.js to re-create automatically

// instead, we have to do it manually:
debugProps.subdivision = 2

cubeTweak
    .add(debugProps, 'subdivision')
    .min(1)
    .max(20)
    .step(1) // for subdivision, we can have only integer
    // recreating geometry can be a rather lengthy process for the CPU
    // so instead of onChange which can be triggered a lot, we use .onFinishChange
    .onFinishChange((value) => {
        // we have to destroy geometry before creating new one, 
        // otherwise the old geometries are still available in GPU memory which can cause memory leaks
        mesh.geometry.dispose()
        mesh.geometry = new THREE.BoxGeometry(1, 1, 1, value, value, value)
    })

// debug button
debugProps.rotate = () => {
    gsap.to(mesh.rotation, { y: mesh.rotation.y + Math.PI / 2 }) // rotates 1/4 of full circle
}

cubeTweak
    .add(debugProps, "rotate")

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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