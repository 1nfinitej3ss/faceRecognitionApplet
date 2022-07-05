//WIP
//by 1nfinitej3ss
//based on (quicklinks):
//api doc: https://justadudewhohacks.github.io/face-api.js/docs/globals.html
//https://editor.p5js.org/joeyklee/sketches
//https://github.com/Lartu/p5.clickable
//LM = landmarks

// For the "please wait" loading graphic
let upldStars = [];
let upldStar_initX, upldStar_initY;
let l;
let upldStar_dx, upldStar_dy;
let maxTail;
let pleaseWait;
let cOffset = 0;

// For face recgonition
let detectionsReady;
let points;

// Image Option
let vpHarris;
let faceapiH;
let imgH;
let detectionsH;

// Image Option
let faceapi;
let img;
let detections;
let pBiden;

// For grid
let grid;

// For line between two LMs
let mousePressX, mousePressY;
let mouseClick;
let mcX = [],
  mcY = []; // mouseClick1 position (x,y)
let mouseActive;
let positionA; // Save index of last mouse click position
let positionB;
let drawLineCheck;

// By default all options are set to true, but we are just detecting landmarks with this application. I think it speeds things up to bypass unused data.
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  withExpressions: false,
};

// Preload happens once, before setup. 
function preload() {
  img = loadImage("womanHappy.jpg");
  imgH = loadImage("womanSad.jpg");
}

// Setup happens once, before draw.
function setup() {
  createCanvas(400, 555);
  colorMode(HSB);
  // Need to find HSB color codes?  Try workwithcolor.com/color-converter-01.htm

  vpHarris = false;
  pBiden = false;

  // Welcome message, load once at program start.
  fill(0);
  textAlign(CENTER);
  textSize(20);
  text("Select Button to Begin", width / 2, height / 2);

  //For "please wait" loader
  setupLoader();
  pleaseWait = false;

  //For grid
  grid = false;

  // For mouse check
  mouseCheck = false;
  mouseClick = false; // Did we click the mouse?
  mouseActive = false;
  drawLineCheck = false;

  //Resize images according to canvas size
  img.resize(width, height);
  imgH.resize(width, height);

  //for Harris button
  myButton = new Clickable(); //Create button
  myButton.color = "white";
  myButton.locate(20, 20); //Position Button
  myButton.text = "Sad"; //Text of the clickable (string)

  //harris onpress
  myButton.onPress = function() { //When myButton is pressed
    this.color = "red"; //Change button color
    myButtonB.color = "white"; //Change button color
    //alert("Yay!"); //Show an alert message
    vpHarris = true;
    pBiden = false;
  }

  //harris onrelease
  myButton.onRelease = function() { //When myButton is released
    //image(imgH, 0, 0);
    faceapiH = ml5.faceApi(detectionOptions, harrisReady);
    detectionsReady = false;
    pleaseWait = true;

    //alert("Yay!"); //Show an alert message
  }

  //for Biden button
  myButtonB = new Clickable(); //Create button
  myButtonB.color = "white";
  myButtonB.locate(130, 20); //Position Button
  myButtonB.text = "Happy"; //Text of the clickable (string)
  myButtonB.onPress = function() { //When myButton is pressed
    this.color = "red"; //Change button color
    myButton.color = "white"; //Change button color
    //alert("Yay!"); //Show an alert message
    vpHarris = false;
    pBiden = true;
  }

  //onrelease
  myButtonB.onRelease = function() { //When myButton is released
    //image(img, 0, 0);
    faceapi = ml5.faceApi(detectionOptions, modelReady);
    detectionsReady = false;
    //alert("Yay!"); //Show an alert message
    pleaseWait = true;
  }

  //for Grid button
  myButtonG = new Clickable(); //Create button
  myButtonG.color = "white";
  myButtonG.locate(240, 20); //Position Button
  myButtonG.text = "Grid"; //Text of the clickable (string)
  myButtonG.onPress = function() { //When myButton is pressed
    if (grid) {
      grid = false;
    } else {
      grid = true;
    }
    //alert("Yay!"); //Show an alert message (system/browser alert)
  }
}

function draw() {

  if (vpHarris) {
    image(imgH, 0, 0);
  } else if (pBiden) {
    image(img, 0, 0);
  }
  if (detectionsReady) {
    //see who is true to load right image
    drawDetections();
    mouseCheck = true;
  }

  if (grid) {
    drawGrid();
  }

  if (pleaseWait) {
    drawLoader();
  }

  // Draw buttons last so they are on top of all canvas elements
  myButton.draw();
  myButtonB.draw();
  myButtonG.draw();

  // We don't start checking the mouse position until there are available LMs
  if (mouseCheck) {
    mousePosCheck(mouseX, mouseY);
  }

  if (mouseActive) {
    stroke("red");
    strokeWeight(15);
    positionA = int(mcX.length - 1); // 
    point(mcX[positionA], mcY[positionA]);
    strokeWeight(5);
    line(mcX[positionA], mcY[positionA], mouseX, mouseY);

  }

  if (drawLineCheck) {
    drawLine();
  }

}



