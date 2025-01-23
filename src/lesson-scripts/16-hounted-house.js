import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
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




/* 
  Texture
*/

// one textureLoader can handle all texture for one project
const textureLoader = new THREE.TextureLoader()

// floor texture

const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.webp')
const floorARMTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
const floorDiffTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
const floorNormalTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
const floorDisplacementTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')
// three.js uses linear workflow for rendering, meaning all colors are converted to linear color spacing for accurate light calculation. 
// but many textures like .jpg, .png are encoded in sRBG color space by default. For three.js to handle this type of textures correctly,
// we have to explicitly say to three.js about it otherwise the color gets too light/ too dark because three.js would treat them as if it were already in linear space 
floorDiffTexture.colorSpace = THREE.SRGBColorSpace

// floor texture is too big so we will repeat
// repeat is vector 2 (2d coordinates) and can access only x and y

floorDiffTexture.repeat.set(8, 8)
// or
// floorDiffTexture.repeat.x = 8
// floorDiffTexture.repeat.y = 8


floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)

floorDiffTexture.wrapS = THREE.RepeatWrapping // this is necessary to make the texture repeat correctly
floorDiffTexture.wrapT = THREE.RepeatWrapping

floorARMTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping

floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping

floorDisplacementTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping


// wall texture 

const wallDiffTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
const wallARMTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')
const wallNormalTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')

wallDiffTexture.colorSpace = THREE.SRGBColorSpace

/**
 * House
 */

const houseGroup = new THREE.Group()


// Wall 

const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial(
        {
            map: wallDiffTexture,
            aoMap: wallARMTexture,
            metalnessMap: wallARMTexture,
            roughnessMap: wallARMTexture,
            normalMap: wallNormalTexture
        }
    )
)

wall.position.y = 2.5 / 2


// Roof 

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial()
)
roof.rotation.y = Math.PI * 0.25 // 1/8 rotation

roof.position.y = 2.5 + 1.5 / 2


// Door

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial({
        color: 'orange'
    })
)

door.position.y = 1 // since door texture has some space in bottom, we can not lift up completely
door.position.z = 4 / 2 + 0.01




houseGroup.add(wall, roof, door)
scene.add(houseGroup)

// Bushes

const bushGroup = new THREE.Group()

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial()

const bush1 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)


bush1.scale.set(0.5, 0.5, 0.5)
// or bush1.scale.setScalar(0.5)
bush1.position.set(0.8, 0.2, 2.2)


const bush2 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)

bush2.scale.set(0.3, 0.3, 0.3)
bush2.position.set(1.3, 0, 2.2)


const bush3 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.2, 2.4)


const bush4 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)

bush4.scale.set(0.2, 0.2, 0.2)
bush4.position.set(-1.3, 0.1, 2.4)



bushGroup.add(bush1, bush2, bush3, bush4)
scene.add(bushGroup)


// Graves

const graveGeometry = new THREE.BoxGeometry(1, 1.5, 0.5)
const graveMaterial = new THREE.MeshStandardMaterial()

const graveGroup = new THREE.Group()

for (let i = 0; i < 30; i++) {
    const grave = new THREE.Mesh(
        graveGeometry,
        graveMaterial
    )
    grave.rotation.z = Math.random() - 0.5

    const angle = Math.random() * Math.PI * 2
    const radiant = 2.5 + Math.random() * 4 // +2.5 means radius will be always more than 2.5 (this is half width of the house[2] and extra space) + random number of 0 - 3.9999 

    // In trigonometry, by assigning the same angle to sin and cos, it will be x and y coordinates of circular positioning https://en.wikipedia.org/wiki/Sine_and_cosine
    grave.position.z = Math.sin(angle) * radiant
    grave.position.x = Math.cos(angle) * radiant

    // check again!!
    grave.rotation.y = Math.random() * 0.4 // between 0(inclusive) - 4(exclusive)
    grave.rotation.x = (Math.random() - 0.5) * 0.4 // Math.random() - 0.5 will return -0.5(inclusive) to 0.5(exclusive), by multiplying by 0.4, it will return min -0.2 (-0.5 * 0.4) to max will be closed to 0.2 (0.4999... * 0.4)
    grave.rotation.z = (Math.random() - 0.5) * 0.4


    graveGroup.add(grave)
}

scene.add(graveGroup)

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100), // we have to increase width/height segment param (3rd and 4th param) for the displacement map
    new THREE.MeshStandardMaterial(
        {
            alphaMap: floorAlphaTexture,
            // transparent: true,
            map: floorDiffTexture,
            normalMap: floorNormalTexture,
            roughnessMap: floorARMTexture,
            metalnessMap: floorARMTexture,
            aoMap: floorARMTexture,
            displacementMap: floorDisplacementTexture,
            displacementScale: 0.3, // to change the strength of displacement effect
            displacementBias: -0.15 // this is to offset the whole displacement (move the texture down)
        }
    )
)


gui.add(ground.material, 'displacementBias')
    .min(-2)
    .max(5)
    .step(0.01)

gui.add(ground.material, 'displacementScale')
    .min(-2)
    .max(5)
    .step(0.01)

ground.rotation.x = Math.PI * - 0.5
scene.add(ground)
/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
const timer = new Timer()

const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()