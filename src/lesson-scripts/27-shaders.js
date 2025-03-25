import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from '../shaders/shader-material-test/vertex.glsl'
import fragmentShader from '../shaders/shader-material-test/fragment.glsl'

// [What is a shader?]
// - One of the main components of WebGL
// - Must learn at first if doing native WebGL 
// - Program written in GLSL and will be sent to GPU and do: 
//      - Position each vertex of a geometry
//      - Colorize each visible pixel (fragment) of that geometry
// * "Pixel" isn't accurate because each point in the render does not necessarily match each pixel of the screen. 
// * "Pixel" for render is called "Fragments"
//
// We send a lot of data to the shader: 
// - vertical coordinates
// - Mesh transformation
// - Information about the camera
// - Colors 
// - Texture
// - Lights
// - Fog
// - etc
// GPU processes all of this data following the shader instructions and display something (object) on the screen

// two types of shader
// 1. vertex shader 
//      - Will position each vertex of the geometry
// 
//      - We create the vertex shader
//      - We send the shader to the GPU with data like vertices coordinates, the mesh transformations, camera information etc
//      - The GPU follows the instructions and positions the vertices on the render
//      
//      The same vertex shader will be used for every vertices
//      "attributes": Some data like the vertex position will be different for each vertex.
//                    Those type of data are called "attributes" (e.g. particles with different color)
//       "uniforms":  Some data, like the transformation of the mesh (position, rotation, scale), 
//                    is the same for every vertex. These types of data are called "uniforms."
//                    For example, the modelMatrix is a uniform that applies the mesh's transformation
//                    to all vertices in the same way.
//                    https://www.youtube.com/watch?v=8fy8uRv9PdM
//      Once the vertices are placed by the vertex shader, the GPU knows what pixels of the geometry are visible and can proceed to the fragment shader 

// 2. fragment shader
//      - Color each visible pixel of the geometry
// 
//      - The same fragment shader will be used for every visible fragment of the geometry:
//          - We create the fragment shader
//          - We send the shader to the GPU with data like color
//          - The GPU follows the instructions and color the fragments
//
//      - We can send "uniforms" (same value) to the fragment
//      "varyings": We can send a value from the vertex shader to the fragment shader
//                  Those are called "varyings" and the value get interpolated between the vertex

// Writing our own shader is good because:
// - Three.js materials are limited 
// - Our shaders can be very simple ad performant
// - We can add custom post-processing


// [GLSL] - OpenGL Shading Language, Close to the C language
// Shaderific documentation - https://shaderific.com/glsl.html
// Kronos Group OpenGL reference pages - https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/indexflat.php
// Book of shaders documentation - https://thebookofshaders.com/

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/flag.png')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)


const count = geometry.attributes.position.count
const randoms = new Float32Array(count)
for (let i = 0; i < count; i++) {
    randoms[i] = Math.random()
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))


// Material

// [THREE.RawShaderMaterial]

// const material = new THREE.RawShaderMaterial({
//     vertexShader,
//     fragmentShader,
//     uniforms: {
//         uTime: {
//             value: 0
//         },
//         uFrequency: {
//             value: new THREE.Vector2(10, 5)
//         },
//         uColor: {
//             value: new THREE.Color('#129490')
//         },
//         uTexture: {
//             value: flagTexture
//         }
//     }
//     // wireframe: true // <------ common properties like wireframe, side, transparent, flatShading works but something like 
//     // // but properties like map, alphaMap, opacity, color etc don't work and we have to write these features inside the shader
// })

// [THREE.ShaderMaterial]
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: {
            value: 0
        },
        uFrequency: {
            value: new THREE.Vector2(10, 5)
        },
        uColor: {
            value: new THREE.Color('#129490')
        },
        uTexture: {
            value: flagTexture
        }
    }
    // wireframe: true // <------ common properties like wireframe, side, transparent, flatShading works but something like 
    // // but properties like map, alphaMap, opacity, color etc don't work and we have to write these features inside the shader
})

gui.add(material.uniforms.uFrequency.value, 'x', 0, 100, 1)
gui.add(material.uniforms.uFrequency.value, 'y', 0, 100, 1)
// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2 / 3
scene.add(mesh)

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
camera.position.set(0.25, - 0.25, 1)
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

    material.uniforms.uTime.value = elapsedTime // DO NOT USE Date.now() cuz the number is too big for shader
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()