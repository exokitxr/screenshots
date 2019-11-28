const screenshot = async (model, options = {}) => {
  const width = typeof options.width === 'number' ? options.width : 1024;
  const height = typeof options.height === 'number' ? options.height : 1024;

  const scene = new THREE.Scene();

  if (options.lights) {
    options.lights.forEach(light => {
      scene.add(light);
    });
  } else {
    const ambientLight = new THREE.AmbientLight(0x808080);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0.5, 1, 0.5);
    scene.add(directionalLight);
  }

  /* const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper); */

  const camera = new THREE.PerspectiveCamera(90, width / height, 100, 2000);
  const dist = 500;
  camera.position.copy(model.boundingBoxMesh.position).add(new THREE.Vector3(0, 0, dist));
  if (options.cameraPosition) {
    camera.position.add(options.cameraPosition);
  }
  //camera.lookAt(model.boundingBoxMesh.getWorldPosition(new THREE.Vector3()));
  // const localAabb = model.boundingBoxMesh.scale.clone().applyQuaternion(model.quaternion);
  const modelHeight = Math.max(model.boundingBoxMesh.scale.x, model.boundingBoxMesh.scale.y, model.boundingBoxMesh.scale.z);
  camera.fov = 2 * Math.atan( modelHeight / ( 2 * dist ) ) * ( 180 / Math.PI );
  camera.updateProjectionMatrix();

  // camera.lookAt(model.boundingBoxMesh.getWorldPosition(new THREE.Vector3()));

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height);

  const oldParent = model.parent;
  const oldPosition = model.position.clone();
  const oldQuaternion = model.quaternion.clone();
  const oldScale = model.scale.clone();
  model.position.set(0, 0, 0);
  model.quaternion.set(0, 0, 0, 1);
  model.scale.set(1, 1, 1);
  model.boundingBoxMesh.visible = false;
  scene.add(model);
  renderer.render(scene, camera);
  if (oldParent) {
    oldParent.add(model);
  } else {
    scene.remove(model);
  }
  model.position.copy(oldPosition);
  model.quaternion.copy(oldQuaternion);
  model.scale.copy(oldScale);
  model.boundingBoxMesh.visible = true;

  const blob = await new Promise((accept, reject) => {
    renderer.domElement.toBlob(accept, 'image/png');
  });
  return blob;
};
export default screenshot;