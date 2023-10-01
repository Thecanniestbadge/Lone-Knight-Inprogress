// Name: Nicholas Vickery
// Date: 7/11/2023
// Project: Lone Knight



// music
function playAudio() {
  document.getElementById("theAudio").play();
}

// Get the knight and potion elements from the DOM
var knight = document.getElementById('knight');
var potion = document.getElementById('potion');

// Initialize frame index, default action, player health, enemy counter, and level
var frameIndex = 0;
var action = 'idle';
var playerHealth = 100;
var level = 1;
var invulnerabilityTimer = 0;
var potionTimer = 0;
var hasPotion = false;
var highScore = 0;

// Initialize the knight's position
knight.style.left = '0px';

// Initialize enemy counter and maximum number of enemies
var enemyCounter = 0;
var maxEnemies = 2;
var attackHasHit = false;
// Initialize boss counter
var bossCounter = 0;

// Add a variable to track the direction of movement
var direction = 1; // 1 for right, -1 for left

// Define the animations and their properties
var actions = {
  idle: { image: 'row1.1.png', frames: 1, speed: 0.25, width: 292.25, height: 321 },
  running: { image: 'row2.png', frames: 4, speed: 0.25, width: 298.25, height: 323 },
  attacking: { image: 'row3.png', frames: 4, speed: 0.1, width: 314.75, height: 319 },
  defending: { image: 'row4.png', frames: 4, speed: 0.25, width: 302, height: 321 },
  flipIdle: { image: 'flippedrow1.1.png', frames: 1, speed: 0.25, width: 292.25, height: 321 },
  flipRunning: { image: 'flippedrow2.png', frames: 4, speed: 0.25, width: 298.25, height: 323 },
  flipAttacking: { image: 'flippedrow3.png', frames: 4, speed: 0.1, width: 314.75, height: 319 },
  flipDefending: { image: 'flippedrow4.png', frames: 4, speed: 0.25, width: 302, height: 321 }
};

// Function to update the high score and store it in local storage
function updateHighScore() {
  highScore = Math.max(highScore, level);
  localStorage.setItem('highScore', highScore);
  document.getElementById('high-score').textContent = highScore; // Update the high score display
}

// This function updates the player's health
function takeDamage(damage) {
  // Subtract the damage from the player's health
  playerHealth -= damage;

  // Make sure the player's health does not go below 0
  playerHealth = Math.max(playerHealth, 0);

  // Update the progress bar
  var progressBar = document.getElementById('bar');
  progressBar.value = playerHealth;

  // If the player's health is 0, game over (reload the page or other game over logic)
  if (playerHealth === 0) {
    updateHighScore(); // Update the high score if the current level is higher
    window.location.reload();
  }
}

// This function updates the player's health when a potion is used
function usePotion() {
  // Only use a potion if the player has one
  if (hasPotion) {
    // Add 50 to the player's health
    playerHealth += 50;

    // Make sure the player's health does not go above 100
    playerHealth = Math.min(playerHealth, 100);

    // Update the progress bar
    var progressBar = document.getElementById('bar');
    progressBar.value = playerHealth;

    // The player no longer has a potion
    hasPotion = false;
  }
}

window.onload = function() {
  // This will set the progress bar to the initial player's health when the page loads
  var progressBar = document.getElementById('bar');
  progressBar.value = playerHealth;

  // Retrieve the high score from local storage if it exists
  var storedHighScore = localStorage.getItem('highScore');
  if (storedHighScore !== null) {
    highScore = parseInt(storedHighScore);
    document.getElementById('high-score').textContent = highScore; // Update the high score display
  }

  // Set the initial level display
  document.getElementById('current-level').textContent = level;
}

// Function to set the animation
function setAnimation() {
  // Set the size of the knight div and the background image
  knight.style.width = `${actions[action].width}px`;
  knight.style.height = `${actions[action].height}px`;
  knight.style.backgroundImage = `url('${actions[action].image}')`;

  // Set the size of the background image for other actions
  knight.style.backgroundSize = `${actions[action].frames * actions[action].width}px ${actions[action].height}px`;
}

// Initial set up of animation
setAnimation();

// Variables for time tracking
var lastTime;

