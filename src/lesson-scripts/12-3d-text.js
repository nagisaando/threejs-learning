import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper)
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/2.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace
/**
 * Font
 */

const textParams = {
    text: 'Nagisa Ando',
    size: 1,
    depth: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
    font: '/fonts/helvetiker_regular.typeface.json',
    wireframe: false

}



let textMesh = null
// let textMaterial = new THREE.MeshNormalMaterial({});
let material = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture
})

const fontLoader = new FontLoader()

const createText = () => {
    if (textMesh) {
        scene.remove(textMesh)
        textMesh.geometry.dispose()
        textMesh.material.dispose()
    }

    fontLoader.load(textParams.font, (font) => {

        // * Creating a text geometry is long and hard for the computer
        // * Avoid doing it too many times and keep the geometry as low poly as possible by reducing `curveSegments` and`bevelSegments`
        const textGeometry = new TextGeometry(textParams.text, {
            font: font,
            size: textParams.size,
            depth: textParams.depth,
            curveSegments: textParams.curveSegments,
            bevelEnabled: textParams.bevelEnabled,
            bevelThickness: textParams.bevelThickness,
            bevelSize: textParams.bevelSize,
            bevelOffset: textParams.bevelOffset,
            bevelSegments: textParams.bevelSegments
        })

        // [making text geometry center]
        // textGeometry.computeBoundingBox() // Computes the bounding box of the geometry since three.js uses bounding sphere instead. It is not actual box, just mathematics

        // console.log(textGeometry.boundingBox)

        // textGeometry.translate(
        //     -(textGeometry.boundingBox.max.x - textParams.bevelSize) * 0.5, // moving half of geometry to left
        //     -(textGeometry.boundingBox.max.y - textParams.bevelSize) * 0.5, // moving half of geometry to bottom but since there is word "g" in text this is not technically correct. this is just to demonstrate
        //     -(textGeometry.boundingBox.max.z - textParams.bevelSize) * 0.5  // moving half of geometry to back

        // )

        // console.log(textGeometry.boundingBox)

        // or 

        textGeometry.center()
        textMesh = new THREE.Mesh(textGeometry, material)


        scene.add(textMesh)
    })
}

createText()
gui.add(textParams, 'wireframe')
    .name('Wireframe')
    .onChange((value) => {
        material.wireframe = value; // Update the material's wireframe property
        textMesh.material.wireframe = value
    });

gui
    .add(textParams, 'text')
    .onFinishChange(createText)

gui
    .add(textParams, 'font')
    .onFinishChange(createText)


gui
    .add(textParams, 'size')
    .min(0.01)
    .max(3)
    .step(0.001)
    .onFinishChange(createText)

gui.add(textParams, 'depth', 0.1, 1, 0.01).name('Depth').onFinishChange(createText);
gui.add(textParams, 'curveSegments', 2, 30, 1).name('Curve Segments').onFinishChange(createText);
gui.add(textParams, 'bevelEnabled').name('Bevel').onFinishChange(createText);
gui.add(textParams, 'bevelThickness', 0.01, 1, 0.01).name('Bevel Thickness').onFinishChange(createText);
gui.add(textParams, 'bevelSize', 0.01, 1, 0.01).name('Bevel Size').onFinishChange(createText);
gui.add(textParams, 'bevelOffset', 0.01, 1, 0.01).name('Bevel Thickness').onFinishChange(createText);
gui.add(textParams, 'bevelSegments', 2, 30, 1).name('Bevel Segments').onFinishChange(createText);

gui.add({ reset: () => gui.reset() }, 'reset')



const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)

console.time('donut') // by reusing geometry and material, we can improve performance a lot
Array.from({ length: 1000 }, (_) => {
    const donutMesh = new THREE.Mesh(donutGeometry, material)
    donutMesh.position.x = (Math.random() - 0.5) * 10
    donutMesh.position.y = (Math.random() - 0.5) * 10
    donutMesh.position.z = (Math.random() - 0.5) * 10

    const scale = Math.random()
    donutMesh.scale.set(scale, scale, scale)

    donutMesh.rotation.x = Math.random() * Math.PI
    donutMesh.rotation.y = Math.random() * Math.PI


    scene.add(donutMesh)
})

console.timeEnd('donut')


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