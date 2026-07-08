// Hero 3D scene — animated diorama with a slow orbiting camera.
// Placeholder model: "Littlest Tokyo" by Glen Fox (CC BY 4.0), from the three.js examples.
// Swap the MODEL_URL for Peter's own glTF scene when ready.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/models/gltf/LittlestTokyo.glb";

const container = document.querySelector(".webgl-scene");
if (container) {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      1,
      100
    );

    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    let mixer = null;
    const clock = new THREE.Clock();

    loader.load(MODEL_URL, (gltf) => {
      const model = gltf.scene;
      model.position.set(1, 0.9, 0);
      model.scale.setScalar(0.01);
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      container.classList.add("is-ready");
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0;

    function animate() {
      const dt = clock.getDelta();
      if (mixer) mixer.update(dt);
      t += dt;
      const ang = t * 0.08;
      camera.position.set(Math.sin(ang) * 9.5, 2.6, Math.cos(ang) * 9.5);
      camera.lookAt(0.4, 0.7, 0);
      renderer.render(scene, camera);
      if (!reduced) requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  } catch (e) {
    // WebGL unavailable — the page simply renders without the 3D scene.
  }
}