// This function creates a new enemy and adds it to the game
function spawnEnemy() {
  // Don't spawn more than 10 enemies
  if (enemyCounter >= level) {
    return;
  }

  // Create a new div element for the enemy
  var enemy = document.createElement("div");

  // Gives it a class of 'enemy'
  enemy.classList.add('enemy');

  // Create a new div element for the enemy hitbox
  var hitbox = document.createElement("div");

  // Give it a class of 'hitbox'
  hitbox.classList.add('hitbox');

  // Set the width of the enemy
  var enemyWidth = 450;
  enemy.style.width = enemyWidth + 'px';

  // Position the enemy at a random horizontal location within the game area
  // Ensure that the enemy does not spawn too close to the player
  var enemyLeft;
  do {
    enemyLeft = Math.random() * (window.innerWidth - enemyWidth);
  } while (Math.abs(enemyLeft - parseFloat(knight.style.left)) < enemyWidth);
  enemy.style.left = enemyLeft + 'px';
  hitbox.style.left = (enemyLeft - hitbox.offsetWidth / 2) + 'px';

  // Position the enemy and hitbox at the bottom of the game area, like the player
  enemy.style.bottom = '100px';
  hitbox.style.bottom = (parseFloat(enemy.style.bottom) - hitbox.offsetHeight / 2) + 'px';

  // Make the hitbox a child of the enemy
  enemy.appendChild(hitbox);

  // Add the enemy to the body of the document
  document.body.appendChild(enemy);

  // Add a health property to the enemy
  enemy.health = 6;

  // Add a speed property to the enemy
  enemy.speed = 100; // pixels per second

  // Add a direction property to the enemy
  enemy.direction = 1; // 1 for right, -1 for left

  // Increment the enemy counter
  enemyCounter++;
}

// This function creates a new boss and adds it to the game
function spawnBoss() {
  // Only spawn a boss if there are no bosses already
  if (bossCounter > 0) {
    return;
  }

  // Create a new div element for the boss
  var boss = document.createElement("div");

  // Gives it a class of 'boss'
  boss.classList.add('boss');

  // Create a new div element for the boss hitbox
  var hitbox = document.createElement("div");

  // Give it a class of 'hitbox'
  hitbox.classList.add('hitbox');

  // Set the width of the boss
  var bossWidth = 450;
  boss.style.width = bossWidth + 'px';

  // Position the boss at a random horizontal location within the game area
  // Ensure that the boss does not spawn too close to the player
  var bossLeft;
  do {
    bossLeft = Math.random() * (window.innerWidth - bossWidth);
  } while (Math.abs(bossLeft - parseFloat(knight.style.left)) < bossWidth);
  boss.style.left = bossLeft + 'px';
  hitbox.style.left = (bossLeft - hitbox.offsetWidth / 2) + 'px';

  // Position the boss and hitbox at the bottom of the game area, like the player
  boss.style.bottom = '100px';
  hitbox.style.bottom = (parseFloat(boss.style.bottom) - hitbox.offsetHeight / 2) + 'px';

  // Make the hitbox a child of the boss
  boss.appendChild(hitbox);

  // Add the boss to the body of the document
  document.body.appendChild(boss);

  // Add a health property to the boss
  boss.health = 20;

  // Add a speed property to the boss
  boss.speed = 100; // pixels per second

  // Add a direction property to the boss
  boss.direction = 1; // 1 for right, -1 for left

  // Increment the boss counter
  bossCounter++;
}

// Main game loop
function gameLoop(timestamp) {
  // Calculate delta time and update the animation
  if (lastTime) {
    update((timestamp - lastTime) / 1000.0); // send delta time in seconds
  }

  // Save the current time for the next frame
  lastTime = timestamp;

  // Request the next animation frame
  requestAnimationFrame(gameLoop);

  // Check if all enemies or boss are defeated and update the level
  if (enemyCounter === 0 && bossCounter === 0) {
    level++;
    document.getElementById('current-level').textContent = level; // Update the level display
    if (level % 10 === 0) {
      spawnBoss();
    } else {
      for (var i = 0; i < level; i++) {
        spawnEnemy();
      }
    }
    updateHighScore(); // Update the high score and store it in local storage
  }
}

