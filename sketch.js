// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleSize = 100;
let isDragging = false; // Track if the circle is being dragged
let trajectory = []; // Store the trajectory points

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Initialize the circle in the center of the canvas
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // Draw the trajectory
  if (trajectory.length > 1) {
    stroke(255, 0, 0); // Red color for the trajectory
    strokeWeight(2);
    noFill();
    beginShape();
    for (let point of trajectory) {
      vertex(point.x, point.y);
    }
    endShape();
  }

  // Draw the circle
  fill(200, 200, 200, 150); // Semi-transparent gray
  noStroke();
  circle(circleX, circleY, circleSize);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    let isPinching = false; // Track if any hand is pinching the circle

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Get keypoints for index finger (8) and thumb (4)
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // Check if both fingers are touching the circle's edge
        let indexDist = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let thumbDist = dist(thumb.x, thumb.y, circleX, circleY);

        if (indexDist <= circleSize / 2 && thumbDist <= circleSize / 2) {
          // Move the circle to the midpoint between the two fingers
          circleX = (indexFinger.x + thumb.x) / 2;
          circleY = (indexFinger.y + thumb.y) / 2;

          // Add the current position to the trajectory
          trajectory.push({ x: circleX, y: circleY });

          isPinching = true; // Set pinching state to true
        }

        // Draw keypoint circles
        fill(hand.handedness === "Left" ? [255, 0, 255] : [255, 255, 0]); // Color based on hand
        noStroke();
        circle(indexFinger.x, indexFinger.y, 16); // Index finger
        circle(thumb.x, thumb.y, 16); // Thumb
      }
    }

    // Update dragging state
    isDragging = isPinching;
  }

  // Clear the trajectory if the fingers are no longer pinching
  if (!isDragging) {
    trajectory = [];
  }
}
