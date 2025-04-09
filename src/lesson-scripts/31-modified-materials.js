// When we use a ShaderMaterial, we have to re-do everything (such as pointsMaterial in lesson 30)
// We can modify the existing material by: 
// 1. With a Three.js jook that let us play with the shaders and inject our code
// 2. By recreating the materia, but following what is done in Three.js code (more complex)


import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'lil-gui'

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
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMap/5/px.jpg',
    '/textures/environmentMap/5/nx.jpg',
    '/textures/environmentMap/5/py.jpg',
    '/textures/environmentMap/5/ny.jpg',
    '/textures/environmentMap/5/pz.jpg',
    '/textures/environmentMap/5/nz.jpg'
])

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.colorSpace = THREE.SRGBColorSpace
const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture
})

// problem with shadow:
// to handle shadows, Three.js do renders from the lights point of view called shadow maps
// when those render occur, all the materials are replaced by another set of materials (MeshDepthMaterial)
// and these materials don't twist
// so currently, the model twist but not the shadow

// by placing this plane material to the scene, we can see the shadow of the model is not twisting
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(15, 15, 15),
//     new THREE.MeshStandardMaterial()
// )

// plane.rotation.y = Math.PI
// plane.position.y = - 5
// plane.position.z = 5
// scene.add(plane)

// solution:
// We cannot access the depth material easily but we can override it with the property "customDepthMaterial"
// and tell the Mesh to use the custom material instead of the built-in depth material

const depthMaterial = new THREE.MeshDepthMaterial({
    // It is a better way of storing the depth by using the r, g, b, and a separately for better precision and Three.js needs it.
    depthPacking: THREE.RGBADepthPacking
})


// if we want to change the uniform value that will be used inside shader hook
// we have to declare the uniform outside of the hook so we can freely update it 
const customUniforms = {
    uTime: { value: 0 }
}
// hook that we can access to shader and modify
// we have to use the "#include..." to inject our code with a native Javascript "replace(...)" from shader.vertexShader
// #includes => includes the chunk of the code from another file in .glsl file (something Three.js does not WebGL)
// before modifying we need to check node_modules/three/src/renderers/shaders/ShaderLib/meshphysical.glsl.js
// and understand the code
material.onBeforeCompile = (shader) => {
    // [twist model] 
    shader.uniforms.uTime = customUniforms.uTime
    // we need to put function outside of void main() {}
    // so we inject function separately from our logic to rotate the model
    shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>

        uniform float uTime;

        // https://thebookofshaders.com/08/
        mat2 get2dRotateMatrix(float _angle)
        {
            return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
        }
        `)

    shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        // we will try to twist the model with center basis (y axis)
        // and we rotate more as higher the position gets (the head rotates more and shoulder rotates less); it rotates at different amplitude depending on the elevation of the vertex.
        `
        #include <begin_vertex>

        float angle = (position.y + uTime) * 0.9;
        mat2 rotateMatrix = get2dRotateMatrix(angle);

        transformed.xz = rotateMatrix * transformed.xz;
        `)

}

// fix the drop shadow (the shadow that is casted to the another object)
// by twisting the shadow as well. 
// core shadow won't reflect the twist which is related to "normal" problem
// the normal are data associated with the vertices that tell in which direction is the outside to be used for lights, shadows, reflections and stuff like that
// we did rotate the vertices but not the normals
// 
depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime

    shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>

        uniform float uTime;

        // https://thebookofshaders.com/08/
        mat2 get2dRotateMatrix(float _angle)
        {
            return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
        }
        `)

    shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>

        float angle = (position.y + uTime) * 0.9;
        mat2 rotateMatrix = get2dRotateMatrix(angle);

        transformed.xz = rotateMatrix * transformed.xz;
        `
    )
}

/**
 * Models
 */
gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        // Model
        const mesh = gltf.scene.children[0]
        mesh.rotation.y = Math.PI * 0.5
        mesh.material = material
        mesh.customDepthMaterial = depthMaterial // override the depth material
        scene.add(mesh)

        // Update materials
        updateAllMaterials()
    }
)


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)

plane.rotation.y = Math.PI
plane.position.y = - 5
plane.position.z = 5
scene.add(plane)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)

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
camera.position.set(4, 1, - 4)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // we can not update the uniform in the tick because we can't access it outside
    //  material.uniforms.uTime.value = elapsedTime  // <----------- this won't work

    customUniforms.uTime.value = elapsedTime; // instead we have to declare the uniform value outside of the shader hook
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()