import * as THREE from "three";

const width = 960;
const height = 540;

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setClearColor(0xcccccc); // 背景は薄いグレー
  return renderer;
}

function createScene() {
  return new THREE.Scene();
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, +1000);
  return camera;
}

function createBoxWithEdges() {
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 赤
    new THREE.MeshBasicMaterial({ color: 0xffa500 }), // オレンジ
    new THREE.MeshBasicMaterial({ color: 0xffffff }), // 白
    new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 黄
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // 緑
    new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 青
  ];

  const geometry = new THREE.BoxGeometry(400, 400, 400);
  const box = new THREE.Mesh(geometry, materials);

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // 黒色のライン
  const lineSegments = new THREE.LineSegments(edges, lineMaterial);
  box.add(lineSegments);

  return box;
}

function createLabelMesh(text, width, height, fontSize) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.font = `${fontSize}px Arial`;
  context.fillStyle = "black";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const geometry = new THREE.PlaneGeometry(width, height);
  return new THREE.Mesh(geometry, material);
}

function addFaceLabels(box) {
  const faceLabels = ["1", "2", "3", "4", "5", "6"];
  const facePositions = [
    new THREE.Vector3(0, 0, 200), // 前面
    new THREE.Vector3(0, 0, -200), // 背面
    new THREE.Vector3(0, 200, 0), // 上面
    new THREE.Vector3(0, -200, 0), // 下面
    new THREE.Vector3(200, 0, 0), // 右面
    new THREE.Vector3(-200, 0, 0), // 左面
  ];
  const faceRotations = [
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(0, Math.PI, 0),
    new THREE.Euler(-Math.PI / 2, 0, 0),
    new THREE.Euler(Math.PI / 2, 0, 0),
    new THREE.Euler(0, Math.PI / 2, 0),
    new THREE.Euler(0, -Math.PI / 2, 0),
  ];
  const offset = 10; // ラベルがめり込まないように若干浮かせる

  faceLabels.forEach((label, i) => {
    const labelMesh = createLabelMesh(label, 400, 200, 100);
    labelMesh.position.copy(facePositions[i]);
    labelMesh.rotation.copy(faceRotations[i]);
    if (i === 0) labelMesh.position.z += offset;
    if (i === 1) labelMesh.position.z -= offset;
    if (i === 2) labelMesh.position.y += offset;
    if (i === 3) labelMesh.position.y -= offset;
    if (i === 4) labelMesh.position.x += offset;
    if (i === 5) labelMesh.position.x -= offset;
    box.add(labelMesh);
  });
}

function setupMouseControls(box) {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  document.addEventListener("mousedown", () => (isDragging = true));
  document.addEventListener("mouseup", () => (isDragging = false));
  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y,
      };
      const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(toRadians(deltaMove.y), toRadians(deltaMove.x), 0, "XYZ")
      );
      box.quaternion.multiplyQuaternions(deltaRotationQuaternion, box.quaternion);
    }

    previousMousePosition = { x: event.offsetX, y: event.offsetY };
  });
}

const toRadians = (angle) => angle * (Math.PI / 180);

function animate(renderer, scene, camera) {
  const animateScene = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(animateScene);
  };
  animateScene();
}

// メイン処理
const renderer = createRenderer();
const scene = createScene();
const camera = createCamera();
const box = createBoxWithEdges();

scene.add(box);
addFaceLabels(box);
setupMouseControls(box);

animate(renderer, scene, camera);
