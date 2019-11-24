var Container2D = function(name, centerXPercent, centerYPercent, widthPercent, heightPercent){
  this.isContainer = true;
  this.name = name;
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.widthPercent = widthPercent;
  this.heightPercent = heightPercent;
  this.scaleWidth = 1;
  this.scaleHeight = 1;
  this.paddingXContainerSpace = 0;
  this.paddingYContainerSpace = 0;
  this.handleRectangle();
  if (!isDeployment){
    this.rectangle.mesh.material.uniforms.color.value.set("lime");
  }
}

Container2D.prototype.makeEmpty = function(){
  if (this.sprite){
    this.removeSprite();
  }
  if (this.addedText){
    this.removeAddedText();
  }
}

// paddingY -> [0, 100[
Container2D.prototype.setPaddingY = function(paddingY){
  this.paddingYContainerSpace = paddingY;
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

// paddingX -> [0, 100[
Container2D.prototype.setPaddingX = function(paddingX){
  this.paddingXContainerSpace = paddingX;
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.makeSquare = function(){
  var actualWidth = renderer.getCurrentViewport().z * this.widthPercent / 100;
  var actualHeight = renderer.getCurrentViewport().w * this.heightPercent / 100;
  if (actualWidth > actualHeight){
    var newWidthPercent = this.heightPercent * renderer.getCurrentViewport().w / renderer.getCurrentViewport().z;
    this.scaleWidth = newWidthPercent / this.widthPercent;
    this.scaleHeight = 1;
  }else if (actualHeight > actualWidth){
    var newHeightPercent = this.widthPercent * renderer.getCurrentViewport().z / renderer.getCurrentViewport().w;
    this.scaleHeight = newHeightPercent / this.heightPercent;
    this.scaleWidth = 1;
  }
  if (!isDeployment){
    if (guiHandler.datGuiContainerManipulation){
      guiHandler.containerManipulationParameters["Width"] = this.widthPercent * this.scaleWidth;
      guiHandler.containerManipulationParameters["Height"] = this.heightPercent * this.scaleHeight;
    }
  }
  this.handleRectangle();
}

Container2D.prototype.handleResize = function(){
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
}

Container2D.prototype.export = function(){
  var exportObj = {
    centerXPercent: this.centerXPercent,
    centerYPercent: this.centerYPercent,
    widthPercent: this.widthPercent,
    heightPercent: this.heightPercent,
    isSquare: !!this.isSquare,
    paddingXContainerSpace: this.paddingXContainerSpace,
    paddingYContainerSpace: this.paddingYContainerSpace
  };
  if (this.sprite){
    exportObj.spriteName = this.sprite.name
  }
  if (this.addedText){
    exportObj.addedTextName = this.addedText.name;
  }
  return exportObj;
}

Container2D.prototype.makeInvisible = function(){
  scene.remove(this.rectangle.mesh);
}

Container2D.prototype.makeVisible = function(){
  scene.add(this.rectangle.mesh);
}

Container2D.prototype.destroy = function(){
  scene.remove(this.rectangle.mesh);
  this.rectangle.material.dispose();
  this.rectangle.geometry.dispose();
  if (this.sprite){
    this.removeSprite();
  }
  if (this.addedText){
    this.removeAddedText();
  }
  delete containers[this.name];
}

Container2D.prototype.setCenter = function(centerXPercent, centerYPercent){
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.handleRectangle();
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.setWidth = function(widthPercent){
  this.widthPercent = widthPercent;
  this.handleRectangle();
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.setHeight = function(heightPercent){
  this.heightPercent = heightPercent;
  this.handleRectangle();
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.handleRectangle = function(){
  if (!this.rectangle){
    this.rectangle = new Rectangle();
  }

  var centerXWebGL = ((this.centerXPercent * 2) / 100) -1;
  var centerYWebGL = ((this.centerYPercent * 2) / 100) -1;
  var widthWebGL = ((this.widthPercent * this.scaleWidth * 2) / 100);
  var heightWebGL = ((this.heightPercent * this.scaleHeight * 2) / 100);

  var x = centerXWebGL - (widthWebGL / 2);
  var x2 = centerXWebGL + (widthWebGL / 2);
  var y = centerYWebGL + (heightWebGL / 2);
  var y2 = centerYWebGL - (heightWebGL / 2);
  this.rectangle.set(x, y, x2, y2, widthWebGL, heightWebGL);
  this.rectangle.updateMesh(0.005);
}

Container2D.prototype.removeSprite = function(){
  delete this.sprite.containerParent;
  delete this.sprite;
}

Container2D.prototype.removeAddedText = function(){
  delete this.addedText.containerParent;
  delete this.addedText;
}

Container2D.prototype.insertAddedText = function(addedText){
  if (!addedText.is2D){
    return;
  }
  var paddingX = (((this.paddingXContainerSpace) * ((this.widthPercent / 2))) / (100));
  var paddingY = (((this.paddingYContainerSpace) * ((this.heightPercent / 2))) / (100));
  addedText.maxWidthPercent = this.widthPercent - (2 * paddingX);
  addedText.maxHeightPercent = this.heightPercent - (2 * paddingY);
  addedText.handleResize();
  var selectedCoordXPercent, selectedCoordYPercent;
  if (addedText.marginMode == MARGIN_MODE_2D_CENTER){
    selectedCoordXPercent = 100 - this.centerXPercent;
    selectedCoordYPercent = 100 - this.centerYPercent;
  }else if (addedText.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = this.centerYPercent - (this.heightPercent / 2) + addedText.getHeightPercent() + paddingY;
  }
  addedText.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  addedText.containerParent = this;
  this.addedText = addedText;
}

Container2D.prototype.insertSprite = function(sprite){
  var paddingX = (((this.paddingXContainerSpace) * ((this.widthPercent / 2))) / (100));
  var paddingY = (((this.paddingYContainerSpace) * ((this.heightPercent / 2))) / (100));
  sprite.setRotation(0);
  var maxWidth = this.widthPercent - (2 * paddingX);
  var maxHeight = this.heightPercent - (2 * paddingY);
  var sourceWidth = sprite.originalWidth * sprite.originalWidthReference / renderer.getCurrentViewport().z;
  var sourceHeight = sprite.originalHeight * sprite.originalHeightReference / renderer.getCurrentViewport().w;
  sourceWidth *= screenResolution / sprite.originalScreenResolution;
  sourceHeight *= screenResolution / sprite.originalScreenResolution;
  var scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  if (scale > 1){
    scale = 1;
  }
  sprite.setWidthPercent(sourceWidth * scale);
  sprite.setHeightPercent(sourceHeight * scale);
  var selectedCoordXPercent, selectedCoordYPercent;
  if (sprite.marginMode == MARGIN_MODE_2D_CENTER){
    selectedCoordXPercent = 100 - this.centerXPercent;
    selectedCoordYPercent = 100 - this.centerYPercent;
  }else if (sprite.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }
  sprite.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  sprite.containerParent = this;
  this.sprite = sprite;
}
