import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
import { environments } from 'eslint-plugin-prettier'
const gui = new GUI({
    width: 300,
    title: "Lesson 11: materials"
})
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture
const loadingManager = new THREE.LoadingManager()
loadingManager.onError = (err) => {
    console.log(err)
}

const textureLoader = new THREE.TextureLoader(loadingManager)

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

const matcapTexture = textureLoader.load('textures/matcaps/1.png')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

// Textures that are used in `map` and `matcap` are supposed to be encoded in sRBG by doing:  
doorColorTexture.colorSpace = THREE.SRGBColorSpace
matcapTexture.colorSpace = THREE.SRGBColorSpace

// Object

// [MeshBasicMaterial] ===============================================================================
// const material = new THREE.MeshBasicMaterial({ map: doorColorTexture })
// or 
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture

// // When changing color directly, Color class must be instantiated 
// // material.color = 'red' // this won't work
// // material.color = new THREE.Color('red') // this works

// // Changing only the opacity (alpha channel) won't make the material appear transparent on the screen.
// // Opacity controls the alpha (transparency level) of the material, but Three.js assumes materials are fully opaque by default.
// // To enable transparency and make opacity work, we must set `transparent = true`.
// material.transparent = true
// // material.opacity = 0.2

// // also when we are using alphaMap, we need transparent to be true as well
// // material.alphaMap = doorAlphaTexture 

// // by default, Three.js renders texture only one side
// // we can do double side as below, but it requires more resources even the side is not visible so gotta be careful using it
// // for example, Blender export model as double side by default


// material.wireframe = true

// ======================================================================================================



// [MeshNormalMaterial] ===============================================================================
// Displays a nice purple, blueish color that looks like the normal texture
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true // We can have flat surface

// ======================================================================================================



// [MeshMatcapMaterial] ===============================================================================
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture
// ======================================================================================================

// // [MeshDepthMaterial] ===============================================================================
// const material = new THREE.MeshDepthMaterial()
// ======================================================================================================

// [MeshLambertMaterial] ===============================================================================
// this material requires light (or could be with environment map if the environment map is giving sufficient light)
// const material = new THREE.MeshLambertMaterial()
// ======================================================================================================


// // [MeshPhongMaterial] ===============================================================================
// // this material requires light
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)
// ======================================================================================================

// [MeshToonMaterial] ===============================================================================
// const material = new THREE.MeshToonMaterial()

// gradientTexture.magFilter = THREE.NearestFilter // if we don't add this, the texture gets stretched out since texture is really small and can not create cartoonish face
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.generateMipmaps = false

// material.gradientMap = gradientTexture // we disable it since minFilter is using NearestFilter
// ======================================================================================================



// // [MeshStandardMaterial] ===============================================================================
// const material = new THREE.MeshStandardMaterial()
// material.metalness = 1
// material.roughness = 1

// gui
//     .add(material, 'metalness')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// gui
//     .add(material, 'roughness')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// material.side = THREE.DoubleSide


// material.map = doorColorTexture

// // ao => ambient occlusion map will add shadows where the texture is dark
// // it affects light created by AmbientLight, the environment map and the HemisphereLight
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1


// gui
//     .add(material, 'aoMapIntensity')
//     .min(0)
//     .max(10)
//     .step(0.001)


// // to use height texture, we need a lot of segments (subdivisions) otherwise texture won't be able to move the vertices to create true relief
// // since it requires a lot of segments, this can cause performance issue
// const materialProperties = {
//     displacement: false
// }

// material.displacementMap = null
// material.displacementScale = 0.1

// gui
//     .add(material, 'displacementScale')
//     .min(0)
//     .max(3)
//     .step(0.001)

// gui
//     .add(materialProperties, "displacement")
//     .name("Enable Displacement(height texture)")
//     .onChange((value) => {
//         if (value) {
//             material.displacementMap = doorHeightTexture
//         } else {
//             material.displacementMap = null
//         }
//         material.needsUpdate = true
//     })


// // we can control metalness and roughness using texture
// // if we use both metalnessMap/roughnessMap will be multiplied by material.metalness/material.roughness so make sure to keep 1
// // material.metalness = 1
// // material.roughness = 1

// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture

// // normalMap will fake the normal orientation and add details to the surface REGARDLESS OF THE SUBDIVISION (better for the performance) 
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.1, 0.1)

// gui
//     .add(material.normalScale, 'x')
//     .min(0)
//     .max(1)
//     .step(0.01)
//     .name("Normal Scale X")

// gui
//     .add(material.normalScale, 'y')
//     .min(0)
//     .max(1)
//     .step(0.01)
//     .name("Normal Scale Y")

// material.transparent = true // we need to toggle to true otherwise three.js does not do anything for black part of alpha texture since three.js assumes the objects are fully opaque
// material.alphaMap = doorAlphaTexture
// ======================================================================================================






// [MeshPhysicalMaterial] ===============================================================================
const material = new THREE.MeshPhysicalMaterial()
material.metalness = 0
material.roughness = 0