// Function to update the animation
// Delta time = make things frame rate independent
function update(deltaTime) {
  // Calculate the current frame index
  frameIndex += deltaTime / actions[action].speed;
  if (frameIndex >= actions[action].frames) {
      frameIndex = 0;
  }
  if (!action.endsWith('Idle')) {
    // Move the knight if the current action is running
    if (action.toLowerCase().endsWith("running")) {
      var knightLeft = parseFloat(knight.style.left);
      var knightWidth = parseFloat(knight.style.width);

      // Debug logging
      console.log(`knightLeft: ${knightLeft}, knightWidth: ${knightWidth}`);

      // Change direction if the knight has hit an edge
      if (knightLeft + knightWidth > window.innerWidth && direction === 1) {
        direction = -1;
      } else if (knightLeft < 0 && direction === -1) {
        direction = 1;
      }

      // Update the knight's position
      knight.style.left = `${knightLeft + (200 * deltaTime * direction)}px`;

      // Reduce the invulnerability timer by delta time
      invulnerabilityTimer = Math.max(invulnerabilityTimer - deltaTime, 0);

      // Reduce the potion timer by delta time
      potionTimer = Math.max(potionTimer - deltaTime, 0);

      // If the potion timer is 0, spawn a new potion
      if (potionTimer === 0) {
        // Position the potion at a random horizontal location within the game area
        // Ensure that the potion does not spawn too close to the edges
        var potionLeft;
        do {
          potionLeft = Math.random() * (window.innerWidth - potion.offsetWidth - 200) + 100; // Adjusted range
        } while (Math.abs(potionLeft - parseFloat(knight.style.left)) < potion.offsetWidth);
        potion.style.left = potionLeft + 'px';

        // Show the potion
        potion.style.display = 'block';

        // Reset the potion timer to a random value between 5 and 10 seconds
        potionTimer = Math.random() * 5 + 5;
      }

      // Check for a collision between the knight and the potion
      var knightRect = knight.getBoundingClientRect();
      var potionRect = potion.getBoundingClientRect();
      if (knightRect.left < potionRect.right &&
        knightRect.right > potionRect.left &&
        knightRect.top < potionRect.bottom &&
        knightRect.bottom > potionRect.top) {

        // The player has picked up the potion
        hasPotion = true;

        // Hide the potion
        potion.style.display = 'none';
      }
    }
  }

  // Update the background position
  var xPosition = -actions[action].width * Math.floor(frameIndex);
  knight.style.backgroundPosition = `${xPosition}px 0`;

  // Update the position of each enemy
  document.querySelectorAll('.enemy').forEach(function(enemy) {
    // Calculate the direction based on the player's and enemy's positions
    var enemyDirection = parseFloat(knight.style.left) > parseFloat(enemy.style.left) ? 1 : -1;

    // Update the enemy's direction
    enemy.direction = enemyDirection;

    // Update the enemy's sprite based on the direction
    enemy.style.transform = `scaleX(${-enemy.direction})`; // Invert the scale

    // Update the enemy's position
    enemy.style.left = `${parseFloat(enemy.style.left) + (enemy.speed * deltaTime * enemyDirection)}px`;
  });

  // Update the position of each boss
  document.querySelectorAll('.boss').forEach(function(boss) {
    // Calculate the direction based on the player's and boss's positions
    var bossDirection = parseFloat(knight.style.left) > parseFloat(boss.style.left) ? 1 : -1;

    // Update the boss's direction
    boss.direction = bossDirection;

    // Update the boss's sprite based on the direction
    boss.style.transform = `scaleX(${-boss.direction})`; // Invert the scale

    // Update the boss's position
    boss.style.left = `${parseFloat(boss.style.left) + (boss.speed * deltaTime * bossDirection)}px`;
  });

  // function that defines shrinkRect so then the enemies and the player can move around
  function shrinkRect(rect, factor) {
    var width = rect.width * factor;
    var height = rect.height * factor;
    var left = rect.left + (rect.width - width) / 2;
    var top = rect.top + (rect.height - height) / 2;

    return {left: left, top: top, width: width, height: height, right: left + width, bottom: top + height};
  }

// Check for collisions with each enemy
document.querySelectorAll('.enemy').forEach(function(enemy) {
  var knightRect = knight.getBoundingClientRect();
  var enemyRect = enemy.getBoundingClientRect();

  // Shrink the hitboxes for more accurate collisions
  var hitboxRect = shrinkRect(knightRect, 1.2); // Increase the hitbox size
  var enemyHitboxRect = shrinkRect(enemyRect, 0.6); // Decrease the enemy hitbox size

  // Check for a collision between the knight and the enemy
  if (hitboxRect.left < enemyHitboxRect.right &&
    hitboxRect.right > enemyHitboxRect.left &&
    hitboxRect.top < enemyHitboxRect.bottom &&
    hitboxRect.bottom > enemyHitboxRect.top) {

    // If the player is attacking and is on the 3rd or 4th frame, damage the enemy
    if ((action === 'attacking' || action === 'flipAttacking') && (Math.floor(frameIndex) === 3 || Math.floor(frameIndex) === 4) && !attackHasHit) {
      // Decrement the enemy's health
      enemy.health -= 2;
      // Set the flag to prevent the attack from hitting again
      attackHasHit  = true;
    }

    // If the enemy's health is 0 or less, remove the enemy from the game
    if (enemy.health <= 0) {
      // Replace the enemy's image with the explosion image
      // enemy.style.backgroundImage = "url('explosion.gif')";
      // To be added in phase 2
      enemy.parentNode.removeChild(enemy);

      // Decrement the enemy counter
      enemyCounter--;

      // If all enemies are defeated, increase the level and spawn new enemies
      if (enemyCounter === 0) {
        level++;
        highScore = Math.max(highScore, level); // Update the high score if the current level is higher
        document.getElementById('current-level').textContent = level; // Update the level display
        document.getElementById('high-score').textContent = highScore; // Update the high score display
        if (level % 10 === 0) {
          spawnBoss();
        } else {
          for (var i = 0; i < level; i++) {
            spawnEnemy();
          }
        }
      }
    }
    // If the player is defending, knock back the enemy
    else if (action === 'defending' || action === 'flipDefending') {
      // Update the enemy's position to simulate a knockback effect
      enemy.style.left = `${parseFloat(enemy.style.left) + (200 * enemy.direction)}px`;
    }
    // If the player is not attacking and is not invulnerable, they take damage
    else if (invulnerabilityTimer === 0 && !(action === 'attacking' || action === 'flipAttacking')) {
      takeDamage(20);

      // Set the invulnerability timer to 1 second
      invulnerabilityTimer = 1;
    }
  }
});

  // Check for collisions with the boss
document.querySelectorAll('.boss').forEach(function(boss) {
  var knightRect = knight.getBoundingClientRect();
  var bossRect = boss.getBoundingClientRect();

  // Shrink the hitboxes for more accurate collisions
  var hitboxRect = shrinkRect(knightRect, 1.2); // Increase the hitbox size
  var bossHitboxRect = shrinkRect(bossRect, 0.6); // Decrease the boss hitbox size

  // Check for a collision between the knight and the boss
  if (hitboxRect.left < bossHitboxRect.right &&
    hitboxRect.right > bossHitboxRect.left &&
    hitboxRect.top < bossHitboxRect.bottom &&
    hitboxRect.bottom > bossHitboxRect.top) {

    // If the player is attacking and is on the 3rd or 4th frame, damage the boss
    if ((action === 'attacking' || action === 'flipAttacking') && (Math.floor(frameIndex) === 2 || Math.floor(frameIndex) === 3) && !attackHasHit) {
      // Decrement the boss's health
      boss.health -= 2;

      // Set the flag to prevent the attack from hitting again
      attackHasHit = true;
    }
    // If the boss's health is 0, remove the boss from the game
    if (boss.health === 0) {
      boss.parentNode.removeChild(boss);

      attackHasHit = false;
      // Decrement the boss counter
      bossCounter--;

      // If the boss is defeated, increase the level and spawn new enemies
      if (bossCounter === 0) {
        level++;
        highScore = Math.max(highScore, level); // Update the high score if the current level is higher
        document.getElementById('current-level').textContent = level; // Update the level display
        document.getElementById('high-score').textContent = highScore; // Update the high score display
        for (var i = 0; i < level; i++) {
          spawnEnemy();
        }
      }
    }
    // If the player is defending, knock back the boss
    else if (action === 'defending' || action === 'flipDefending') {
      // Update the boss's position to simulate a knockback effect
      boss.style.left = `${parseFloat(boss.style.left) + (200 * boss.direction)}px`;
    }
    // If the player is not attacking and is not invulnerable, they take damage
    else if (invulnerabilityTimer === 0 && !(action === 'attacking' || action === 'flipAttacking')) {
      takeDamage(20);

      // Set the invulnerability timer to 1 second
      invulnerabilityTimer = 1;
    }
  }
});
}

