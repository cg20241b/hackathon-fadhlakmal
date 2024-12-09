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

// Central Glowing Cube
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

// Shader material for the cube
const glowShader = {
    uniforms: {
        "c": { type: "f", value: 1.0 }, // Controls the sharpness of the glow intensity
        "p": { type: "f", value: 1.4 }, // Exponent for intensity falloff
        glowColor: { type: "c", value: new THREE.Color(0xffffff) },
        viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewVector );
            intensity = pow( c - dot(vNormal, vNormel), p ); // Calculate glow intensity
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            vec3 glow = glowColor * intensity; // Apply glow effect
            gl_FragColor = vec4( glow, 1.0 ); // Final color output
        }
    `,
    side: THREE.BackSide, // Render the glow on the inside faces of the cube
    blending: THREE.AdditiveBlending, // Additive blending for light emission effect
    transparent: true
};

const cubeMaterial = new THREE.ShaderMaterial(glowShader);
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Load font and create text meshes
const loader = new FontLoader();
loader.load('helvetiker_bold.typeface.json', function (font) {
    const ambientIntensity = 0.2 + 0.028; // last 3 digit of NRP - 028

    const alphabetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { type: 'f', value: ambientIntensity }, // Ambient light intensity
            lightPosition: { type: 'v3', value: cube.position }, // Position of the point light which is the central cube
            viewVector: { type: 'v3', value: camera.position }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 lightPosition;
            uniform vec3 viewVector;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main() {
                // Ambient lighting component
                vec3 ambient = ambientIntensity * vec3(1.0, 0.5, 0.0);

                // Diffuse lighting component
                vec3 lightDirection = normalize(lightPosition - vPositionNormal);
                float diffuseStrength = max(dot(vNormal, lightDirection), 0.0);
                vec3 diffuse = diffuseStrength * vec3(1.0, 0.5, 0.0);

                // Specular lighting component
                vec3 viewDirection = normalize(viewVector - vPositionNormal);
                vec3 reflectDirection = reflect(-lightDirection, vNormal);
                float specularStrength = pow(max(dot(viewDirection, reflectDirection), 0.0), 16.0);
                vec3 specular = specularStrength * vec3(0.2, 0.2, 0.2);
                
                // Combine all components
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        side: THREE.FrontSide, // Render only the front-facing polygons
        transparent: true
    });

    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { type: 'f', value: ambientIntensity },
            lightPosition: { type: 'v3', value: cube.position },
            viewVector: { type: 'v3', value: camera.position }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 lightPosition;
            uniform vec3 viewVector;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main() {
                // Ambient lighting component
                vec3 ambient = ambientIntensity * vec3(0.0, 0.5, 1.0);

                // Diffuse lighting component
                vec3 lightDirection = normalize(lightPosition - vPositionNormal);
                float diffuseStrength = max(dot(vNormal, lightDirection), 0.0);
                vec3 diffuse = diffuseStrength * vec3(0.0, 0.5, 1.0);

                // Specular lighting component
                vec3 viewDirection = normalize(viewVector - vPositionNormal);
                vec3 reflectDirection = reflect(-lightDirection, vNormal);
                float specularStrength = pow(max(dot(viewDirection, reflectDirection), 0.0), 64.0);
                vec3 specular = specularStrength * vec3(1.0, 1.0, 1.0); // Metal-like specular highlight
                
                // Combine all components
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        side: THREE.FrontSide,
        transparent: true
    });

    // Create 'L' mesh
    const textGeometry = new TextGeometry('L', {
        font: font,
        size: 1,
        depth: 0.2,
    });
    const textMesh = new THREE.Mesh(textGeometry, alphabetMaterial);
    textMesh.position.set(-2, 0, 0); // Position on the left side
    scene.add(textMesh);

    // Create '8' mesh
    const digitGeometry = new TextGeometry('8', {
        font: font,
        size: 1,
        depth: 0.2,
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