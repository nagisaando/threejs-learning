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


// roof texture 


// const roofDiffTexture = textureLoader.load('textures/door/color.webp')
const roofDiffTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp')
const roofARMTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp')
const roofNormalTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp')

roofDiffTexture.colorSpace = THREE.SRGBColorSpace

roofDiffTexture.repeat.set(3, 1)
roofARMTexture.repeat.set(3, 1)
roofNormalTexture.repeat.set(3, 1)


roofDiffTexture.wrapS = THREE.RepeatWrapping // this is necessary to make the texture repeat correctly
// roofDiffTexture.wrapT = THREE.RepeatWrapping // we don't need to specify for T (y coordination) since the texture is not repeated in y coordination

roofARMTexture.wrapS = THREE.RepeatWrapping
roofNormalTexture.wrapS = THREE.RepeatWrapping


// bush texture 

const bushDiffTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
const bushARMTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')
const bushNormalTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')

bushDiffTexture.colorSpace = THREE.SRGBColorSpace

bushDiffTexture.repeat.set(2, 1)
bushARMTexture.repeat.set(2, 1)
bushNormalTexture.repeat.set(2, 1)

bushDiffTexture.wrapS = THREE.RepeatWrapping
bushDiffTexture.wrapT = THREE.RepeatWrapping


bushARMTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.wrapT = THREE.RepeatWrapping

bushNormalTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.wrapT = THREE.RepeatWrapping


// grave texture 
const graveDiffTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp')
const graveARMTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp')
const graveNormalTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp')

graveDiffTexture.colorSpace = THREE.SRGBColorSpace

// door texture 

const doorAlphaTexture = textureLoader.load('/textures/door/alpha.webp')
const doorDiffTexture = textureLoader.load('/textures/door/color.webp')
const doorAOTexture = textureLoader.load('/textures/door/ambientOcclusion.webp')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.webp')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.webp')
const doorNormalTexture = textureLoader.load('/textures/door/normal.webp')
const doorDisplacementTexture = textureLoader.load('/textures/door/height.webp')

doorDiffTexture.colorSpace = THREE.SRGBColorSpace

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
    new THREE.MeshStandardMaterial({
        // texture is skewed and lighting acts weird, this is caused by normal and uv of cone geometry (three.js can calculate normal with "computeVertexNormals" from BufferGeometry)
        // as a solution, we have to create geometry attribute by myself, or we can create model using 3d software such as Blender (aka UV unwrapping)
        map: roofDiffTexture,
        metalnessMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        aoMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
)
roof.rotation.y = Math.PI * 0.25 // 1/8 rotation

roof.position.y = 2.5 + 1.5 / 2


// Door

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: doorAlphaTexture,
        transparent: true,
        map: doorDiffTexture,
        aoMap: doorAOTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
        normalMap: doorNormalTexture,
        displacementMap: doorDisplacementTexture,
        displacementScale: 0.1,
        displacementBias: -0.03
    })
)

gui.add(door.material, 'displacementBias')
    .min(-2)
    .max(5)
    .step(0.01)

gui.add(door.material, 'displacementScale')
    .min(-2)
    .max(5)
    .step(0.01)

door.position.y = 1 // since door texture has some space in bottom, we can not lift up completely
door.position.z = 4 / 2 + 0.01




houseGroup.add(wall, roof, door)
scene.add(houseGroup)


// door lamp
const doorLamp = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.07),
    new THREE.MeshStandardMaterial(
        {
            emissiveIntensity: 7,
            emissive: '#ff7d46'
        }
    )
)

doorLamp.position.set(0, 2.5, 2.1)
houseGroup.add(doorLamp)

// Bushes

const bushGroup = new THREE.Group()

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc',
    map: bushDiffTexture,
    metalnessMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    aoMap: bushARMTexture,
    normalMap: bushNormalTexture
})


const bush1 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)


bush1.scale.set(0.5, 0.5, 0.5)
// or bush1.scale.setScalar(0.5)
bush1.position.set(0.8, 0.2, 2.2)