// Event handler for keydown events
document.addEventListener('keydown', function(event) {
  if (event.code === "KeyA") {
    direction = -1; // Update direction
    action = 'flipRunning';
    setAnimation();
  }
  if (event.code === "KeyD") {
    direction = 1; // Update direction
    action = 'running';
    setAnimation();
    playAudio(); // Play the audio when 'D' is pressed
  }
  if (event.code === "KeyW") {
    if (direction === 1) {
      action = 'attacking';
    } else {
      action = 'flipAttacking';
    }
    attackHasHit = false; 
    setAnimation();
  }
  if (event.code === "KeyS") {
    if (direction === 1) {
      action = 'defending';
    } else {
      action = 'flipDefending';
    }
    setAnimation();
  }
  if (event.code === "KeyP") {
    usePotion();
  }
});

// Event handler for keyup events
document.addEventListener('keyup', function(event) {
  if (event.code === "KeyA" || event.code === "KeyD") {
    if (direction === 1) {
      action = 'idle';
    } else {
      action = 'flipIdle';
    }
    setAnimation();
  }
  if (event.code === "KeyW" || event.code === "KeyS") {
    if (direction === 1) {
      action = 'idle';
    } else {
      action = 'flipIdle';
    }
    setAnimation();
  }
});

// Start the game loop
requestAnimationFrame(gameLoop);

// Spawn the initial enemies
for (var i = 0; i < level; i++) {
  spawnEnemy();
}