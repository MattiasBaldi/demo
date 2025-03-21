import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"; 
import GUI from "lil-gui";

// init default
const gui = new GUI();
const scene = new THREE.Scene();
const canvas = document.querySelector(".webgl"); // Make sure you have a div with class 'webgl' in your HTML
const sizes = { width: window.innerWidth, height: window.innerHeight };
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Load HDR environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./environment/studi_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = new THREE.Color('white');
});


// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'white' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Debug GUI for cube material
const cubeFolder = gui.addFolder('Cube Material');
cubeFolder.addColor({ color: material.color.getHex() }, 'color').onChange((value) => {
    material.color.set(value);
});
cubeFolder.add(material, 'wireframe');
cubeFolder.add(material, 'roughness', 0, 1, 0.01);
cubeFolder.add(material, 'metalness', 0, 1, 0.01);
cubeFolder.open();


// button
const addLogoButton = {
    addLogo: () => {
        // Create a canvas element
        const canvasElement = document.createElement('canvas');
        canvasElement.width = 256;
        canvasElement.height = 256;
        const context = canvasElement.getContext('2d');

        // Draw text "Logo Here"
        context.fillStyle = 'black';
        context.font = '30px Arial';
        context.fillText('Logo Here', 50, 50);

        // Draw a red dot beneath the text with alpha around it
        context.fillStyle = 'rgba(255, 0, 0, 1)';
        context.beginPath();
        context.arc(128, 150, 10, 0, Math.PI * 2);
        context.fill();

        // Create a texture from the canvas
        const logoTexture = new THREE.CanvasTexture(canvasElement);

        // Apply the texture to the cube material
        cube.material.map = logoTexture;
        cube.material.transparent = true;
        cube.material.needsUpdate = true;

        // Set the texture to repeat and scale it down
        logoTexture.wrapS = THREE.RepeatWrapping;
        logoTexture.wrapT = THREE.RepeatWrapping;
        logoTexture.repeat.set(0.25, 0.25); // Adjust the repeat value to scale the logo

        // Add GUI controls for the logo size
        const logoFolder = gui.addFolder('Logo');
        logoFolder.add({ size: 0.25 }, 'size', 0.01, 1, 0.01).name('size').onChange((value) => {
            logoTexture.repeat.set(value, value);
            logoTexture.offset.set((1 - value) / 2, (1 - value) / 2);
            logoTexture.needsUpdate = true;
        });
        logoFolder.open();
    }
};

gui.add(addLogoButton, 'addLogo').name('Add Logo');

// Animation
const animate = () => {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);
};

animate();

// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
});