function mousePosCheck(mpX, mpY) {

  // Scrub LM array, check for mouse position proximity to LMs
  for (let i = 0; i < points.length; i++) {
    // Find distance between mouse position and LMs
    let d = int(dist(mpX, mpY, points[i]._x, points[i]._y));
    if (d < 5) {
      //print(d);

      //draw point when hover
      stroke("red");
      strokeWeight(15);
      point(points[i]._x, points[i]._y);

    }
  }

}

function mouseClicked() {

  if (mouseCheck) {
    // Scrub LM array, check for mouse position proximity to LMs
    for (let i = 0; i < points.length; i++) {
      // Find distance between mouse position and LMs
      let d = int(dist(mouseX, mouseY, points[i]._x, points[i]._y));
      if (d < 5) {
        if (!mouseActive && !drawLineCheck) {
          append(mcX, int(points[i]._x));
          append(mcY, int(points[i]._y));
          mouseActive = true;
        } else if (mouseActive) {
          append(mcX, int(points[i]._x));
          append(mcY, int(points[i]._y));
          drawLineCheck = true;
        } else if (drawLineCheck && !mouseActive) {
          append(mcX, int(points[i]._x));
          append(mcY, int(points[i]._y));
          drawLineCheck = false;
          mouseActive = true;
        }
      }
    }


  }
}

function drawLine() {

  stroke("red");
  strokeWeight(15);

  positionA = int(mcX.length - 2);
  //print("posA: " + positionA + "x: " + mcX[positionA] + "y: " + mcX[positionA]);
  point(mcX[positionA], mcY[positionA]);

  positionB = int(mcX.length - 1);
  //print("posB: " + positionB + "x: " + mcX[positionB] + "y: " + mcX[positionB]);
  point(mcX[positionB], mcY[positionB]);

  strokeWeight(5);
  line(mcX[positionA], mcY[positionA], mcX[positionB], mcY[positionB]);

  //draw distance of line along line
  let x1 = mcX[positionA];
  let y1 = mcY[positionA];
  let x2 = mcX[positionB];
  let y2 = mcY[positionB];
  let d = dist(x1,y1,x2,y2);
  

  //find angle of the line

  //label along line
  //fill(255);
  noStroke();  
  //rect(width/2, 300, 100, 20)
  textAlign(CENTER);
  textSize(25);
  fill(0);
  text("Line Length: " + round(d/20), width/2, 200);  

  mouseActive = false;
}

function modelReady() {
  //console.log("ready!");
  //console.log(faceapi);
  faceapi.detectSingle(img, gotResults);
}


function harrisReady() {
  //console.log("ready!");
  //console.log(faceapi);
  faceapiH.detectSingle(imgH, gotResults);
}

function gotResults(err, result, image) {
  if (err) {
    //console.log(err);
    return;
  }
  // console.log(result)
  detections = result;

  // background(220);
  //image(imgH, 0, 0, width, height);

  if (detections) {
    // console.log(detections)
    detectionsReady = true;
  }
}

function drawDetections() {
  drawBox(detections);
  drawLandmarks(detections);
}

//bounding box - works for whole (face) model only, see custom bounding box method below for segmenting body parts
function drawBox(detections) {
  const alignedRect = detections.alignedRect;
  const {
    _x,
    _y,
    _width,
    _height
  } = alignedRect._box;
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);
  rect(_x, _y, _width, _height);
}

function drawLandmarks(detections) {

  //we can draw specific landmarks according to facial features:
  const mouth = detections.parts.mouth;
  const nose = detections.parts.nose;
  const leftEye = detections.parts.leftEye;
  const rightEye = detections.parts.rightEye;
  const rightEyeBrow = detections.parts.rightEyeBrow;
  const leftEyeBrow = detections.parts.leftEyeBrow;

  //drawbox() will create a bounding box around a facial feature according to the outermost LMs 
  drawBox(mouth);

  //drawPointNum() will label each LM according to its index in the LM array
  //drawPointNum(rightEye);

  //draw all points on all available LM positions
  points = detections.landmarks.positions;
  for (let i = 0; i < points.length; i++) {
    //array index
    // textSize(7);
    // let num = str(i);
    // text(num, points[i]._x, points[i]._y);

    //draw points
    stroke("purple");
    strokeWeight(5);
    point(points[i]._x, points[i]._y);
  }

  // After all points are drawn we don't have to wait anymore
  pleaseWait = false;

}

function drawPointNum(feature) {

  for (let i = 0; i < feature.length; i++) {
    const x = feature[i]._x
    const y = feature[i]._y
    stroke('purple'); // Change the color
    //strokeWeight(10);
    textSize(20);
    let num = str(i);
    text(num, feature[i]._x, feature[i]._y);
    //point(x, y);
  }

}

