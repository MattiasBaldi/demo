import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"; 
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import GUI from "lil-gui";

// ...existing code...

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
const geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 ); 
const material = new THREE.MeshStandardMaterial({ color: 'white' });
const torusknot = new THREE.Mesh(geometry, material);
scene.add(torusknot);

torusknot.scale.setScalar(0.05)

// Debug GUI for cube material
const torusFolder = gui.addFolder('Object Material');
torusFolder.addColor({ color: material.color.getHex() }, 'color').onChange((value) => {
    material.color.set(value);
});
torusFolder.add(material, 'roughness', 0, 1, 0.01);
torusFolder.add(material, 'metalness', 0, 1, 0.01);
torusFolder.open();



// button
const addLogoButton = {
    addLogo: () => {
        // Create a canvas element
        const canvasElement = document.createElement('canvas');
        canvasElement.width = 256;
        canvasElement.height = 256;
        const context = canvasElement.getContext('2d');

        // Clear the canvas with transparent background
        context.clearRect(0, 0, 256, 256);

        // Draw text "Logo Here"
        context.fillStyle = 'black';
        context.font = '30px Arial';
        context.fillText('Logo Here', 50, 50);

        // Draw a red dot beneath the text
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(128, 150, 30, 0, Math.PI * 2);
        context.fill();

        // Create a texture from the canvas
        const logoTexture = new THREE.CanvasTexture(canvasElement);
        
        // Create a decal material
        const decalMaterial = new THREE.MeshPhysicalMaterial({
            map: logoTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            wireframe: false,
            roughness: 0.5,
            metalness: 0.2
        });

        // Position for the decal (initially on front of torus)
        const position = new THREE.Vector3(0, 0.27, 0.23);
        
        // Create a decal
        const decalSize = new THREE.Vector3(0.2, 0.2, 0.2);
        const decalGeometry = new DecalGeometry(
            torusknot, 
            position, 
            new THREE.Euler(0, 0, 0), 
            decalSize
        );
        
        const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
        scene.add(decalMesh);

        // Add GUI controls for the decal
        const logoFolder = gui.addFolder('Logo Decal');
        

        // Size control
        const sizeControl = { size: 0.2 };
        logoFolder.add(sizeControl, 'size', 0.3, 1.0, 0.01).onChange(() => {
            decalSize.set(sizeControl.size, sizeControl.size, sizeControl.size);
            updateDecal();
        });
        
        logoFolder.open();
        
        function updateDecal() {
            // Remove old decal
            scene.remove(decalMesh);
        
            
            // Create new decal geometry with updated parameters
            const newDecalGeometry = new DecalGeometry(
                torusknot, 
                position, 
                new THREE.Euler(0, 0, 0), 
                decalSize
            );
            
            // Update the mesh
            decalMesh.geometry.dispose();
            decalMesh.geometry = newDecalGeometry;
            scene.add(decalMesh);
        }
    }
};

let isLogoAdded = false;


// Create a proper function property for your button
const debugObject = {
    addLogo: function() {
        if (!isLogoAdded) {
            addLogoButton.addLogo();
            isLogoAdded = true;
        } else {
            console.log('Logo already added.');
        }
    }
};

// Add the button using the function property
gui.add(debugObject, 'addLogo').name('Add Logo');



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
