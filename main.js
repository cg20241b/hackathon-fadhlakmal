import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

camera.position.z = 5;

const vert = `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
const frag = `
        uniform vec3 glowColor;
        uniform vec3 viewVector;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
            float intensity = pow(0.5 - dot(vNormal, vPositionNormal), 2.0);
            gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
    `;

// Central Glowing Cube
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Load font and create text meshes
const loader = new FontLoader();
loader.load('helvetiker_bold.typeface.json', function (font) {
    // const textMaterial = new THREE.MeshBasicMaterial({ color: 0xfa8734 });
    const textMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { type: "c", value: new THREE.Color(0xfa8734) },
            viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    // Create 'L' mesh
    const textGeometry = new TextGeometry('L', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-2, 0, 0); // Position on the left side
    scene.add(textMesh);

    // const digitMaterial = new THREE.MeshBasicMaterial({ color: 0x0578cb });
    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { type: "c", value: new THREE.Color(0x0578cb) },
            viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    // Create '8' mesh
    const digitGeometry = new TextGeometry('8', {
        font: font,
        size: 1,
        height: 0.2,
    });    
    
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(2, 0, 0); // Position on the right side
    scene.add(digitMesh);
});

function animate() {
    renderer.render( scene, camera );
}

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            cube.position.y += 0.1;
            break;
        case 's':
            cube.position.y -= 0.1;
            break;
        case 'a':
            camera.position.x -= 0.1;
            break;
        case 'd':
            camera.position.x += 0.1;
            break;
    }
});