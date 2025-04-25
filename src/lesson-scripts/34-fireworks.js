import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from '../shaders/lesson-34-fireworks/vertex.glsl'
import fragmentShader from '../shaders/lesson-34-fireworks/fragment.glsl'
import gsap from 'gsap'
/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
camera.position.set(1.5, 0, 6)
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fireworks
 */

const textures = [
    textureLoader.load('/textures/particles/1.png'),
    textureLoader.load('/textures/particles/2.png'),
    textureLoader.load('/textures/particles/3.png'),
    textureLoader.load('/textures/particles/4.png'),
    textureLoader.load('/textures/particles/5.png'),
    textureLoader.load('/textures/particles/6.png'),
    textureLoader.load('/textures/particles/7.png'),
    textureLoader.load('/textures/particles/11.png')
]

const createFirework = (count, position, size, texture, radius, color) => {
    // Geometry
    const positionsArray = new Float32Array(count * 3)

    const sizesArray = new Float32Array(count)
    for (let i = 0; i < count; i++) {

        const vertex = 3
        const x = 0
        const y = 1
        const z = 2


        const spherical = new THREE.Spherical(
            radius * (0.75 + Math.random() * 0.25),
            Math.random() * Math.PI, // PHI
            Math.random() * Math.PI * 2 // THETA
        )

        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)


        positionsArray[i * vertex + x] = position.x
        positionsArray[i * vertex + y] = position.y
        positionsArray[i * vertex + z] = position.z

        sizesArray[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1))

    // texture is upside down when we are using gl_PointCoord
    // this is because THREE.js flips the texture for the uv coordinate. 
    // but it does not work with gl_PointCoord so we have to flip it back
    texture.flipY = false
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(size),
            // uResolutions: is used to change the size of the particle relative to the render height,
            // and we want to update the uniform on resize event
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0)
        },
        transparent: true,
        depthWrite: false, // by default, particles hides the back particles because of the depth buffer, so we disable it,
        blending: THREE.AdditiveBlending // make the particle brighter
    })

    const firework = new THREE.Points(
        geometry,
        material
    )

    // Animate

    const destroy = () => {
        // https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
        scene.remove(firework)
        firework.geometry.dispose()
        firework.material.dispose()

        // we don't dispose texture because other fireworks might use it
    }


    gsap.to(
        material.uniforms.uProgress,
        {
            value: 1, duration: 3, ease: 'linear', onComplete: destroy
        }
    )


    firework.position.copy(position)
    scene.add(firework)



}


createFirework(
    100,
    new THREE.Vector3(), // by default returns center,
    0.5,
    textures[Math.floor(Math.random() * textures.length)],
    1,
    new THREE.Color().setRGB(Math.random(), Math.random(), Math.random())

)

window.addEventListener('click', () => {

    createFirework(
        100,
        new THREE.Vector3(), // by default returns center,
        0.5,
        textures[Math.floor(Math.random() * textures.length)],
        1,
        new THREE.Color().setRGB(Math.random(), Math.random(), Math.random())

    )


})
/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()