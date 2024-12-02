import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// [Create Texture]
// To use texture in three.js, we have to convert image to texture,
// which is more GPU-friendly

// Option 1: using image.onload
// =====================================================================

// const image = new Image()
// const texture = new THREE.Texture(image) // image is not loaded yet

// // ensures that the texture is interpreted in the sRBG color space, which is a common standard for displaying colors on most screens
// // This adjustment is crucial for achieving accurate and realistic lighting in 3D scenes
// // we need it for textures such as diffuse, albedo or base color  
// texture.colorSpace = THREE.SRGBColorSpace 
// image.onload = () => {
//     texture.needsUpdate = true // when image is loaded, we update texture so GPU knows 
// }

// image.src = '/textures/door/color.jpg' // we can not use this directly as a texture unless we convert it
// =====================================================================


// Option 2: using TextureLoader (simpler and doing above solution behind the scene)
// =====================================================================
// const textureLoader = new THREE.TextureLoader()
// const texture = textureLoader.load(
//     '/textures/door/color.jpg',
//     // () => {
//     //     console.log('onLoad event')
//     // },
//     // () => {
//     //     console.log('onProgressLoad')
//     // },
//     // () => {
//     //     console.log('err')
//     // }
// )

// texture.colorSpace = THREE.SRGBColorSpace

// =====================================================================


//[LoadingManager]
// => mutualize the events
// => It is useful to know global loading progress or be informed when everything is loaded 

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => {
    console.log("onStart")
}
loadingManager.onLoad = () => {
    console.log("onLoad")
}
loadingManager.onProgress = () => {
    console.log("onProgress")
}
loadingManager.onError = () => {
    console.log("onError")
}
const textureLoader = new THREE.TextureLoader(loadingManager)

// we can load multiple textures
const colorTexture = textureLoader.load('/textures/door/color.jpg')

// this shows Moire pattern to describe minification filter
// const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')

// this is to see magnification filter behaviour well
// With colorTexture.magFilter = THREE.NearestFilter, the face should not look blurry
// const colorTexture = textureLoader.load('/textures/checkerboard-8x8.png')
// const colorTexture = textureLoader.load('/textures/minecraft.png')

const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

colorTexture.colorSpace = THREE.SRGBColorSpace
// repeat is vector 2: 2d coordinates and can access only x and y
// colorTexture.repeat.x = 2 // this will make the image 1/2 however instead of repeating the image, the last pixel of the image is used to fill the rest of 1/2 space 
// colorTexture.repeat.y = 3

// // colorTexture.wrapS = THREE.RepeatWrapping // this will make the image repeat correctly
// // colorTexture.wrapT = THREE.RepeatWrapping

// colorTexture.wrapS = THREE.MirroredRepeatWrapping // this will make the image repeat but mirror
// colorTexture.wrapT = THREE.MirroredRepeatWrapping

// colorTexture.offset.x = 0.5
// colorTexture.offset.y = 0.5

// rotation is radians (we can use PI)
// by default, rotation of box geometry starts from left bottom corner (0, 0)
// colorTexture.rotation = Math.PI * 0.25 // 1/4 circle

// // if we want to make it center
// colorTexture.center.x = 0.5
// colorTexture.center.y = 0.5

// [Filter and mipmapping] 
// we can change the minification filter (the default is LinearMipmapLinearFilter which merge a few textures and provide one)


// THREE.NearestFilter selects the nearest texel (texture pixel) to the given texture coordination from the original texture without interpolation.
// It finds the single closest texel and uses its color as the sampled color for rendering that point on the surface
// It can be used for pixelated look, sharper look
// Also it is computationally cheaper (performance is better) than LinearFilter because it does not involve blending or averaging 


colorTexture.minFilter = THREE.NearestFilter
// when THREE.NearestFilter is used on minFilter, we don't need mipmaps
// so we disable it to improve performance 
colorTexture.generateMipmaps = false
colorTexture.magFilter = THREE.NearestFilter

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
// we can see UV coordinates
console.log(geometry.attributes.uv)
const material = new THREE.MeshBasicMaterial({ map: colorTexture })
const mesh = new THREE.Mesh(geometry, material)
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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
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