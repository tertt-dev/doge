import Phaser from 'phaser';

let player;
let cursors;
let weapons;
let currentWeapon = null;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: { default: 'arcade' }
};

function preload() {
  this.load.image('player', 'assets/characters/player.png');
  this.load.image('pistol', 'assets/weapons/pistol.png');
  this.load.image('shotgun', 'assets/weapons/shotgun.png');
  this.load.tilemapTiledJSON('map', 'assets/maps/level1.json');
  this.load.image('walls_tileset', 'assets/tiles/walls.png');
}

function create() {
  // 1. Загрузка карты
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('walls_tileset', 'walls_tileset');
  const walls = map.createLayer('Walls', tileset, 0, 0);
  walls.setCollisionByExclusion([-1]);

  // 2. Спавн игрока
  const spawnPoint = map.findObject('Spawn', obj => obj.name === 'player_spawn');
  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');
  player.setCollideWorldBounds(true);

  // 3. Оружие на карте
  weapons = this.physics.add.staticGroup();
  map.getObjectLayer('Weapons').objects.forEach(obj => {
    weapons.create(obj.x, obj.y, obj.type); // 'pistol' или 'shotgun'
  });

  // 4. Коллизии
  this.physics.add.collider(player, walls);
  
  // 5. Управление
  cursors = this.input.keyboard.createCursorKeys();
  
  // 6. Подбор оружия
  this.physics.add.overlap(player, weapons, (player, weapon) => {
    weapon.destroy();
    currentWeapon = weapon.texture.key; // 'pistol' или 'shotgun'
    console.log('Подобрано:', currentWeapon);
  });
}

function update() {
  // Движение
  player.setVelocity(0);
  if (cursors.left.isDown) player.setVelocityX(-300);
  if (cursors.right.isDown) player.setVelocityX(300);
  if (cursors.up.isDown) player.setVelocityY(-300);
  if (cursors.down.isDown) player.setVelocityY(300);
  
  // Стрельба (SPACE)
  if (cursors.space.isDown && currentWeapon) {
    const bullet = this.add.circle(player.x, player.y, 5, 0xFF0000);
    this.physics.world.enable(bullet);
    bullet.body.setVelocity(500, 0); // стрельба вправо
    setTimeout(() => bullet.destroy(), 500); // исчезновение через 0.5с
  }
}

new Phaser.Game(config); 