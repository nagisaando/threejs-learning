// Creating custom light 
// => to add simple light to custom shader (adding three.js light to custom shader makes it more complicated)
// => to add cool effect

// we are going to create the most common lights in three.js (not physically based and similar to phong shading https://en.wikipedia.org/wiki/Phong_shading but much simpler)
// - ambient
// - point 
// - directional

// we are going to use fragment shader not vertex shader which creates visual artifacts

// [Learning resource]
// OGLDEV(https://www.youtube.com/watch?v=e-lnyzN2wrM)
// https://www.youtube.com/watch?v=e-lnyzN2wrM&ab_channel=OGLDEV
// https://www.youtube.com/watch?v=dJo1Ao9XydM&t=740s&ab_channel=OGLDEV
// https://www.youtube.com/watch?v=ToCSRyXva5w&ab_channel=OGLDEV
// https://www.youtube.com/watch?v=MAJqiDll0a8&ab_channel=OGLDEV



import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import shadingVertexShader from '../shaders/lesson-35-lights/vertex.glsl'
import shadingFragmentShader from '../shaders/lesson-35-lights/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 7
camera.position.y = 7
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
// renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.toneMappingExposure = 3
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ffffff'

const material = new THREE.ShaderMaterial({
    vertexShader: shadingVertexShader,
    fragmentShader: shadingFragmentShader,
    uniforms:
    {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
    }
})

gui
    .addColor(materialParameters, 'color')
    .onChange(() => {
        material.uniforms.uColor.value.set(materialParameters.color)
    })

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
    '/models/Suzan/suzanne.glb',
    (gltf) => {
        suzanne = gltf.scene
        suzanne.traverse((child) => {
            if (child.isMesh)
                child.material = material
        })
        scene.add(suzanne)
    }
)


/* 
 * Light helpers
 */

const directionalLightHelper = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial())

directionalLightHelper.material.side = THREE.DoubleSide
directionalLightHelper.material.color.setRGB(0.1, 0.1, 1.0)
directionalLightHelper.position.set(0, 0, 3.0)
scene.add(directionalLightHelper)


const redPointLightHelper = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial())
redPointLightHelper.material.color.setRGB(1.0, 0.1, 0.1)
redPointLightHelper.position.set(0, 2.5, 0)
scene.add(redPointLightHelper)

const yellowPointLightHelper = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial())
yellowPointLightHelper.material.color.setRGB(1.0, 1.1, 0.1)
yellowPointLightHelper.position.set(2.5, 1.5, 0.0)
scene.add(yellowPointLightHelper)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Rotate objects
    if (suzanne) {
        suzanne.rotation.x = - elapsedTime * 0.1
        suzanne.rotation.y = elapsedTime * 0.2
    }

    sphere.rotation.x = - elapsedTime * 0.1
    sphere.rotation.y = elapsedTime * 0.2

    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()