
// this lesson demonstrate how to animate vertex that is composed of multiple phase animation
// key: separate the phase of the animation in vertex file


import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from '../shaders/lesson-34-fireworks/vertex.glsl'
import fragmentShader from '../shaders/lesson-34-fireworks/fragment.glsl'
import gsap from 'gsap'
import { Sky } from 'three/addons/objects/Sky.js'
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

    const timeMultipliersArray = new Float32Array(count)
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

        timeMultipliersArray[i] = 1 + Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1))
    geometry.setAttribute('aTimeMultiplier', new THREE.BufferAttribute(timeMultipliersArray, 1))
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


    firework.position.copy(position)

    scene.add(firework)





    const destroy = () => {
        // https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
        scene.remove(firework)
        firework.geometry.dispose()
        firework.material.dispose()

        // we don't dispose texture because other fireworks might use it
    }

    // Animate

    gsap.to(
        material.uniforms.uProgress,
        {
            value: 1, duration: 3, ease: 'linear', onComplete: destroy
        }
    )


}



const createRandomFirework = () => {
    const count = Math.round(400 + Math.random() * 1000) // random number from 1000 to 1400
    const position = new THREE.Vector3(

        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2

    )
    const size = 0.1 + Math.random() * 0.1
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()
    const color = new THREE.Color()
    // new THREE.Color().setRGB(Math.random(), Math.random(), Math.random()) 
    // tends to end up ugly color
    // by the below implementation, the color is saturated (2nd param), which make the color vivid and third param (light) makes it the color bright
    // 1st param(hue) takes 0 (red) to 1 (red) and there are all colors between 0 and 1 
    color.setHSL(Math.random(), 1, 0.7)

    createFirework(count, position, size, texture, radius, color)



}

createRandomFirework()

window.addEventListener('click', createRandomFirework)


/**
 * Sky
 */
// code is takes from https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html#L38
// Add Sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();

/// GUI

const skyParameters = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.95,
    elevation: -2.2,
    azimuth: 100,
    exposure: renderer.toneMappingExposure
};

const updateSky = () => {

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = skyParameters.turbidity;
    uniforms['rayleigh'].value = skyParameters.rayleigh;
    uniforms['mieCoefficient'].value = skyParameters.mieCoefficient;
    uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
    const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);

    renderer.toneMappingExposure = skyParameters.exposure;
    renderer.render(scene, camera);

}


gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky);
gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'elevation', -3, 90, 0.01).onChange(updateSky);
gui.add(skyParameters, 'azimuth', - 180, 180, 0.1).onChange(updateSky);
gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky);

updateSky();

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