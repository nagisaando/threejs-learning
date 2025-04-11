// in previous lessons such as raging sea, shader patterns, we have been using Perlin functions to create various effects but it's bad for performance
// we are going to use texture image instead (common in video games's cloud, smoke, fire etc to main solid performance)
// also perlin noise can be made here
// http://kitfox.com/projects/perlinNoiseMaker/
// https://opengameart.org/content/noise-texture-pack
// https://mebiusbox.github.io/contents/EffectTextureMaker/
// https://threejs-journey.com/lessons/coffee-smoke-shader#:~:text=EffectTextureMaker-,Noise%20Texture,-(Figma%20plugin)
// blender also can generate

// while choosing a noise texture, keep in mind 3 rules
// - enough variations
// - big enough (128 x 128 is more than enough)
// - repeating pattern (or tilling)

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from '../shaders/lesson-32-coffee-smoke/vertex.glsl'
import fragmentShader from '../shaders/lesson-32-coffee-smoke/fragment.glsl'
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
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 8
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
gltfLoader.load(
    '/models/Coffee/bakedModel.glb',
    (gltf) => {
        gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(gltf.scene)
    }
)

// Perlin texture
const perlinTexture = textureLoader.load('/textures/perlin.png')
// since we will make the smoke animation, we have to make the texture repeated
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping
/**
 * Smoke
 */

const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
// translate and scale on geometry so the origin of the mesh (0, 0) is in the bottom center of the object
// the smoke is coming from the bottom, it is easier to think it than having the origin in the center of the object
// note: don't do this on tick function which cause to update each vertex of the whole geometry
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(1.5, 6, 1.5)

const smokeMaterial = new THREE.ShaderMaterial({
    // color: 'cyan', // color is not supported in shader material
    // wireframe: true,
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture) // : same as uPerlinTexture: { value: perlinTexture }

    },
    side: THREE.DoubleSide,
    transparent: true

})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.83
scene.add(smoke)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    smokeMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()