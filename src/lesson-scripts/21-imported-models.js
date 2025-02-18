import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'


// since GLTFLoader is heavy we have to import it from the separate path from the three.js default path
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

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
 * Models
 */

const loader = new GLTFLoader()

//  ========================================================
// [Duck model]

// - glTF format
// loader.load('/models/Duck/glTF/Duck.gltf',
//     (gltf) => {
//         console.log(gltf)

//         // There are multiple ways adding the model to the scene: 
//         // 1) Add the whole scene in our scene
//         //    Since scene property of GLTF is just a Group, it can be add to the scene.
//         //    However it will add a lot of redundant data
//         //    scene.add(gltf.scene)

//         // 2) Add the children of the scene to our scene, 
//         //    problem is still we get some redundant data such as Camera that contains inside the children
//         //    scene.add(gltf.scene.children[0])
//     },
//     () => {
//         console.log('success');
//     },
//     // called while loading is processing
//     (xhl) => {
//         console.log((xhl.loaded / xhl.total * 100) + '% loaded');
//     },
//     () => {
//         console.log('error');
//     },
// )

// // - glTF-Binary format
// loader.load('/models/Duck/glTF-Binary/Duck.glb',
//     (gltf) => {
//         scene.add(gltf.scene)
//     },
// )

// - glTF-Embedded format
// loader.load('/models/Duck/glTF-Embedded/Duck.gltf',
//     (gltf) => {
//         scene.add(gltf.scene)
//     },
// )

// - glTF-DRACO format

// const dracoLoader = new DRACOLoader()

// the decoder is available in Web Assembly, and it can run in a worker to improve performances significantly
// three.js already provided the code, 
// we have to copy the folder (node_modules/three/examples/jsm/libs/draco in v0.170.0) 
// and paste it to static folder, and set to Decoder path

// loader.load('/models/Duck/glTF-Draco/Duck.gltf',
//     (gltf) => {
//         console.log(gltf)
//         scene.add(gltf.scene)
//     },
//     () => { },
//     (err) => {
//         console.log(err)
//     }
// )


// draco instance will be loaded when it is needed 
// dracoLoader.setDecoderPath('/draco/')
// loader.setDRACOLoader(dracoLoader)

// so if we use regular gltf while dracoLoader is set, draco decoder won't be loaded
// such as: loader.load('/models/Duck/glTF/Duck.gltf',

//  ========================================================

//  ========================================================
// [Flight Helmet model]

// loader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         console.log(gltf)


//         // gltf.scene.scale.set(4, 4, 4)
//         // scene.add(gltf.scene)

//         // or add only children

//         // gltf.scene.children is a special array from Three.js 
//         // If we assign to scene.add() directly from gltf.scene.children:
//         // for (const child of gltf.scene.children) {
//         //     scene.add(child)
//         // }

//         // the 3D object/Group of child model automatically will be removed from gltf.scene.children, 
//         // which won't allow to loop them correctly.
//         // so we have to create a new array based on the three.js children array and loop them instead 
//         const modelGroups = [...gltf.scene.children]
//         for (const child of modelGroups) {
//             scene.add(child)
//         }
//     }
// )
//  ========================================================


//  ========================================================
// [Fox model + animation]

let mixer
let survey
let run
let walk

loader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
    console.log(gltf)


    const model = gltf.scene
    const clips = gltf.animations

    mixer = new THREE.AnimationMixer(model)

    survey = THREE.AnimationClip.findByName(clips, 'Survey')
    walk = THREE.AnimationClip.findByName(clips, 'Walk')
    run = THREE.AnimationClip.findByName(clips, 'Run')


    gltf.scene.scale.set(0.025, 0.025, 0.025)
    scene.add(gltf.scene)
    // or

    // const children = [...gltf.scene.children]

    // for (const child of children) {
    //     child.scale.set(0.025, 0.025, 0.025)
    //     scene.add(child)
    // }


    // we can play animation but I do it on gui for easier control
    // const action = mixer.clipAction(survey)
    // action.play()

    // or multiple animation can be played at the same time 
    // clips.forEach(function (clip) {
    //     mixer.clipAction(clip).play()
    // });

})
//  ========================================================

/**
 * Debug
 */

function animate(animation) {
    if (mixer) {
        const action = mixer.clipAction(animation)
        action.play()
    }
}
const debugObject = {
    run: () => animate(run),
    walk: () => animate(walk),
    survey: () => animate(survey),
    stop: () => {
        if (mixer)
            mixer.stopAllAction()
    }
}
gui.add(debugObject, 'run')
gui.add(debugObject, 'walk')
gui.add(debugObject, 'survey')
gui.add(debugObject, 'stop')

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime

    if (mixer) {
        mixer.update(deltaTime)
    }
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()