// because of uv unwrapping of sphere geometry, the texture looks weird
// this rotation will hide the texture issue :) 
bush1.rotation.x = -0.75

const bush2 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)

bush2.scale.set(0.3, 0.3, 0.3)
bush2.position.set(1.3, 0, 2.2)
bush2.rotation.x = -0.75

const bush3 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.2, 2.4)
bush3.rotation.x = -0.75

const bush4 = new THREE.Mesh(
    bushGeometry,
    bushMaterial
)

bush4.scale.set(0.2, 0.2, 0.2)
bush4.position.set(-1.3, 0.1, 2.4)
bush4.rotation.x = -0.75


bushGroup.add(bush1, bush2, bush3, bush4)
scene.add(bushGroup)


// Graves

const graveGeometry = new THREE.BoxGeometry(1, 1.5, 0.5)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveDiffTexture,
    metalnessMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    aoMap: graveARMTexture,
    normalMap: graveNormalTexture
})

const graveGroup = new THREE.Group()

for (let i = 0; i < 30; i++) {
    const grave = new THREE.Mesh(
        graveGeometry,
        graveMaterial
    )
    grave.rotation.z = Math.random() - 0.5

    const angle = Math.random() * Math.PI * 2
    const radiant = 4 + Math.random() * 4 // +4 means radius will be always more than 4 (this is half width of the house[2] and extra space) + random number of 0 - 3.9999 

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
            transparent: true,
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
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

const pointLight = new THREE.PointLight('#ff7d46', 5)

pointLight.position.set(0, 2.5, 2.1)
scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5)
scene.add(pointLightHelper)


// Ghost

const ghost1 = new THREE.PointLight('#53D8FB', 6)
const ghost2 = new THREE.PointLight('#3772FF', 6)
const ghost3 = new THREE.PointLight('#4B8F8C', 6)

scene.add(ghost1, ghost2, ghost3)
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
 * Shadows
 */

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

pointLight.castShadow = true // if casting shadow is not changing screen much, we could remove for optimization
directionalLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

roof.receiveShadow = true
roof.castShadow = true

wall.receiveShadow = true
wall.castShadow = true

bush1.receiveShadow = true
bush2.receiveShadow = true
bush3.receiveShadow = true
bush4.receiveShadow = true

bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

graveGroup.children.forEach(grave => {
    grave.receiveShadow = true
    grave.castShadow = true
})
ground.receiveShadow = true


/**
 * Animate
 */
const timer = new Timer()

let ghost1Radius = 5
let up = false

function changeRadiusOfGhost1() {
    if (up) {
        ghost1Radius += 0.01
        if (ghost1Radius >= 6) {
            up = false
        }
    } else {
        ghost1Radius -= 0.01
        if (ghost1Radius <= 4) {
            up = true
        }
    }
}

const testGhost = new THREE.Mesh(
    bushGeometry,
    new THREE.MeshStandardMaterial()
)

// scene.add(testGhost)
const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()


    changeRadiusOfGhost1()
    ghost1.position.set(
        Math.sin(elapsedTime * 0.5) * ghost1Radius,
        Math.sin(elapsedTime) * Math.sin(elapsedTime * 1.1) * Math.sin(elapsedTime * 1.4) * 2, // this will create as if ghost moves vertically irregularly
        Math.cos(elapsedTime * 0.5) * ghost1Radius)


    ghost2.position.x = Math.sin(-elapsedTime * 0.2) * 5 // adding minus will make circle otherwise
    ghost2.position.z = Math.cos(-elapsedTime * 0.2) * 5// adding minus will make circle otherwise
    ghost2.position.y = Math.sin(elapsedTime) * Math.sin(elapsedTime * 1.4) * Math.sin(elapsedTime * 4)



    ghost3.position.x = Math.sin(elapsedTime * 0.1) * 7 // adding minus will make circle otherwise
    ghost3.position.z = Math.cos(elapsedTime * 0.1) * 7// adding minus will make circle otherwise
    ghost3.position.y = Math.sin(elapsedTime) * Math.sin(elapsedTime * 1.4) * Math.sin(elapsedTime * 4)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()