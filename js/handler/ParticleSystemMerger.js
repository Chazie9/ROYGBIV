var ParticleSystemMerger = function(psObj, name){
  this.name = name;
  this.psObj = psObj;
  this.geometry = new THREE.BufferGeometry();

  var texturesObj = new Object();
  var textureCount = 0;
  var textureMergerHash = "";
  var len = 0;
  for (var psName in psObj){
    var ps = psObj[psName];
    len += ps.particles.length;
    for (var textureName in ps.texturesObj){
      if (!texturesObj[textureName]){
        textureMergerHash += textureName + "|";
      }
      texturesObj[textureName] = textures[textureName];
      textureCount ++;
    }
  }

  if (textureCount > 0 && !(mergedTextureCache[textureMergerHash])){
    var textureMerger = new TextureMerger(texturesObj);
    this.textureMerger = textureMerger;
    mergedTextureCache[textureMergerHash] = textureMerger;
  }else if (textureCount > 0 && mergedTextureCache[textureMergerHash]){
    this.textureMerger = mergedTextureCache[textureMergerHash];
  }

  var mvMatrixArray = [];

  this.mergedIndices = new Float32Array(len);
  this.positions = new Float32Array(len * 3);
  this.rgbThresholds = new Float32Array(len * 3);
  this.velocities = new Float32Array(len * 3);
  this.accelerations = new Float32Array(len * 3);
  this.flags1 = new Float32Array(len * 4);
  this.flags3 = new Float32Array(len * 4);
  this.flags4 = new Float32Array(len * 4);
  this.targetColors = new Float32Array(len * 4);
  this.angularQuaternions = new Float32Array(len * 4);
  this.uvCoordinates = new Float32Array(len * 4);
  this.expiredFlags = new Float32Array(len);
  this.flags2 = new Float32Array(len * 4);

  var offset1 = 0;
  var offset2 = 0;
  var offset3 = 0;
  var ctr = 0;
  var index = 0;
  var uvCounter = 0;
  for (var psName in psObj){
    var ps = psObj[psName];
    mvMatrixArray.push(ps.mesh.modelViewMatrix);
    previewScene.remove(ps.mesh);
    this.positions.set(ps.positions, offset1);
    this.rgbThresholds.set(ps.rgbThresholds, offset1);
    this.velocities.set(ps.velocities, offset1);
    this.accelerations.set(ps.accelerations, offset1);
    this.flags1.set(ps.flags1, offset2);
    this.flags3.set(ps.flags3, offset2);
    this.flags4.set(ps.flags4, offset2);
    this.targetColors.set(ps.targetColors, offset2);
    this.angularQuaternions.set(ps.angularQuaternions, offset2);
    this.expiredFlags.set(ps.expiredFlags, offset3);
    this.flags2.set(ps.flags2, offset2);
    for (var i = 0; i<ps.particles.length; i++){
      var particle = ps.particles[i];
      this.mergedIndices[ctr] = index;
      ctr ++;
      if (particle.material.texture){
        var range = this.textureMerger.ranges[particle.material.texture];
        this.uvCoordinates[uvCounter++] = range.startU;
        this.uvCoordinates[uvCounter++] = range.startV;
        this.uvCoordinates[uvCounter++] = range.endU;
        this.uvCoordinates[uvCounter++] = range.endV;
      }else{
        this.uvCoordinates[uvCounter++] = -10;
        this.uvCoordinates[uvCounter++] = -10;
        this.uvCoordinates[uvCounter++] = -10;
      }
    }
    ps.mergedIndex = index;
    index ++;
    offset1 += ps.positions.length;
    offset2 += ps.flags2.length;
    offset3 += ps.expiredFlags.length;
    delete particleSystems[psName];
    mergedParticleSystems[this.name] = this;
  }


  var texture;
  if (this.textureMerger){
    texture = this.textureMerger.mergedTexture;
  }else{
    texture = new THREE.Texture();
  }

  this.mergedIndicesBufferAttribute = new THREE.BufferAttribute(this.mergedIndices, 1);
  this.positionBufferAttribute = new THREE.BufferAttribute(this.positions, 3);
  this.rgbThresholdBufferAttribute = new THREE.BufferAttribute(this.rgbThresholds, 3);
  this.expiredFlagBufferAttribute = new THREE.BufferAttribute(this.expiredFlags, 1);
  this.velocityBufferAttribute = new THREE.BufferAttribute(this.velocities, 3);
  this.accelerationBufferAttribute = new THREE.BufferAttribute(this.accelerations, 3);
  this.targetColorBufferAttribute = new THREE.BufferAttribute(this.targetColors, 4);
  this.flags1BufferAttribute = new THREE.BufferAttribute(this.flags1, 4);
  this.flags2BufferAttribute = new THREE.BufferAttribute(this.flags2, 4);
  this.flags3BufferAttribute = new THREE.BufferAttribute(this.flags3, 4);
  this.flags4BufferAttribute = new THREE.BufferAttribute(this.flags4, 4);
  this.angularQuaternionsBufferAttribute = new THREE.BufferAttribute(this.angularQuaternions, 4);
  this.uvCoordinatesBufferAttribute = new THREE.BufferAttribute(this.uvCoordinates, 4);

  this.mergedIndicesBufferAttribute.setDynamic(false);
  this.positionBufferAttribute.setDynamic(false);
  this.rgbThresholdBufferAttribute.setDynamic(false);
  this.expiredFlagBufferAttribute.setDynamic(true);
  this.velocityBufferAttribute.setDynamic(false);
  this.accelerationBufferAttribute.setDynamic(false);
  this.targetColorBufferAttribute.setDynamic(false);
  this.flags1BufferAttribute.setDynamic(false);
  this.flags2BufferAttribute.setDynamic(true);
  this.flags3BufferAttribute.setDynamic(false);
  this.flags4BufferAttribute.setDynamic(false);
  this.angularQuaternionsBufferAttribute.setDynamic(false);
  this.uvCoordinatesBufferAttribute.setDynamic(false);

  this.geometry.addAttribute('mergedIndex', this.mergedIndicesBufferAttribute);
  this.geometry.addAttribute('position', this.positionBufferAttribute);
  this.geometry.addAttribute('rgbThreshold', this.rgbThresholdBufferAttribute);
  this.geometry.addAttribute('expiredFlag', this.expiredFlagBufferAttribute);
  this.geometry.addAttribute('velocity', this.velocityBufferAttribute);
  this.geometry.addAttribute('acceleration', this.accelerationBufferAttribute);
  this.geometry.addAttribute('targetColor', this.targetColorBufferAttribute);
  this.geometry.addAttribute('flags1', this.flags1BufferAttribute);
  this.geometry.addAttribute('flags2', this.flags2BufferAttribute);
  this.geometry.addAttribute('flags3', this.flags3BufferAttribute);
  this.geometry.addAttribute('flags4', this.flags4BufferAttribute);
  this.geometry.addAttribute('angularQuaternion', this.angularQuaternionsBufferAttribute);
  this.geometry.addAttribute('uvCoordinates', this.uvCoordinatesBufferAttribute);
  this.geometry.setDrawRange(0, len);

  this.material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.particleVertexShader,
    fragmentShader: ShaderContent.particleFragmentShader,
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms:{
      mergedFlag: new THREE.Uniform(20.0),
      modelViewMatrixArray: new THREE.Uniform(mvMatrixArray),
      projectionMatrix: new THREE.Uniform(new THREE.Matrix4()),
      viewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      time: new THREE.Uniform(0.0),
      texture: new THREE.Uniform(texture),
      dissapearCoef: new THREE.Uniform(0.0),
      stopInfo: new THREE.Uniform(new THREE.Vector3(-10, -10, -10)),
      parentMotionMatrix: new THREE.Uniform(new THREE.Matrix3().fromArray([
        0, 0, 0, 0, 0, 0, 0, 0, 0
      ]))
    }
  });
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.frustumCulled = false;
  previewScene.add(this.mesh);
}

ParticleSystemMerger.prototype.update = function(){
  this.material.uniforms.time.value += (1/60);
  this.material.uniforms.viewMatrix.value = camera.matrixWorldInverse;
  this.material.uniforms.projectionMatrix.value = camera.projectionMatrix;
  for (var psName in this.psObj){
    var ps = this.psObj[psName];
    ps.mesh.updateMatrixWorld(true);
    ps.mesh.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, ps.mesh.matrixWorld);
    this.material.uniforms.modelViewMatrixArray[ps.mergedIndex] = ps.mesh.modelViewMatrix;
  }
}
