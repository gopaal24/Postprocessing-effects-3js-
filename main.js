import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { WebGLRenderer } from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  BlendFunction,
  DepthOfFieldEffect,
  VignetteEffect,
  PixelationEffect,
  HueSaturationEffect,
  BrightnessContrastEffect,
  NoiseEffect,
  KernelSize,
  FXAAEffect
} from "postprocessing";
import { GUI } from "dat.gui";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcc33ff);

const renderer = new WebGLRenderer({
  powerPreference: "high-performance",
  antialias: false,
  stencil: false,
  depth: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

// Model loading
const loader = new GLTFLoader();
loader.load("./assets/model.gltf", (gltf) => {
  const model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  model.scale.set(10, 10, 10)
  scene.add(model);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
shadowLight.position.set(5, 20, 0);
shadowLight.castShadow = true;
shadowLight.shadow.camera.left = -500;
shadowLight.shadow.camera.right = 500;
shadowLight.shadow.camera.top = 500;
shadowLight.shadow.camera.bottom = -500;
shadowLight.shadow.camera.near = 1;
shadowLight.shadow.camera.far = 500;
shadowLight.shadow.mapSize.set(2048, 2048);
shadowLight.shadow.normalBias = 0.05;
shadowLight.shadow.radius = 10;
scene.add(shadowLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 20, 0);
scene.add(directionalLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 100;

// Renderer


// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const DOFEffect = new DepthOfFieldEffect(camera, {
      blendFunction: BlendFunction.SKIP,
      focusDistance: 0.08,
			focalLength: 0.03,
			bokehScale: 5.0,
      focusRange: 0.1
})

const pixelEffect = new PixelationEffect(0)

const bloomEffect = new BloomEffect({
    mipmapBlur: true,
    luminanceThreshold: 0.2,
    radius: 0.7,
    intensity: 8,
    blendFunction: BlendFunction.SKIP,
    kernelSize: KernelSize.LARGE
  });

  const hueEffect = new HueSaturationEffect({
    blendFunction: BlendFunction.SKIP,
    hue: 0,
    saturation: 0
  })

  const brightness = new BrightnessContrastEffect({
    blendFunction: BlendFunction.SKIP,
    brightness: 0,
    contrast: 0
  })

  const vignetteEffect = new VignetteEffect({
    blendFunction: BlendFunction.SKIP,
    eskil: false,
    offset: 0.5,
    darkness: 0.5
  });

  const noiseEffect = new NoiseEffect({
    blendFunction : BlendFunction.SKIP,
    premultiply: true
  })

  const fxaa = new FXAAEffect();

const pass = new EffectPass(camera, DOFEffect, pixelEffect,  bloomEffect, hueEffect, brightness, vignetteEffect, noiseEffect)
composer.addPass(pass)

const cocMaterial = DOFEffect.cocMaterial;

const params = {
  dof : {
        "enabled" : false,
        "focus": cocMaterial.uniforms.focusDistance.value,
        "focal length": cocMaterial.uniforms.focalLength.value,
        "blendMode": BlendFunction.ALPHA,
        "opacity": 1,
  },
    bloom : {
      "enabled" : false,
      "size" : KernelSize.LARGE,
      "threshold" : 0.2,
      "radius" : 0.7,
      "Intensity" : 8,
      "Smoothing" : 0.1,
      "BlendMode" : BlendFunction.ADD,
      "opacity" : 1
    },
    vignette : {
      "enabled" : false,
      "offset" : 0.5,
      "darkness" : 0.5,
      "blendMode" : BlendFunction.NORMAL,
      "opacity" : 1
    },
    pixel : {
      "enabled" : false,
      "granularity" : 0
    },
    hue : {
      "enabled" : false,
      "hue" : 0,
      "saturation": 0,
      "blendMode" : BlendFunction.NORMAL,
      "opacity" : 1
    },
    brightness : {
      "enabled" : false,
      "brightness" : 0,
      "contrast" : 0,
      "blendMode" : BlendFunction.NORMAL,
      "opacity" : 1
    },
    noise : {
      "enabled" : false,
      "blendMode" : BlendFunction.NORMAL,
      "opacity" : 1
    }
}

let blendModes = {
  "Skip" : BlendFunction.SKIP,
  "Add" : BlendFunction.ADD,
  "Alpha" : BlendFunction.ALPHA,
  "Average" : BlendFunction.AVERAGE,
  "Color" : BlendFunction.COLOR,
  "Color Burn" : BlendFunction.COLOR_BURN,
  "Color Dodge" : BlendFunction.COLOR_DODGE,
  "Darken" : BlendFunction.DARKEN,
  "Difference" : BlendFunction.DIFFERENCE,
  "Divide" : BlendFunction.DIVIDE,
  "Exclusion" : BlendFunction.EXCLUSION,
  "Hard Light" : BlendFunction.HARD_LIGHT,
  "Hard Mix" : BlendFunction.HARD_MIX,
  "Hue" : BlendFunction.HUE,
  "Invert" : BlendFunction.INVERT,
  "Invert RGB" : BlendFunction.INVERT_RGB,
  "Lighten" : BlendFunction.LIGHTEN,
  "Linear Burn" : BlendFunction.LINEAR_BURN,
  "Linear Dodge" : BlendFunction.LINEAR_DODGE,
  "Linear Light" : BlendFunction.LINEAR_LIGHT,
  "Luminosity" : BlendFunction.LUMINOSITY,
  "Multiply" : BlendFunction.MULTIPLY,
  "Negation" : BlendFunction.NEGATION,
  "Normal" : BlendFunction.NORMAL,
  "Overlay" : BlendFunction.OVERLAY,
  "Pin Light" : BlendFunction.PIN_LIGHT,
  "Reflect" : BlendFunction.REFLECT,
  "Saturation" : BlendFunction.SATURATION,
  "Screen" : BlendFunction.SCREEN,
  "Soft Light" : BlendFunction.SOFT_LIGHT,
  "Subtract" : BlendFunction.SUBTRACT,
  "Vivid Light" : BlendFunction.VIVID_LIGHT
}

const kernelSizes = {
  "very small" : KernelSize.VERY_SMALL,
  "small" : KernelSize.SMALL,
  "medium" : KernelSize.MEDIUM,
  "large" : KernelSize.LARGE,
  "very large" : KernelSize.VERY_LARGE,
  "huge" : KernelSize.HUGE,
}

const gui = new GUI();
const DOF_folder = gui.addFolder("DOF effect")
DOF_folder.add(params.dof, "enabled").onChange((value) => {
  DOFEffect.blendMode.blendFunction = value?BlendFunction.ALPHA:BlendFunction.SKIP
})
DOF_folder.add(DOFEffect, "bokehScale", 0, 20).name("Blur")
DOF_folder.add(params.dof, "focus", 0, 1, 0.0001).name("Focus").onChange((value) => {
  cocMaterial.uniforms.focusDistance.value = value
})
DOF_folder.add(params.dof, "focal length", 0, 1, 0.0001).name("focal length").onChange((value) => {
  cocMaterial.uniforms.focalLength.value = value
})
DOF_folder.add(params.dof, "blendMode", blendModes).onChange((value)=>{
  DOFEffect.blendMode.blendFunction = Number(value)
})
DOF_folder.add(params.dof, "opacity", 0, 1).onChange((value)=>{
  DOFEffect.blendMode.opacity.value = Number(value)
})
DOF_folder.open()

const BloomFolder = gui.addFolder("Bloom Folder")
BloomFolder.add(params.bloom, "enabled").onChange((value) => {
  bloomEffect.blendMode.blendFunction = value?BlendFunction.ADD:BlendFunction.SKIP
})
BloomFolder.add(params.bloom, "size", kernelSizes).onChange((value) => {
  bloomEffect.kernelSize = Number(value);
})
BloomFolder.add(params.bloom, "Intensity", 0, 20).onChange((value) => {
  bloomEffect.intensity = value;
})
BloomFolder.add(params.bloom, "radius", 0, 1, 0.1).onChange((value) => {
  bloomEffect.mipmapBlurPass.radius = value;
})
BloomFolder.add(params.bloom, "threshold", 0, 1, 0.1).onChange((value) => {
  bloomEffect.luminanceMaterial.threshold = value
})
BloomFolder.add(params.bloom, "Smoothing", 0, 1, 0.1).onChange((value) => {
  bloomEffect.luminanceMaterial.smoothing = value
})
BloomFolder.add(params.bloom, "BlendMode", blendModes ).onChange((value) => {
  bloomEffect.blendMode.blendFunction = Number(value)
})
BloomFolder.add(params.bloom, "opacity", 0, 1 ).onChange((value) => {
  bloomEffect.blendMode.opacity.value = Number(value)
})
BloomFolder.open()

const vignette_Folder = gui.addFolder("Vignette Folder")
vignette_Folder.add(params.vignette, "enabled").onChange((value) => {
  vignetteEffect.blendMode.blendFunction = value?BlendFunction.NORMAL:BlendFunction.SKIP
})
vignette_Folder.add(params.vignette, "offset", 0, 1, 0.1).onChange((value) => {
  vignetteEffect.offset = value
})
vignette_Folder.add(params.vignette, "darkness", 0, 1, 0.1).onChange((value) => {
  vignetteEffect.darkness = value
})
vignette_Folder.add(params.vignette, "blendMode", blendModes ).onChange((value) => {
  vignetteEffect.blendMode.blendFunction = Number(value)
})
vignette_Folder.add(params.vignette, "opacity", 0, 1).onChange((value) => {
  vignetteEffect.blendMode.opacity.value = value
})
vignette_Folder.open()

const pixel_Folder = gui.addFolder("Pixelation Effect")
pixel_Folder.add(params.pixel, "enabled").onChange((value) => {
  pixelEffect.blendMode.blendFunction = value?BlendFunction.NORMAL:BlendFunction.SKIP
})
pixel_Folder.add(params.pixel, "granularity", 1, 64).onChange((value) => {
  pixelEffect.granularity = value;
})
pixel_Folder.open();

const hue_Folder = gui.addFolder("Hue Saturation")
hue_Folder.add(params.hue, "enabled").onChange((value) => {
  hueEffect.blendMode.blendFunction = value?BlendFunction.NORMAL:BlendFunction.SKIP
})
hue_Folder.add(params.hue, "hue", 0, 6.3, 0.1).onChange((value) => {
  hueEffect.hue = value
})
hue_Folder.add(params.hue, "saturation", -1, 1).onChange((value) => {
  hueEffect.saturation = value
})
hue_Folder.add(params.hue, "blendMode", blendModes).onChange((value) => {
  hueEffect.blendMode.blendFunction = Number(value)
})
hue_Folder.add(params.hue, "opacity", 0, 1).onChange((value) => {
  hueEffect.blendMode.opacity.value = Number(value)
})
hue_Folder.open()

const brightness_Folder = gui.addFolder("Brightness Contrast")
brightness_Folder.add(params.brightness, "enabled").onChange((value) => {
  brightness.blendMode.blendFunction = value?BlendFunction.NORMAL:BlendFunction.SKIP
})
brightness_Folder.add(params.brightness, "brightness", -1, 1).onChange((value) => {
  brightness.brightness = value
})
brightness_Folder.add(params.brightness, "contrast", -1, 1).onChange((value) => {
  brightness.contrast = value
})
brightness_Folder.add(params.brightness, "blendMode", blendModes).onChange((value) => {
  brightness.blendMode.blendFunction = Number(value)
})
brightness_Folder.add(params.brightness, "opacity", 0, 1).onChange((value) => {
  brightness.blendMode.opacity.value = Number(value)
})
brightness_Folder.open()

const noise_Folder = gui.addFolder("Noise Effect")
noise_Folder.add(params.noise, "enabled").onChange((value) => {
  noiseEffect.blendMode.blendFunction = value?BlendFunction.SCREEN:BlendFunction.SKIP
})
noise_Folder.add(params.noise, "blendMode", blendModes).onChange((value) => {
  noiseEffect.blendMode.blendFunction = Number(value)
})
noise_Folder.add(params.noise, "opacity", 0, 1).onChange((value) => {
  noiseEffect.blendMode.opacity.value = Number(value)
})
noise_Folder.open()

// Animation
const animate = () => {
  requestAnimationFrame(animate);
  composer.render();
};

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // composer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