gui
    .add(material, 'metalness')
    .min(0)
    .max(1)
    .step(0.0001)

gui
    .add(material, 'roughness')
    .min(0)
    .max(1)
    .step(0.0001)

// material.side = THREE.DoubleSide


// material.map = doorColorTexture

// // ao => ambient occlusion map will add shadows where the texture is dark
// // it affects light created by AmbientLight, the environment map and the HemisphereLight
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1


// gui
//     .add(material, 'aoMapIntensity')
//     .min(0)
//     .max(10)
//     .step(0.001)


// // to use height texture, we need a lot of segments (subdivisions) otherwise texture won't be able to move the vertices to create true relief
// // since it requires a lot of segments, this can cause performance issue
// const materialProperties = {
//     displacement: false
// }

// material.displacementMap = null
// material.displacementScale = 0.1

// gui
//     .add(material, 'displacementScale')
//     .min(0)
//     .max(3)
//     .step(0.001)

// gui
//     .add(materialProperties, "displacement")
//     .name("Enable Displacement(height texture)")
//     .onChange((value) => {
//         if (value) {
//             material.displacementMap = doorHeightTexture
//         } else {
//             material.displacementMap = null
//         }
//         material.needsUpdate = true
//     })


// // we can control metalness and roughness using texture
// // if we use both metalnessMap/roughnessMap will be multiplied by material.metalness/material.roughness so make sure to keep 1
// // material.metalness = 1
// // material.roughness = 1

// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture

// // normalMap will fake the normal orientation and add details to the surface REGARDLESS OF THE SUBDIVISION (better for the performance) 
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.1, 0.1)

// gui
//     .add(material.normalScale, 'x')
//     .min(0)
//     .max(1)
//     .step(0.01)
//     .name("Normal Scale X")

// gui
//     .add(material.normalScale, 'y')
//     .min(0)
//     .max(1)
//     .step(0.01)
//     .name("Normal Scale Y")

// material.transparent = true // we need to toggle to true otherwise three.js does not do anything for black part of alpha texture since three.js assumes the objects are fully opaque
// material.alphaMap = doorAlphaTexture

// Clearcoat

// material.clearcoat = 1
// material.clearcoatRoughness = 0

// gui
//     .add(material, 'clearcoat')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// gui
//     .add(material, 'clearcoatRoughness')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// Sheen (this is for matte material in general)
// material.sheen = 1
// material.sheenRoughness = 0.25
// material.sheenColor.set(1, 1, 1)

// gui
//     .add(material, 'sheen')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// gui
//     .add(material, 'sheenRoughness')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// gui
//     .addColor(material, 'sheenColor')

// Iridescence
// material.iridescence = 1
// ior =>  Index of Refraction: it is used in rendering to describe how light bends (refracts)
// as it passes through a material, like glass, water or gemstones. 
// material.iridescenceIOR = 1
// material.iridescenceThicknessRange = [100, 800]

// gui
//     .add(material, 'iridescence')
//     .min(0)
//     .max(1)
//     .step(0.0001)

// gui
//     .add(material, 'iridescenceIOR')
//     .min(0)
//     // this can not be above around 2.333 otherwise it will create materials that does not exist in real life
//     .max(2.333)
//     .step(0.0001)


// gui
//     .add(material.iridescenceThicknessRange, '0')
//     .min(1)
//     .max(1000)
//     .step(1)


// gui
//     .add(material.iridescenceThicknessRange, '1')
//     .min(1)
//     .max(1000)
//     .step(1)

// Transmission

material.transmission = 1
material.ior = 1.5
material.thickness = 0.5

gui
    .add(material, 'transmission')
    .min(0)
    .max(1)
    .step(0.0001)

gui
    .add(material, 'ior')
    .min(0)
    // this can not be above around 2.333 otherwise it will create materials that does not exist in real life
    .max(10)
    .step(0.0001)

gui
    .add(material, 'thickness')
    .min(0)
    .max(1)
    .step(0.0001)

// ======================================================================================================



// const box = new THREE.Mesh(
//     new THREE.BoxGeometry(),
//     material
// )
// box.position.y = 1.5


// we need a lot of subdivisions to the geometry to use height texture (displacementMap)
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material)
sphere.position.x = -1.5

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material)


const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 64, 128), material)
torus.position.x = 1.5

scene.add(sphere, plane, torus)


/**
 * Lights
 */

// ambient light is coming from everywhere, not from the specific direction
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 30)
// scene.add(pointLight)

// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 1



/**
 * Environment map
 */

const rgbeLoader = new RGBELoader()
rgbeLoader.load('/textures/environmentMap/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
})


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

    const xRotation = elapsedTime * -0.15
    const yRotation = elapsedTime * 0.1
    sphere.rotation.set(xRotation, yRotation, 0)
    plane.rotation.set(xRotation, yRotation, 0)
    torus.rotation.set(xRotation, yRotation, 0)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()