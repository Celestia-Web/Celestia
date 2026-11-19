// Celestia - data & story text
const FIRST_NAMES = ['Silent','Crimson','Lunar','Iron','Rogue','Drifting','Hollow','Bright','Wandering','Quiet','Rusty','Stellar','Pale','Wild'];
const LAST_NAMES  = ['Comet','Sparrow','Voyager','Lantern','Falcon','Meridian','Harbor','Tide','Ember','Wren','Horizon','Nomad','Pilgrim','Spark'];

const TUNING = {
  minerRate: 0.5,      // Retro Miner: 0.5 per second
  toughness: 0.3,      // Lunarrite toughness
  need: 50,            // lunarrite required
  reward: 5000,        // Zeals
  warpSeconds: 2,      // travel animation length
  travelSeconds: 5,    // Port <-> Lear = 5 kilayears = 5 seconds
  targetRatio: 11.5 / 7, // width : height
  ratioTolerance: 0.06
};
// mining speed = miner rate / toughness  (0.5 / 0.3 = 1.667 per second)
TUNING.mineRate = TUNING.minerRate / TUNING.toughness;

const PLACES = {
  farport: { name: 'FARPORT', sub: 'JOB HUB PLANET' },
  korr:    { name: 'KORR',    sub: 'LUNARRITE MINING PLANET' }
};

const SYSTEMS = [
  { id: 'port', name: 'PORT SYSTEM', x: -240, y: 0, ring: 95, sun: 16,
    planet: { id: 'farport', name: 'FARPORT', r: 11, color: '#f7d878', angle: 0.7, speed: 0.25 } },
  { id: 'lear', name: 'LEAR SYSTEM', x: 240, y: 0, ring: 62, sun: 13,
    planet: { id: 'korr', name: 'KORR', r: 5.5, color: '#9a9a9a', angle: 2.4, speed: 0.35 } }
];