function drawBox(feature) {

  let coordX = [];
  let coordY = [];

  let x1;
  let y1;

  // The FaceAPI feature class provides an array of "Landmarks" along/around the facial feature selected. With this FOR loop we create two new arrays, one to index X values of the LMs, and one to index the Y values. We store the values separately so we can find the outermost points when we draw a rectangle below. I think a 2-Dimensional array could do the same thing in a more elegant way, but alas, I am a public school teacher and therefore split my time between the many demands on my job. When my job is to develop interactive educational apps fulltime, I will improve my knowledge of data structures so my code can be both functional and elegant. -1nfinitej3ss [12:21pm, 12/2020]

  for (let i = 0; i < feature.length; i++) {
    x1 = feature[i]._x;
    y1 = feature[i]._y;

    coordX[i] = x1;
    coordY[i] = y1;
  }

  // Draw a rectangle (via four lines) according to the outermost landmarks of the facial feature

  // Top line
  strokeWeight(5);
  stroke("red");
  line(min(coordX), min(coordY), max(coordX), min(coordY));

  // Bottom line
  line(min(coordX), max(coordY), max(coordX), max(coordY));

  // Left line
  line(min(coordX), min(coordY), min(coordX), max(coordY));

  // Right line
  line(max(coordX), min(coordY), max(coordX), max(coordY));
}

function drawGrid() {

  c = color('hsba(0, 0%, 100%, 0.5)'); //define color w/alpha
  stroke(c); //hsb white

  //draw horizontal lines along X axis
  //bold line
  strokeWeight(5);
  line(width / 2, 100, width / 2, height);
  //all lines
  for (let i = 100; i < height; i += 20) {
    strokeWeight(1);
    line(width, i, 20, i);
  }

  //draw vertical lines along Y axis
  //bold line  
  strokeWeight(5);
  line(0, (height / 2) + 45, width, (height / 2) + 45);
  //all lines
  for (let i = 0; i < width; i += 20) {
    if (i > 10) {
      strokeWeight(1);
      line(i, 100, i, height);
    }
  }

  stroke(0, 0, 100); //hsb white

  //draw labels along X axis
  let numX = -10;
  for (let i = 0; i < width + 20; i += 20) {
    textSize(12);
    textStyle(BOLD);
    numX += 10;
    text((numX / 10), i + 20, 90);
  }

  //draw labels along Y axis
  let numY = -10;
  for (let i = 100; i < height; i += 20) {
    textSize(12);
    textStyle(BOLD);
    numY += 10;
    text((numY / 10), 10, i + 5);
  }

}

function setupLoader() {
  l = 100;

  upldStars.push({
    x: 0,
    y: -l
  });

  upldStar_initX = 0;
  upldStar_initY = -l;
  upldStar_dx = 0;
  upldStar_dy = 0;
  theta = 0;
  maxTail = 30;

  frameRate(24);
  angleMode(DEGREES);


}

function drawLoader() {

  //dark overlay
  c = color('hsba(0, 0%, 0%, 0.5)'); //define color w/alpha
  fill(c); //hsb black
  rect(0, 0, width, height);

  let diag = 2 * l * sin(theta / 2);
  let ang = (180 - theta) / 2;

  upldStar_dx = diag * sin(ang);
  upldStar_dy = diag * cos(ang);

  if (upldStars.length > 2) {
    for (let i = upldStars.length - 2; i > 0; i--) {
      upldStars[i].x = upldStars[i - 1].x;
      upldStars[i].y = upldStars[i - 1].y;
    }
  }
  upldStars[0].x = upldStar_initX + upldStar_dx;
  upldStars[0].y = upldStar_initY + upldStar_dy;

  push();
  translate(width / 2, height / 2);

  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("Please wait...", 0, 0);

  noStroke();
  // fill(255,255,0,200);

  for (let i = 0; i < upldStars.length; i++) {
    //yellow fill
    fill(255, 255, 0, map(i, 0, maxTail - 1, 200, 10));
    //rainbow fill
    fill(abs(i + cOffset) % 360, 100, 100);
    ellipse(upldStars[i].x, upldStars[i].y, map(i, 0, maxTail - 1, 20, 10));
    i += 2;
  }

  pop();

  if (upldStars.length < maxTail) upldStars.push({
    x: upldStars[upldStars.length - 1].x,
    y: upldStars[upldStars.length - 1].y
  });

  theta += 3;
  cOffset -= 5;

}

function recycleBin() {

  //distance between points on mouth
  //   const mouth = detections.parts.mouth;
  //   stroke(5);
  //   line(mouth[3]._x, mouth[3]._y, mouth[9]._x, mouth[9]._y);

  //   let d = int(dist(mouth_x, mouth_y, mouth2_x, mouth2_y));
  //   print(d);

}