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

floorDiffTexture.colorSpace = THREE.SRGBColorSpace



/**
 * House
 */

const houseGroup = new THREE.Group()


// Wall 

const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial()
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
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial(
        {
            alphaMap: floorAlphaTexture,
            transparent: true,
            map: floorDiffTexture,
            normalMap: floorNormalTexture,
            roughnessMap: floorARMTexture,
            metalnessMap: floorARMTexture,
            aoMap: floorARMTexture,
        }
    )
)

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