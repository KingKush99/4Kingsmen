import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const UNIT_TYPES = [
  { id: "infantry", name: "Infantry", cost: 100, move: 1, attack: 2, defense: 1, model: "Infantry.glb", icon: "Infantry.png", role: "Basic attack" },
  { id: "horseman", name: "Horseman", cost: 500, move: 2, attack: 3, defense: 1, model: "Horsemen.glb", icon: "Horsemen.png", role: "Fast movement" },
  { id: "singleBomber", name: "Single Bomber", cost: 1500, move: 1, attack: 4, defense: 1, model: "SingleBomber.glb", icon: "SingleBomber.png", role: "2x2 blast" },
  { id: "doubleBomber", name: "Double Bomber", cost: 1500, move: 1, attack: 4, defense: 1, model: "DoubleBomber.glb", icon: "DoubleBomber.png", role: "3x3 blast" },
  { id: "tripleBomber", name: "Triple Bomber", cost: 1500, move: 1, attack: 4, defense: 1, model: "TripleBomber.glb", icon: "TripleBomber_LighterBlue_BrighterBG.png", role: "4x4 blast" },
  { id: "seeker", name: "Seeker", cost: 250, move: 3, attack: 1, defense: 1, model: "Seeker.glb", icon: "Seeker.png", role: "Reveals nearby enemy tiles" },
  { id: "warden", name: "Warden", cost: 600, move: 1, attack: 1, defense: 3, model: "Warden.glb", icon: "Warden.png", role: "Adjacent +1 defense" },
  { id: "phantom", name: "Phantom", cost: 700, move: 2, attack: 0, defense: 1, model: "Phantom.glb", icon: "Phantom.png", role: "Bypasses traps, steals mines" },
  { id: "teleporter", name: "Teleport Unit", cost: 100, move: 1, attack: 2, defense: 1, model: "Teleporter.glb", icon: "Teleporter.png", role: "One teleport, starts disguised" },
  { id: "sentinel", name: "Sentinel", cost: 600, move: 0, attack: 3, defense: 3, model: "Pekka.glb", icon: "Pekka.png", role: "Immobile adjacent guard" },
  { id: "burrower", name: "Burrower", cost: 800, move: 1, attack: 2, defense: 2, model: "burrower.glb", icon: "Burrower.png", role: "Tunnels every 3 turns" },
  { id: "pyromancer", name: "Pyromancer", cost: 900, move: 2, attack: 2, defense: 1, model: "Pyromancer.glb", icon: "Pyromancer.png", role: "Burns enemy tile" },
  { id: "marksman", name: "Marksman", cost: 650, move: 2, attack: 3, defense: 1, model: "Marksman.glb", icon: "Marksman.png", role: "Range 2, ignores 1 defense" },
  { id: "disruptor", name: "Disruptor", cost: 700, move: 1, attack: 1, defense: 2, model: "Disruptor.glb", icon: "Disruptor.png", role: "Cancels nearby effects" },
  { id: "chrono", name: "Chrono Unit", cost: 850, move: 1, attack: 1, defense: 2, model: "Chrono Unit.glb", icon: "ChronoUnit.png", role: "Reverses one enemy move" },
  { id: "engineer", name: "Engineer", cost: 500, move: 1, attack: 1, defense: 2, model: "Engineer.glb", icon: "engineer.png", role: "Builds traps and repairs mines" },
  { id: "merchant", name: "Merchant", cost: 400, move: 1, attack: 1, defense: 1, model: "Merchant.glb", icon: "merchant_figurine.png", role: "Doubles touched mine income" },
];

const PLAYER_COLORS = [0xd7a842, 0x5c9bd8, 0xd45f5f, 0x55b176];
const PLAYER_NAMES = ["Gold", "Blue", "Crimson", "Emerald"];
const TILE = 1.1;
const SAFE_SIZE = 4;
const ABILITY_RULES = [
  { id: "bomberBlasts", name: "Bomber Blast Areas", description: "Single, Double, and Triple Bombers damage multiple enemy tiles." },
  { id: "seekerReveal", name: "Seeker Reveal", description: "Seekers reveal enemy fog up to 3 tiles away." },
  { id: "wardenBuff", name: "Warden Defense Aura", description: "Adjacent allies gain +1 defense." },
  { id: "phantomSteal", name: "Phantom Mine Theft", description: "Phantoms can pass traps and convert enemy mines." },
  { id: "teleport", name: "Teleport Reveal", description: "Teleport Units reveal and gain a one-use range burst." },
  { id: "sentinelGuard", name: "Sentinel Guard", description: "Sentinels counterattack adjacent enemy movement." },
  { id: "burrow", name: "Burrower Tunnel", description: "Burrowers can extend movement while tunneling." },
  { id: "fire", name: "Pyromancer Fire", description: "Pyromancers create a two-turn burning tile." },
  { id: "marksmanRange", name: "Marksman Range", description: "Marksmen attack at range 2 and ignore 1 defense." },
  { id: "chrono", name: "Chrono Interrupt", description: "Chrono Units consume a once-per-game reversal marker." },
  { id: "engineerTools", name: "Engineer Tools", description: "Engineers build traps and repair mines." },
  { id: "merchantBoost", name: "Merchant Mine Boost", description: "Merchants double adjacent friendly mine income." },
  { id: "safeRewards", name: "Central Safe Zone Rewards", description: "Kings entering the safe zone gain bonus tokens." },
  { id: "mineBonuses", name: "Mine Retrieval Bonuses", description: "Mature mines can be returned for large token bonuses." },
];
const PRESETS = {
  official: { name: "Official Standard", players: 4, theme: "standard", enabled: "all", summary: "Four-player 6x6 territories, 1,000 starting tokens, full official special rules enabled." },
  duel: { name: "Duel of Crowns", players: 2, theme: "arena", enabled: "all", summary: "Two-player 8x8 territories, 2,000 starting tokens, no unit type restrictions." },
  triad: { name: "Triad Siege", players: 3, theme: "mythic", enabled: "all", summary: "Three-player 7x7 territories, 1,500 starting tokens, 10 selectable unit types." },
  chaos: { name: "Full Chaos", players: 4, theme: "cyber", enabled: "all", summary: "Four-player match with high-visibility Cyber Reign styling and every special rule active." },
};
const AI_LEVELS = {
  beginner: { name: "Beginner", icon: "../images/Levels/1.png", delay: 1200, deploys: ["infantry", "seeker"], moves: 1 },
  novice: { name: "Novice", icon: "../images/Levels/2.png", delay: 950, deploys: ["infantry", "horseman", "merchant"], moves: 1 },
  intermediate: { name: "Intermediate", icon: "../images/Levels/3.png", delay: 750, deploys: ["infantry", "warden", "marksman", "engineer"], moves: 2 },
  pro: { name: "Pro", icon: "../images/Levels/4.png", delay: 520, deploys: ["marksman", "horseman", "burrower", "pyromancer", "engineer"], moves: 2 },
  worldClass: { name: "World-Class", icon: "../images/Levels/5.png", delay: 320, deploys: ["marksman", "teleporter", "chrono", "phantom", "pyromancer"], moves: 3 },
};
const AI_LEVEL_ORDER = ["beginner", "novice", "intermediate", "pro", "worldClass"];
const SECRET_PHRASES = {
  beginner: "Crown before conquest",
  novice: "The second crown sees through fog",
  intermediate: "Mines sing beneath hidden borders",
  pro: "A stolen treasure funds the throne",
  worldClass: "Only the final king commands the realm",
};
const PLAYER_CHARACTERS = [
  { id: "royalGuard", name: "Royal Guard", icon: "Infantry.png" },
  { id: "crownRider", name: "Crown Rider", icon: "Horsemen.png" },
  { id: "mistRegent", name: "Mist Regent", icon: "Phantom.png" },
  { id: "goldSavant", name: "Gold Savant", icon: "merchant_figurine.png" },
  { id: "timeHeir", name: "Time Heir", icon: "ChronoUnit.png" },
];
const SETTINGS = [
  { id: "showCloudFog", label: "Cloud Fog", description: "Cover undiscovered enemy territory with clouds.", type: "checkbox", default: true },
  { id: "territoryHints", label: "Territory Hints", description: "Highlight your territory after invalid placement.", type: "checkbox", default: true },
  { id: "showCoordinates", label: "Coordinate Labels", description: "Show A1-style tile markings.", type: "checkbox", default: true },
  { id: "animationSpeed", label: "Animation Speed", description: "Adjust movement and action animation speed.", type: "select", default: "normal", options: [["slow", "Slow"], ["normal", "Normal"], ["fast", "Fast"]] },
  { id: "aiDelay", label: "AI Thinking Delay", description: "Delay before AI actions resolve.", type: "select", default: "normal", options: [["short", "Short"], ["normal", "Normal"], ["long", "Long"]] },
  { id: "highContrast", label: "High Contrast", description: "Brighten territory and fog readability.", type: "checkbox", default: false },
  { id: "autoFitBoard", label: "Auto Focus Crown", description: "Start focused near the active crown instead of showing the full map.", type: "checkbox", default: true },
  { id: "showMoveTrails", label: "Move Trails", description: "Show stronger path streaks while units move.", type: "checkbox", default: true },
  { id: "turnTimer", label: "Turn Timer", description: "Enable the 20-second battle timer.", type: "checkbox", default: true },
  { id: "reducedMotion", label: "Reduced Motion", description: "Shorten nonessential animation effects.", type: "checkbox", default: false },
];
const IMAGE_ASSETS = {
  favicon: [
    "./images/favicon/1.png",
    "./images/favicon.ico",
    "./images/favicon.png",
    "./images/favicon.svg",
    "./images/favicon.webp",
    "./images/icon.ico",
    "./images/icon.png",
    "./images/4kingsmen-favicon.png",
    "./images/4Kingsmen-favicon.png",
  ],
  menuTheme: [
    "./images/themes/Main menu/1.png",
    "./images/themes/main menu/1.png",
    "./images/themes/main-menu/1.png",
    "./images/themes/Main Menu/1.png",
    "./images/main-menu-theme.png",
    "./images/main-menu-theme.jpg",
    "./images/main-menu-theme.jpeg",
    "./images/main-menu-theme.webp",
    "./images/main menu theme.png",
    "./images/main menu theme.jpg",
    "./images/main menu theme.webp",
    "./images/menu-theme.png",
    "./images/menu-theme.jpg",
    "./images/menu-theme.webp",
    "./images/main-menu.png",
    "./images/main-menu.jpg",
    "./images/main-menu.webp",
    "./images/menu.png",
    "./images/menu.jpg",
    "./images/menu.webp",
    "./images/background.png",
    "./images/background.jpg",
    "./images/background.webp",
    "./images/theme.png",
    "./images/theme.jpg",
    "./images/theme.webp",
  ],
};
const COIN_PACKS = [
  { id: "coins100", coins: 100, price: "$0.99" },
  { id: "coins550", coins: 550, price: "$4.99" },
  { id: "coins1200", coins: 1200, price: "$9.99" },
  { id: "coins2600", coins: 2600, price: "$19.99" },
  { id: "coins7000", coins: 7000, price: "$49.99" },
];
const THEME_MARKET = [
  { id: "standardCastle", name: "Standard Castle", cost: 0, type: "main menu", palette: "standard" },
  { id: "royalParchment", name: "Royal Parchment", cost: 0, type: "profile", palette: "legends" },
  { id: "forestKeep", name: "Forest Keep", cost: 0, type: "main menu", palette: "wilderness" },
  { id: "crimsonCourt", name: "Crimson Court", cost: 100, type: "profile", palette: "stage" },
  { id: "sapphireCitadel", name: "Sapphire Citadel", cost: 200, type: "main menu", palette: "galactic" },
  { id: "emeraldBanner", name: "Emerald Banner", cost: 400, type: "profile", palette: "world" },
  { id: "obsidianThrone", name: "Obsidian Throne", cost: 800, type: "main menu", palette: "cyber" },
  { id: "goldenEmpire", name: "Golden Empire", cost: 1600, type: "profile", palette: "arena" },
  { id: "frostKingdom", name: "Frost Kingdom", cost: 3200, type: "main menu", palette: "standard" },
  { id: "mythicRealm", name: "Mythic Realm", cost: 6400, type: "profile", palette: "mythic" },
];
const ACHIEVEMENTS = [
  { id: "firstCrown", name: "First Crown", description: "Win a match." },
  { id: "treasureRunner", name: "Treasure Runner", description: "Return a rival treasure." },
  { id: "fogBreaker", name: "Fog Breaker", description: "Reveal 100 hidden tiles." },
  { id: "mineLord", name: "Mine Lord", description: "Build 10 mines." },
  { id: "worldClass", name: "World-Class Heir", description: "Beat World-Class AI." },
  { id: "auctionHouse", name: "Auction House", description: "Win an auction." },
];
const EASTER_ITEMS = [
  { id: "hiddenCrown", name: "Hidden Crown", description: "A secret profile relic." },
  { id: "royalKey", name: "Royal Key", description: "Unlocks a future chamber." },
  { id: "silverScroll", name: "Silver Scroll", description: "Contains an old kingdom hint." },
];
const AUCTION_LISTINGS = [
  { id: "a1", item: "Founder Banner", rarity: "Legendary", bid: 320, buyout: 900, seller: "System", ends: "02:14:09" },
  { id: "a2", item: "Crimson Crown Frame", rarity: "Epic", bid: 180, buyout: 520, seller: "System", ends: "05:48:31" },
  { id: "a3", item: "Ancient Mine Seal", rarity: "Rare", bid: 75, buyout: 240, seller: "System", ends: "11:03:18" },
];
const LEADERBOARD_ROWS = [
  { rank: 1, name: "Cloud sync required", elo: 0, wins: 0 },
  { rank: 2, name: "Local Guest", elo: 0, wins: 0 },
  { rank: 3, name: "AI Challenger", elo: 0, wins: 0 },
];
const SOCIAL_USERS = [
  { id: "aria", name: "Aria Crownwright", username: "@aria" },
  { id: "bram", name: "Bram Ironkeep", username: "@bram" },
  { id: "celeste", name: "Celeste Goldvale", username: "@celeste" },
  { id: "dorian", name: "Dorian Mistfall", username: "@dorian" },
];
const WELCOME_TRANSLATIONS = {
  English: "Welcome to the royal guide. Ask about rules, movement, fog, treasures, AI levels, profile unlocks, shop items, or sign in.",
  Spanish: "Bienvenido a la guia real. Pregunta sobre reglas, movimiento, niebla, tesoros, niveles de IA, perfil, tienda o inicio de sesion.",
  French: "Bienvenue dans le guide royal. Posez des questions sur les regles, le mouvement, le brouillard, les tresors, l'IA, le profil, la boutique ou la connexion.",
  German: "Willkommen beim Koenigsleitfaden. Frage nach Regeln, Bewegung, Nebel, Schaetzen, KI-Stufen, Profil, Shop oder Anmeldung.",
  Portuguese: "Bem-vindo ao guia real. Pergunte sobre regras, movimento, nevoa, tesouros, IA, perfil, loja ou login.",
  Chinese: "Welcome. Chinese guide mode selected for rules, movement, fog, treasure, profile, shop, or sign in.",
  Japanese: "Welcome. Japanese guide mode selected for rules, movement, fog, treasure, profile, shop, or sign in.",
  Hindi: "Welcome. Hindi guide mode selected for rules, movement, fog, treasure, profile, shop, or sign in.",
  Arabic: "Welcome. Arabic guide mode selected for rules, movement, fog, treasure, profile, shop, or sign in.",
  Russian: "Welcome. Russian guide mode selected for rules, movement, fog, treasure, profile, shop, or sign in.",
};
const BACKEND_CONFIG = {
  firebaseConfigured: Boolean(window.FOUR_KINGSMEN_FIREBASE_CONFIG),
  stripeConfigured: Boolean(window.FOUR_KINGSMEN_STRIPE_KEY),
};
const state = {
  phase: "setup",
  screen: "mainMenu",
  playerCount: 4,
  grid: 6,
  active: 0,
  turn: 1,
  seconds: 20,
  moveNumber: 0,
  selectedUnitId: null,
  shopSelection: null,
  attackMode: false,
  players: [],
  units: [],
  mines: [],
  fires: [],
  traps: [],
  log: [],
  board: { width: 16, height: 16, safe: { x: 6, y: 6, size: SAFE_SIZE } },
  territories: [],
  ui: {
    lastSort: null,
    sortClicks: { default: 0, use: 0, name: 0, color: 0 },
    previousTileOrder: null,
    reels: 3,
    wager: 10,
    creatorColor: "gold",
    creatorRotating: false,
    profileStack: [],
  },
  profile: loadProfile(),
  settings: {
    mode: "single",
    tutorial: false,
    tutorialPaused: false,
    preset: "official",
    abilities: Object.fromEntries(ABILITY_RULES.map((rule) => [rule.id, true])),
    ai: { enabled: true, difficulty: "beginner" },
    playerCharacter: "royalGuard",
    progression: loadProgression(),
    options: Object.fromEntries(SETTINGS.map((setting) => [setting.id, setting.default])),
  },
  field: {
    mode: "select",
    rotation: 0,
    tilt: 0,
    scale: 1,
    panX: 0,
    panZ: 0,
    coordinates: true,
    suppressClick: false,
  },
};

const els = {
  cornerProfile: document.querySelector("#cornerProfileButton"),
  cornerMenu: document.querySelector("#cornerMenuButton"),
  miniSlotText: document.querySelector("#miniSlotText"),
  miniSlotToggle: document.querySelector("#miniSlotToggle"),
  slotReelDisplay: document.querySelector("#slotReelDisplay"),
  slotResultText: document.querySelector("#slotResultText"),
  slotSpin: document.querySelector("#slotSpinButton"),
  autoSpin: document.querySelector("#autoSpinToggle"),
  slotLeverLarge: document.querySelector("#slotLeverLarge"),
  hamburgerDrawer: document.querySelector("#hamburgerDrawer"),
  drawerClose: document.querySelector("#drawerClose"),
  modalBackdrop: document.querySelector("#modalBackdrop"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  modalClose: document.querySelector("#modalClose"),
  musicDrawer: document.querySelector("#musicDrawer"),
  musicClose: document.querySelector("#musicClose"),
  reelsPanel: document.querySelector("#reelsPanel"),
  slotLever: document.querySelector("#slotLever"),
  tileDropdown: document.querySelector("#tileDropdown"),
  profileCoins: document.querySelector("#profileCoins"),
  profileLevelFill: document.querySelector("#profileLevelFill"),
  profileLevelText: document.querySelector("#profileLevelText"),
  profileAchievements: document.querySelector("#profileAchievements"),
  easterEggInventory: document.querySelector("#easterEggInventory"),
  googleLogin: document.querySelector("#googleLoginButton"),
  syncProfile: document.querySelector("#syncProfileButton"),
  profileBack: document.querySelector("#profileBackButton"),
  profileClose: document.querySelector("#profileCloseButton"),
  editProfile: document.querySelector("#editProfileButton"),
  editProfileImage: document.querySelector("#editProfileImageButton"),
  profileImageInput: document.querySelector("#profileImageInput"),
  profileAvatarSeal: document.querySelector("#profileAvatarSeal"),
  profileDisplayName: document.querySelector("#profileDisplayName"),
  profileUsername: document.querySelector("#profileUsername"),
  profileBio: document.querySelector("#profileBio"),
  profileSettings: document.querySelector("#profileSettingsButton"),
  followersList: document.querySelector("#followersList"),
  followingList: document.querySelector("#followingList"),
  friendsList: document.querySelector("#friendsList"),
  profileCreatorCanvas: document.querySelector("#profileCreatorCanvas"),
  rotateCreator: document.querySelector("#rotateCreatorButton"),
  menuOverlay: document.querySelector("#menuOverlay"),
  mainMenu: document.querySelector("#mainMenu"),
  singlePlayerMenu: document.querySelector("#singlePlayerMenu"),
  createGameMenu: document.querySelector("#createGameMenu"),
  advancedMenu: document.querySelector("#advancedMenu"),
  advancedBack: document.querySelector("#advancedMenu .back-button"),
  playNow: document.querySelector("#playNowButton"),
  singlePlayer: document.querySelector("#singlePlayerButton"),
  createGame: document.querySelector("#createGameButton"),
  quickDuel: document.querySelector("#quickDuelButton"),
  presetSelect: document.querySelector("#presetSelect"),
  setupPlayerCount: document.querySelector("#setupPlayerCount"),
  setupThemeTier: document.querySelector("#setupThemeTier"),
  aiDifficulty: document.querySelector("#aiDifficulty"),
  aiCharacterPreview: document.querySelector("#aiCharacterPreview"),
  playerCharacterPreview: document.querySelector("#playerCharacterPreview"),
  playerLevelSummary: document.querySelector("#playerLevelSummary"),
  presetSummary: document.querySelector("#presetSummary"),
  advancedSetup: document.querySelector("#advancedSetupButton"),
  startConfiguredGame: document.querySelector("#startConfiguredGameButton"),
  abilityToggles: document.querySelector("#abilityToggles"),
  enableAllAbilities: document.querySelector("#enableAllAbilities"),
  disableSpecialAbilities: document.querySelector("#disableSpecialAbilities"),
  startLocalMultiplayer: document.querySelector("#startLocalMultiplayerButton"),
  showOnlineSetup: document.querySelector("#showOnlineSetupButton"),
  watchTutorial: document.querySelector("#watchTutorialButton"),
  watchUnitTutorial: document.querySelector("#watchUnitTutorialButton"),
  canvas: document.querySelector("#gameCanvas"),
  playerCount: document.querySelector("#playerCount"),
  themeTier: document.querySelector("#themeTier"),
  newGame: document.querySelector("#newGameButton"),
  openMenu: document.querySelector("#openMenuButton"),
  activePlayer: document.querySelector("#activePlayer"),
  turnTimer: document.querySelector("#turnTimer"),
  tokenCount: document.querySelector("#tokenCount"),
  moveCost: document.querySelector("#moveCost"),
  unitCap: document.querySelector("#unitCap"),
  gridSize: document.querySelector("#gridSize"),
  typeLimit: document.querySelector("#typeLimit"),
  shop: document.querySelector("#shop"),
  selectionText: document.querySelector("#selectionText"),
  selectedUnit: document.querySelector("#selectedUnit"),
  ruleState: document.querySelector("#ruleState"),
  battleLog: document.querySelector("#battleLog"),
  endTurn: document.querySelector("#endTurnButton"),
  pauseTutorial: document.querySelector("#pauseTutorialButton"),
  attack: document.querySelector("#attackButton"),
  ability: document.querySelector("#abilityButton"),
  mine: document.querySelector("#mineButton"),
  pass: document.querySelector("#passButton"),
  phaseBadge: document.querySelector("#phaseBadge"),
  phaseText: document.querySelector("#phaseText"),
  selectMode: document.querySelector("#selectModeButton"),
  dragMode: document.querySelector("#dragModeButton"),
  fieldRotate: document.querySelector("#fieldRotate"),
  fieldTilt: document.querySelector("#fieldTilt"),
  fieldScale: document.querySelector("#fieldScale"),
  coordinateToggle: document.querySelector("#coordinateToggle"),
  fitBoard: document.querySelector("#fitBoardButton"),
  resetField: document.querySelector("#resetFieldButton"),
  settingsOptions: document.querySelector("#settingsOptions"),
  chatWidget: document.querySelector("#chatWidget"),
  chatToggle: document.querySelector("#chatToggle"),
  chatPanel: document.querySelector("#chatPanel"),
  chatClose: document.querySelector("#chatClose"),
  languageToggle: document.querySelector("#languageToggle"),
  languagePanel: document.querySelector("#languagePanel"),
  chatMessages: document.querySelector("#chatMessages"),
  chatLanguage: document.querySelector("#chatLanguage"),
  chatFileInput: document.querySelector("#chatFileInput"),
  voiceInput: document.querySelector("#voiceInputButton"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true });
const creatorRenderer = els.profileCreatorCanvas ? new THREE.WebGLRenderer({ canvas: els.profileCreatorCanvas, antialias: true, alpha: true }) : null;
const creatorScene = new THREE.Scene();
const creatorCamera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const loader = new GLTFLoader();
const modelCache = new Map();
const tileMeshes = new Map();
const unitMeshes = new Map();
let fieldRoot = new THREE.Group();
let boardGroup = new THREE.Group();
let modelRoot = new THREE.Group();
let effectRoot = new THREE.Group();
let animationRoot = new THREE.Group();
let labelRoot = new THREE.Group();
let fogRoot = new THREE.Group();
let timerId = null;
const animations = [];
let dragState = null;
let creatorAvatar = null;

scene.background = new THREE.Color(0x0c0f0e);
scene.add(new THREE.AmbientLight(0xffffff, 1.55));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(10, 18, 8);
scene.add(sun);
fieldRoot.add(boardGroup, fogRoot, labelRoot, effectRoot, modelRoot, animationRoot);
scene.add(fieldRoot);
creatorScene.add(new THREE.AmbientLight(0xffffff, 1.8));
const creatorLight = new THREE.DirectionalLight(0xffffff, 2.1);
creatorLight.position.set(3, 5, 4);
creatorScene.add(creatorLight);
creatorCamera.position.set(0, 1.35, 6);
creatorCamera.lookAt(0, 1.1, 0);

function setupRenderer() {
  const rect = els.canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  focusActiveView();
  setupCreatorRenderer();
}

function setupCreatorRenderer() {
  if (!creatorRenderer || !els.profileCreatorCanvas) return;
  const rect = els.profileCreatorCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  creatorRenderer.setSize(rect.width, rect.height, false);
  creatorRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  creatorCamera.aspect = rect.width / rect.height;
  creatorCamera.updateProjectionMatrix();
}

async function applyImageAssets() {
  const [favicon, menuTheme] = await Promise.all([
    firstExistingAsset(IMAGE_ASSETS.favicon),
    firstExistingAsset(IMAGE_ASSETS.menuTheme),
  ]);
  if (favicon) {
    const faviconLink = document.querySelector("#gameFavicon") || document.createElement("link");
    faviconLink.id = "gameFavicon";
    faviconLink.rel = "icon";
    faviconLink.href = favicon;
    document.head.append(faviconLink);
  }
  if (menuTheme) {
    document.documentElement.style.setProperty("--menu-theme-image", `url("${menuTheme}")`);
  }
}

async function firstExistingAsset(candidates) {
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: "HEAD", cache: "no-store" });
      if (response.ok) return candidate;
    } catch {
      try {
        const response = await fetch(candidate, { cache: "no-store" });
        if (response.ok) return candidate;
      } catch {
        // Keep probing known names.
      }
    }
  }
  return null;
}

function showMenu(screenId) {
  state.screen = screenId;
  els.menuOverlay.classList.remove("hidden");
  document.querySelectorAll(".menu-screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });
  document.body.classList.toggle("profile-open", screenId === "profileMenu");
  els.tileDropdown.hidden = true;
  refreshPresetSummary();
  if (screenId === "profileMenu") setTimeout(setupCreatorRenderer, 0);
}

function closeMenu() {
  els.menuOverlay.classList.add("hidden");
  document.body.classList.remove("profile-open");
}

function applyPreset(id) {
  const preset = PRESETS[id] ?? PRESETS.official;
  state.settings.preset = id;
  els.presetSelect.value = id;
  els.setupPlayerCount.value = String(preset.players);
  els.setupThemeTier.value = preset.theme;
  els.playerCount.value = String(preset.players);
  els.themeTier.value = preset.theme;
  if (preset.enabled === "all") setAllAbilities(true);
  refreshPresetSummary();
}

function syncSetupControls() {
  els.playerCount.value = els.setupPlayerCount.value;
  els.themeTier.value = els.setupThemeTier.value;
  state.settings.ai.difficulty = els.aiDifficulty.value;
  refreshPresetSummary();
}

function refreshPresetSummary() {
  if (!els.presetSummary) return;
  const preset = PRESETS[state.settings.preset] ?? PRESETS.official;
  const playerCount = Number(els.setupPlayerCount.value);
  const cfg = playerConfig(playerCount);
  const enabled = ABILITY_RULES.filter((rule) => abilityOn(rule.id)).length;
  els.presetSummary.innerHTML = `
    <strong>${preset.name}</strong>
    <span>${preset.summary}</span>
    <span>${playerCount} players | ${cfg.grid}x${cfg.grid} hidden grids | ${cfg.tokens} starting tokens</span>
    <span>Single-player AI: ${AI_LEVELS[state.settings.ai.difficulty]?.name ?? "Intermediate"}</span>
    <span>${enabled}/${ABILITY_RULES.length} special rule toggles enabled</span>
  `;
}

function renderAiCharacters() {
  if (!els.aiCharacterPreview) return;
  els.aiCharacterPreview.innerHTML = Object.entries(AI_LEVELS)
    .map(([id, ai]) => `
      <button class="ai-card ${state.settings.ai.difficulty === id ? "active" : ""} ${isAiLevelUnlocked(id) ? "" : "locked"}" data-ai-level="${id}" type="button" ${isAiLevelUnlocked(id) ? "" : "disabled"}>
        <img src="${assetPath(ai.icon)}" alt="" />
        <strong>${ai.name}</strong>
        <small>${isAiLevelUnlocked(id) ? "Unlocked" : "Locked"}</small>
      </button>
    `)
    .join("");
  els.aiCharacterPreview.querySelectorAll("[data-ai-level]").forEach((button) => {
    button.addEventListener("click", () => setAiDifficulty(button.dataset.aiLevel));
  });
  renderPlayerLevelSummary();
}

function setAiDifficulty(level) {
  if (!isAiLevelUnlocked(level)) {
    addLog(`${AI_LEVELS[level]?.name ?? "That level"} is locked. Beat the previous level first.`);
    if (els.aiDifficulty) els.aiDifficulty.value = state.settings.ai.difficulty;
    return;
  }
  state.settings.ai.enabled = true;
  state.settings.ai.difficulty = level;
  if (els.aiDifficulty) els.aiDifficulty.value = level;
  if (els.aiDifficulty) {
    Array.from(els.aiDifficulty.options).forEach((option) => {
      option.disabled = !isAiLevelUnlocked(option.value);
    });
  }
  renderAiCharacters();
  refreshPresetSummary();
}

function renderPlayerCharacters() {
  if (!els.playerCharacterPreview) return;
  els.playerCharacterPreview.innerHTML = PLAYER_CHARACTERS.map((character) => `
    <button class="ai-card ${state.settings.playerCharacter === character.id ? "active" : ""}" data-player-character="${character.id}" type="button">
      <img src="${assetPath(character.icon)}" alt="" />
      <strong>${character.name}</strong>
    </button>
  `).join("");
  els.playerCharacterPreview.querySelectorAll("[data-player-character]").forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.playerCharacter = button.dataset.playerCharacter;
      renderPlayerCharacters();
      renderPlayerLevelSummary();
    });
  });
}

function assetPath(icon) {
  if (icon.startsWith("../images/")) return icon.replace("../", "./");
  if (icon.startsWith("./")) return icon;
  return `./units/${icon}`;
}

function renderPlayerLevelSummary() {
  if (!els.playerLevelSummary) return;
  const unlocked = state.settings.progression.unlocked;
  const highest = AI_LEVEL_ORDER[Math.max(...unlocked.map((level) => AI_LEVEL_ORDER.indexOf(level)).filter((index) => index >= 0))] ?? "beginner";
  const secrets = state.settings.progression.secrets;
  const character = PLAYER_CHARACTERS.find((item) => item.id === state.settings.playerCharacter);
  els.playerLevelSummary.innerHTML = `
    <strong>Player Level: ${AI_LEVELS[highest].name}</strong>
    <span>Commander: ${character?.name ?? "Royal Guard"}</span>
    <span>Secret phrases unlocked: ${secrets.length ? secrets.join(" | ") : "None yet"}</span>
  `;
}

function loadProgression() {
  try {
    const saved = JSON.parse(localStorage.getItem("fourKingsmenProgression") || "null");
    if (saved?.unlocked?.length) {
      const secrets = saved.secrets ?? [];
      if (!secrets.includes(SECRET_PHRASES.beginner)) secrets.unshift(SECRET_PHRASES.beginner);
      return { unlocked: saved.unlocked, secrets };
    }
  } catch {
    // Ignore corrupt local progression.
  }
  return { unlocked: ["beginner"], secrets: [SECRET_PHRASES.beginner] };
}

function saveProgression() {
  localStorage.setItem("fourKingsmenProgression", JSON.stringify(state.settings.progression));
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("fourKingsmenProfile") || "null");
    if (saved) {
      return {
        level: saved.level ?? 1,
        xp: saved.xp ?? 0,
        coins: saved.coins ?? 0,
        ownedThemes: saved.ownedThemes ?? THEME_MARKET.filter((theme) => theme.cost === 0).map((theme) => theme.id),
        achievements: saved.achievements ?? ["firstCrown"],
        easterItems: saved.easterItems ?? ["hiddenCrown"],
        displayName: saved.displayName ?? "Connor of the Four Crowns",
        username: saved.username ?? "fourcrowns",
        bio: saved.bio ?? "Classical kingdom strategist.",
        avatarImage: saved.avatarImage ?? "",
        lastUsernameChange: saved.lastUsernameChange ?? 0,
        signedIn: false,
      };
    }
  } catch {
    // Ignore corrupt local profile.
  }
  return {
    level: 1,
    xp: 0,
    coins: 0,
    ownedThemes: THEME_MARKET.filter((theme) => theme.cost === 0).map((theme) => theme.id),
    achievements: ["firstCrown"],
    easterItems: ["hiddenCrown"],
    displayName: "Connor of the Four Crowns",
    username: "fourcrowns",
    bio: "Classical kingdom strategist.",
    avatarImage: "",
    lastUsernameChange: 0,
    signedIn: false,
  };
}

function saveProfile() {
  localStorage.setItem("fourKingsmenProfile", JSON.stringify({
    level: state.profile.level,
    xp: state.profile.xp,
    coins: state.profile.coins,
    ownedThemes: state.profile.ownedThemes,
    achievements: state.profile.achievements,
    easterItems: state.profile.easterItems,
    displayName: state.profile.displayName,
    username: state.profile.username,
    bio: state.profile.bio,
    avatarImage: state.profile.avatarImage,
    lastUsernameChange: state.profile.lastUsernameChange,
  }));
}

function renderProfile() {
  if (els.profileDisplayName) els.profileDisplayName.textContent = state.profile.displayName;
  if (els.profileUsername) els.profileUsername.textContent = `@${state.profile.username}`;
  if (els.profileBio) els.profileBio.textContent = state.profile.bio;
  if (els.profileAvatarSeal) {
    els.profileAvatarSeal.textContent = state.profile.avatarImage ? "" : (state.profile.displayName[0] ?? "C").toUpperCase();
    els.profileAvatarSeal.style.backgroundImage = state.profile.avatarImage ? `url("${state.profile.avatarImage}")` : "";
  }
  if (els.profileCoins) els.profileCoins.textContent = state.profile.coins;
  const xpNeeded = 500 * state.profile.level;
  const pct = Math.max(0, Math.min(100, Math.round((state.profile.xp / xpNeeded) * 100)));
  if (els.profileLevelFill) els.profileLevelFill.style.width = `${pct}%`;
  if (els.profileLevelText) els.profileLevelText.textContent = `Level ${state.profile.level} - ${state.profile.xp} / ${xpNeeded} XP`;
  if (els.profileAchievements) {
    els.profileAchievements.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const unlocked = state.profile.achievements.includes(achievement.id);
      return `<div class="profile-badge-item"><strong>${unlocked ? "Unlocked" : "Locked"}: ${achievement.name}</strong><span>${achievement.description}</span></div>`;
    }).join("");
  }
  if (els.easterEggInventory) {
    els.easterEggInventory.innerHTML = EASTER_ITEMS.map((item) => {
      const owned = state.profile.easterItems.includes(item.id);
      return `<div class="profile-badge-item"><strong>${owned ? item.name : "Hidden Item"}</strong><span>${owned ? item.description : "Find this easter egg to reveal it."}</span></div>`;
    }).join("");
  }
  renderSocialLists();
}

function containsBlockedContent(text) {
  return /\b(fuck|bitch|nigger|nigga|cunt|shit)\b/i.test(text);
}

function openEditProfileModal() {
  openModal("Edit Profile", `
    <label>Display name<input id="editDisplayNameInput" maxlength="64" value="${escapeHtml(state.profile.displayName)}" /></label>
    <label>Username<input id="editUsernameInput" maxlength="64" value="${escapeHtml(state.profile.username)}" /></label>
    <label>Bio<textarea id="editBioInput" maxlength="1000">${escapeHtml(state.profile.bio)}</textarea></label>
    <p class="advanced-note">Display name and username are filtered for prohibited language. Username changes are limited to once per week.</p>
    <button id="saveProfileEdits" class="primary-menu-action" type="button">Save Profile</button>
  `);
  document.querySelector("#saveProfileEdits")?.addEventListener("click", saveProfileEdits);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
}

function saveProfileEdits() {
  const displayName = document.querySelector("#editDisplayNameInput").value.trim().slice(0, 64);
  const username = document.querySelector("#editUsernameInput").value.trim().replace(/[^a-z0-9_]/gi, "").slice(0, 64);
  const bio = document.querySelector("#editBioInput").value.trim().slice(0, 1000);
  if (!displayName || !username) {
    openModal("Profile Error", "<p>Display name and username are required.</p>");
    return;
  }
  if (containsBlockedContent(`${displayName} ${username} ${bio}`)) {
    openModal("Profile Error", "<p>That profile text contains prohibited language. Choose a respectful name and bio.</p>");
    return;
  }
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  if (username !== state.profile.username && Date.now() - state.profile.lastUsernameChange < oneWeek) {
    openModal("Username Locked", "<p>Usernames can only be changed once per week.</p>");
    return;
  }
  if (username !== state.profile.username) state.profile.lastUsernameChange = Date.now();
  state.profile.displayName = displayName;
  state.profile.username = username;
  state.profile.bio = bio;
  saveProfile();
  renderProfile();
  closeModal();
}

function handleProfileImageUpload() {
  const file = els.profileImageInput.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  if (file.size > 2_000_000) {
    openModal("Image Too Large", "<p>Use an image under 2 MB for the local prototype.</p>");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.profile.avatarImage = String(reader.result);
    saveProfile();
    renderProfile();
    openModal("Image Review Required", "<p>Your profile image is previewed locally. Production upload must run server-side moderation before it becomes public.</p>");
  };
  reader.readAsDataURL(file);
}

function renderSocialLists(filter = "") {
  const groups = [
    [els.followersList, SOCIAL_USERS],
    [els.followingList, SOCIAL_USERS.slice().reverse()],
    [els.friendsList, SOCIAL_USERS.slice(0, 3)],
  ];
  for (const [container, users] of groups) {
    if (!container) continue;
    container.innerHTML = users
      .filter((user) => `${user.name} ${user.username}`.toLowerCase().includes(filter.toLowerCase()))
      .map((user) => `<button data-social-user="${user.id}" type="button"><strong>${user.name}</strong><small>${user.username}</small></button>`)
      .join("");
  }
  document.querySelectorAll("[data-social-user]").forEach((button) => {
    button.addEventListener("click", () => visitProfile(button.dataset.socialUser));
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openSocialContext(button.dataset.socialUser, event.clientX, event.clientY);
    });
  });
}

function visitProfile(userId) {
  state.ui.profileStack.push({ ...state.profile });
  const user = SOCIAL_USERS.find((item) => item.id === userId);
  if (!user) return;
  state.profile.displayName = user.name;
  state.profile.username = user.username.replace("@", "");
  state.profile.bio = "Visiting another commander's public profile.";
  state.profile.avatarImage = "";
  renderProfile();
  showMenu("profileMenu");
}

function openSocialContext(userId, x, y) {
  document.querySelector(".social-context-menu")?.remove();
  const user = SOCIAL_USERS.find((item) => item.id === userId);
  const menu = document.createElement("div");
  menu.className = "social-context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.innerHTML = `
    <button type="button">Add Friend</button>
    <button type="button">Send Message</button>
    <button type="button">Visit Profile</button>
  `;
  menu.querySelectorAll("button")[2].addEventListener("click", () => visitProfile(user.id));
  document.body.append(menu);
}

function initCreatorAvatar() {
  if (!creatorRenderer || creatorAvatar) return;
  creatorAvatar = new THREE.Group();
  const armor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.72, 1.28, 16),
    new THREE.MeshStandardMaterial({ color: 0xd7a842, metalness: 0.45, roughness: 0.42 }),
  );
  armor.position.y = 0.85;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xd9b38c, roughness: 0.55 }),
  );
  head.position.y = 1.7;
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.32, 5),
    new THREE.MeshStandardMaterial({ color: 0xf1d681, metalness: 0.7, roughness: 0.28 }),
  );
  crown.position.y = 2.12;
  const cape = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 1.16, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x731919, roughness: 0.65 }),
  );
  cape.position.set(0, 0.85, 0.48);
  cape.name = "cape";
  creatorAvatar.add(cape, armor, head, crown);
  creatorScene.add(creatorAvatar);
  updateCreatorColor();
}

function updateCreatorColor() {
  if (!creatorAvatar) return;
  const armor = creatorAvatar.children[1];
  const cape = creatorAvatar.getObjectByName("cape");
  const colors = {
    gold: { armor: 0xd7a842, cape: 0x731919 },
    crimson: { armor: 0x8d1433, cape: 0xd45f5f },
    emerald: { armor: 0x55b176, cape: 0x126148 },
  };
  const selected = colors[state.ui.creatorColor] ?? colors.gold;
  armor.material.color.setHex(selected.armor);
  cape.material.color.setHex(selected.cape);
}

function isAiLevelUnlocked(level) {
  return state.settings.progression.unlocked.includes(level);
}

function unlockNextDifficulty(completedLevel) {
  const phrase = SECRET_PHRASES[completedLevel];
  if (phrase && !state.settings.progression.secrets.includes(phrase)) {
    state.settings.progression.secrets.push(phrase);
    addLog(`Secret phrase unlocked: "${phrase}"`);
  }
  const index = AI_LEVEL_ORDER.indexOf(completedLevel);
  const nextLevel = AI_LEVEL_ORDER[index + 1];
  if (nextLevel && !state.settings.progression.unlocked.includes(nextLevel)) {
    state.settings.progression.unlocked.push(nextLevel);
    addLog(`${AI_LEVELS[nextLevel].name} difficulty unlocked.`);
  }
  saveProgression();
  renderAiCharacters();
  renderPlayerLevelSummary();
}

function renderSettings() {
  if (!els.settingsOptions) return;
  els.settingsOptions.innerHTML = SETTINGS.map((setting) => {
    const value = state.settings.options[setting.id];
    const control =
      setting.type === "checkbox"
        ? `<input data-setting="${setting.id}" type="checkbox" ${value ? "checked" : ""} />`
        : `<select data-setting="${setting.id}">${setting.options.map(([optionValue, label]) => `<option value="${optionValue}" ${value === optionValue ? "selected" : ""}>${label}</option>`).join("")}</select>`;
    return `
      <label class="setting-row">
        <strong>${setting.label}<span>${setting.description}</span></strong>
        ${control}
      </label>
    `;
  }).join("");
  els.settingsOptions.querySelectorAll("[data-setting]").forEach((control) => {
    control.addEventListener("change", () => {
      const setting = SETTINGS.find((item) => item.id === control.dataset.setting);
      state.settings.options[setting.id] = setting.type === "checkbox" ? control.checked : control.value;
      applySettingEffects();
    });
  });
}

function applySettingEffects() {
  state.field.coordinates = Boolean(state.settings.options.showCoordinates);
  if (els.coordinateToggle) els.coordinateToggle.checked = state.field.coordinates;
  document.body.classList.toggle("high-contrast", Boolean(state.settings.options.highContrast));
  drawCoordinateLabels();
  drawCloudFog();
  if (state.players.length) updateVisualState();
}

function openModal(title, html) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = html;
  els.modalBackdrop.hidden = false;
}

function closeModal() {
  els.modalBackdrop.hidden = true;
  els.modalBody.innerHTML = "";
}

function requireLogin(action) {
  if (state.profile.signedIn) return true;
  openModal("Google Login Required", `
    <p>${action} requires Google login so purchases, friends, stats, and unlocks can be attached to your account.</p>
    <button id="modalLoginButton" class="primary-menu-action" type="button">Sign in with Google</button>
    <p class="advanced-note">Firebase is not configured yet. Add window.FOUR_KINGSMEN_FIREBASE_CONFIG and deploy auth to enable real login.</p>
  `);
  document.querySelector("#modalLoginButton")?.addEventListener("click", simulateGoogleLogin);
  return false;
}

function simulateGoogleLogin() {
  if (!BACKEND_CONFIG.firebaseConfigured) {
    addLog("Firebase config missing. Google login is gated for deployment.");
    openModal("Backend Not Connected", "<p>Google login is ready for Firebase wiring, but this static build does not include your Firebase project config yet.</p>");
    return;
  }
  state.profile.signedIn = true;
  addLog("Google login connected.");
  closeModal();
}

function openShopModal() {
  const cards = COIN_PACKS.map((pack) => `
    <div class="shop-card">
      <strong>${pack.coins} Coins</strong>
      <span class="price-pill">${pack.price}</span>
      <button data-coin-pack="${pack.id}" type="button">Buy Coins</button>
    </div>
  `).join("");
  openModal("Royal Coin Shop", `
    <p>Coin purchases use Stripe Checkout after Google login. Test mode requires deployed Firebase Functions.</p>
    <div class="shop-grid">${cards}</div>
  `);
  document.querySelectorAll("[data-coin-pack]").forEach((button) => {
    button.addEventListener("click", () => startCoinCheckout(button.dataset.coinPack));
  });
}

function startCoinCheckout(packId) {
  const pack = COIN_PACKS.find((item) => item.id === packId);
  if (!pack || !requireLogin("Buying coins")) return;
  if (!BACKEND_CONFIG.stripeConfigured) {
    openModal("Stripe Checkout Not Connected", `<p>${pack.coins} coins for ${pack.price} is configured in the UI. Add Stripe publishable key and a Firebase Checkout Function to process real purchases.</p>`);
    return;
  }
  addLog(`Starting Stripe checkout for ${pack.coins} coins.`);
}

function openThemesModal() {
  const cards = THEME_MARKET.map((theme) => {
    const owned = state.profile.ownedThemes.includes(theme.id);
    return `
      <div class="theme-card ${owned ? "" : "locked"}">
        <strong>${theme.name}</strong>
        <span>${theme.type}</span>
        <span class="price-pill">${theme.cost ? `${theme.cost} coins` : "Free"}</span>
        <button data-theme-buy="${theme.id}" type="button">${owned ? "Apply" : "Unlock"}</button>
      </div>
    `;
  }).join("");
  openModal("Kingdom Themes", `<p>Main menu and profile themes. The first three are free; paid themes use coins.</p><div class="theme-grid">${cards}</div>`);
  document.querySelectorAll("[data-theme-buy]").forEach((button) => {
    button.addEventListener("click", () => buyOrApplyTheme(button.dataset.themeBuy));
  });
}

function buyOrApplyTheme(themeId) {
  const theme = THEME_MARKET.find((item) => item.id === themeId);
  if (!theme) return;
  if (!state.profile.ownedThemes.includes(theme.id)) {
    if (state.profile.coins < theme.cost) {
      openModal("Not Enough Coins", `<p>${theme.name} costs ${theme.cost} coins. Open the shop to buy coins through Stripe Checkout after login.</p><button id="openShopFromTheme" type="button">Open Shop</button>`);
      document.querySelector("#openShopFromTheme")?.addEventListener("click", openShopModal);
      return;
    }
    state.profile.coins -= theme.cost;
    state.profile.ownedThemes.push(theme.id);
    saveProfile();
  }
  els.themeTier.value = theme.palette;
  els.setupThemeTier.value = theme.palette;
  drawBoard();
  if (state.players.length) updateVisualState();
  renderProfile();
  openThemesModal();
}

function openAuctionsModal() {
  const listings = AUCTION_LISTINGS.map((listing) => `
    <div class="auction-card">
      <strong>${listing.item}</strong>
      <span>${listing.rarity} | Seller: ${listing.seller}</span>
      <span>Current bid: ${listing.bid} coins | Buyout: ${listing.buyout} coins</span>
      <span>Ends in ${listing.ends}</span>
      <button data-auction-bid="${listing.id}" type="button">Bid</button>
    </div>
  `).join("");
  openModal("Royal Auctions", `<p>Bids use coins and will be server-validated when Firebase Functions are deployed.</p><div class="auction-grid">${listings}</div>`);
  document.querySelectorAll("[data-auction-bid]").forEach((button) => {
    button.addEventListener("click", () => {
      if (requireLogin("Auction bidding")) openModal("Auction Backend Required", "<p>Auction bidding needs Firebase Functions for authoritative bid validation before real coins can be spent.</p>");
    });
  });
}

function openLeaderboardModal() {
  const rows = LEADERBOARD_ROWS.map((row) => `<div class="leaderboard-row"><strong>#${row.rank}</strong><span>${row.name}</span><span>${row.elo} ELO | ${row.wins} wins</span></div>`).join("");
  openModal("Leaderboard", `<p>Real leaderboard stats sync from Firebase after login and completed match validation.</p><div class="leaderboard-list">${rows}</div>`);
}

function openAchievementsModal() {
  const rows = ACHIEVEMENTS.map((item) => `<div class="achievement-row ${state.profile.achievements.includes(item.id) ? "" : "locked"}"><strong>${item.name}</strong><span>${item.description}</span></div>`).join("");
  openModal("Achievements", `<div class="achievement-list">${rows}</div>`);
}

function openFaqModal() {
  openModal("FAQ", `
    <div class="faq-list">
      <div class="faq-row"><strong>How do I win?</strong><span>Capture and return every rival treasure, or be the last surviving King.</span></div>
      <div class="faq-row"><strong>Does losing treasure eliminate me?</strong><span>No. The capturer gains bonus tokens and income, but you stay in the match.</span></div>
      <div class="faq-row"><strong>Are payments live?</strong><span>The UI is ready; Stripe requires Firebase Functions before real checkout is enabled.</span></div>
    </div>
  `);
}

function openTileDropdown(type) {
  const content = {
    variations: `
      <h3>Variations</h3>
      <div class="dropdown-grid">
        <button data-player-preset="2" type="button">Duel of Crowns</button>
        <button data-player-preset="3" type="button">Triad Siege</button>
        <button data-player-preset="4" type="button">Four-Crown War</button>
      </div>
    `,
    players: `
      <h3>Players</h3>
      <div class="dropdown-grid">
        <button data-menu-target="profileMenu" type="button">My Profile</button>
        <button data-player-preset="2" type="button">2 Players</button>
        <button data-player-preset="3" type="button">3 Players</button>
        <button data-player-preset="4" type="button">4 Players</button>
      </div>
    `,
  };
  els.tileDropdown.innerHTML = content[type] ?? "";
  els.tileDropdown.hidden = !els.tileDropdown.innerHTML;
  els.tileDropdown.querySelectorAll("[data-menu-target]").forEach((button) => {
    button.addEventListener("click", () => showMenu(button.dataset.menuTarget));
  });
  els.tileDropdown.querySelectorAll("[data-player-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      els.setupPlayerCount.value = button.dataset.playerPreset;
      syncSetupControls();
      showMenu("createGameMenu");
    });
  });
}

function handleTileAction(action) {
  recordTileUse(action);
  if (action === "live") {
    applyPreset("official");
    startConfiguredGame();
  } else if (action === "shop") openShopModal();
  else if (action === "auctions") openAuctionsModal();
  else if (action === "variations") openTileDropdown("variations");
  else if (action === "players") openTileDropdown("players");
  else if (action === "singlePlayer") showMenu("singlePlayerMenu");
  else if (action === "multiplayer") showMenu("multiplayerMenu");
  else if (action === "campaign") showMenu("campaignMenu");
  else if (action === "rules") showMenu("tutorialMenu");
  else if (action === "themes") openThemesModal();
  else if (action === "leaderboard") openLeaderboardModal();
  else if (action === "achievements") openAchievementsModal();
  else if (action === "profile") showMenu("profileMenu");
  else if (action === "music") els.musicDrawer.hidden = false;
  else if (action === "settings") showMenu("settingsMenu");
  else if (action === "faq") openFaqModal();
}

function recordTileUse(action) {
  const key = `fourKingsmenTileUse:${action}`;
  localStorage.setItem(key, String(Number(localStorage.getItem(key) || "0") + 1));
}

function sortTiles(type, button) {
  const grid = document.querySelector(".royal-tile-grid");
  const tiles = Array.from(grid.querySelectorAll(".royal-tile"));
  if (!state.ui.previousTileOrder) state.ui.previousTileOrder = tiles.map((tile) => tile.dataset.action);
  state.ui.sortClicks[type] += 1;
  document.querySelectorAll("[data-sort]").forEach((item) => item.classList.toggle("active", item === button));
  button.classList.add("sort-pulse");
  setTimeout(() => button.classList.remove("sort-pulse"), 260);
  if (type === "default") {
    const current = tiles.map((tile) => tile.dataset.action);
    const defaultOrder = ["live", "shop", "auctions", "variations", "players", "singlePlayer", "multiplayer", "campaign", "rules", "themes", "leaderboard", "achievements", "profile", "music", "settings", "faq"];
    const order = state.ui.sortClicks.default % 2 === 1 ? defaultOrder : state.ui.previousTileOrder ?? defaultOrder;
    state.ui.previousTileOrder = current;
    order.forEach((action) => grid.append(tiles.find((tile) => tile.dataset.action === action)));
    return;
  }
  const odd = state.ui.sortClicks[type] % 2 === 1;
  const sorted = [...tiles].sort((a, b) => {
    if (type === "use") return (Number(b.dataset.useScore) - Number(a.dataset.useScore)) * (odd ? 1 : -1);
    if (type === "name") return a.querySelector("strong").textContent.localeCompare(b.querySelector("strong").textContent) * (odd ? 1 : -1);
    if (type === "color") return (Number(b.dataset.colorScore) - Number(a.dataset.colorScore)) * (odd ? 1 : -1);
    return 0;
  });
  sorted.forEach((tile) => grid.append(tile));
}

function renderAbilityToggles() {
  els.abilityToggles.innerHTML = "";
  ABILITY_RULES.forEach((rule) => {
    const row = document.createElement("label");
    row.className = "toggle-row";
    row.innerHTML = `
      <input type="checkbox" data-rule="${rule.id}" ${abilityOn(rule.id) ? "checked" : ""} />
      <span><strong>${rule.name}</strong><span>${rule.description}</span></span>
    `;
    row.querySelector("input").addEventListener("change", (event) => {
      state.settings.abilities[rule.id] = event.target.checked;
      refreshPresetSummary();
      refreshUI();
    });
    els.abilityToggles.append(row);
  });
}

function setAllAbilities(enabled) {
  ABILITY_RULES.forEach((rule) => {
    state.settings.abilities[rule.id] = enabled;
  });
  renderAbilityToggles();
  refreshPresetSummary();
  if (state.players.length) refreshUI();
}

function setCoreRulesOnly() {
  setAllAbilities(false);
  ["safeRewards", "mineBonuses"].forEach((id) => {
    state.settings.abilities[id] = true;
  });
  renderAbilityToggles();
  refreshPresetSummary();
  if (state.players.length) refreshUI();
}

function abilityOn(id) {
  return state.settings.abilities[id] !== false;
}

function startConfiguredGame() {
  state.settings.mode = "single";
  state.settings.tutorial = false;
  state.settings.tutorialPaused = false;
  state.settings.ai.enabled = true;
  state.settings.preset = els.presetSelect.value;
  syncSetupControls();
  closeMenu();
  newGame();
}

function startLocalMultiplayer() {
  state.settings.mode = "local";
  state.settings.tutorial = false;
  state.settings.tutorialPaused = false;
  state.settings.ai.enabled = false;
  closeMenu();
  newGame();
}

function startTutorialDemo() {
  state.settings.mode = "tutorial";
  state.settings.tutorial = true;
  state.settings.tutorialPaused = false;
  state.settings.ai.enabled = true;
  els.playerCount.value = els.setupPlayerCount.value;
  els.themeTier.value = els.setupThemeTier.value;
  closeMenu();
  newGame();
}

function showOnlineServerPlan() {
  addLog("Online multiplayer is not connected to a server yet. Add a WebSocket server with rooms, authoritative state, and reconnect support.");
  showMenu("multiplayerMenu");
}

function toggleTutorialPause() {
  if (!state.settings.tutorial) return;
  state.settings.tutorialPaused = !state.settings.tutorialPaused;
  addLog(state.settings.tutorialPaused ? "Tutorial demo paused." : "Tutorial demo resumed.");
  refreshUI();
  if (!state.settings.tutorialPaused) maybeRunAiTurn();
}

function startCampaignLevel(level) {
  if (!isAiLevelUnlocked(level)) {
    addLog(`${AI_LEVELS[level].name} campaign is locked. Beat the previous level first.`);
    return;
  }
  state.settings.mode = "campaign";
  state.settings.tutorial = false;
  state.settings.tutorialPaused = false;
  state.settings.ai.enabled = true;
  setAiDifficulty(level);
  els.playerCount.value = "2";
  els.setupPlayerCount.value = "2";
  closeMenu();
  newGame();
}

function applyFieldTransform() {
  state.field.scale = Math.max(0.9, Math.min(1.8, state.field.scale));
  fieldRoot.rotation.y = THREE.MathUtils.degToRad(state.field.rotation);
  fieldRoot.rotation.x = THREE.MathUtils.degToRad(state.field.tilt);
  fieldRoot.scale.setScalar(state.field.scale);
  fieldRoot.position.set(state.field.panX, 0, state.field.panZ);
  els.fieldRotate.value = String(state.field.rotation);
  els.fieldTilt.value = String(state.field.tilt);
  els.fieldScale.value = String(Math.round(state.field.scale * 100));
  els.coordinateToggle.checked = state.field.coordinates;
  els.selectMode.classList.toggle("active", state.field.mode === "select");
  els.dragMode.classList.toggle("active", state.field.mode === "drag");
}

function resetFieldTransform() {
  state.field.rotation = 0;
  state.field.tilt = 0;
  state.field.scale = 1.25;
  state.field.panX = 0;
  state.field.panZ = 0;
  applyFieldTransform();
  focusActiveView();
}

function fitEntireBoard() {
  focusActiveView();
}

function focusActiveView() {
  state.field.scale = Math.max(1.15, state.field.scale || 1.25);
  const focus = selectedUnit() || ownedUnits(state.active).find((unit) => unit.type === "king") || ownedUnits(state.active)[0];
  if (focus) {
    const world = tileToWorld(focus.x, focus.y);
    state.field.panX = -world.x * 0.12;
    state.field.panZ = -world.z * 0.12;
  } else {
    state.field.panX = 0;
    state.field.panZ = 0;
  }
  applyFieldTransform();
  fitCameraToBoard(0.42);
}

function fitCameraToBoard(padding = 0.5) {
  if (!state.board?.width || !els.canvas.clientWidth || !els.canvas.clientHeight) return;
  const visibleTiles = Math.min(8, Math.max(4, state.grid || 6));
  const boardWorld = visibleTiles * TILE * padding;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const distanceByHeight = boardWorld / (2 * Math.tan(verticalFov / 2));
  const distanceByWidth = boardWorld / (2 * Math.tan(horizontalFov / 2));
  const distance = Math.max(distanceByHeight, distanceByWidth, 4.8);
  camera.position.set(0, distance * 1.12, distance * 0.92);
  camera.lookAt(0, 0, 0);
}

function playerConfig(count) {
  if (count === 2) return { grid: 7, tokens: 2000, cap: 16, typeLimit: 23 };
  if (count === 3) return { grid: 8, tokens: 1500, cap: 12, typeLimit: 10 };
  return { grid: 9, tokens: 1000, cap: 10, typeLimit: 7 };
}

function configureBoard() {
  const g = state.grid;
  const size = g * 2 + SAFE_SIZE;
  state.board = { width: size, height: size, safe: { x: g, y: g, size: SAFE_SIZE } };
  if (state.playerCount === 2) {
    state.territories = [
      { x: g + SAFE_SIZE, y: 0, w: g, h: g, bombTiles: corners(g + SAFE_SIZE, 0, g, g) },
      { x: 0, y: g + SAFE_SIZE, w: g, h: g, bombTiles: corners(0, g + SAFE_SIZE, g, g) },
    ];
  } else if (state.playerCount === 3) {
    state.territories = [
      { x: Math.floor((size - g) / 2), y: 0, w: g, h: g, bombTiles: [{ x: Math.floor((size - 2) / 2), y: 0 }, { x: Math.floor((size - 2) / 2) + 1, y: 0 }] },
      { x: 0, y: g, w: g, h: g, bombTiles: [{ x: 0, y: g + 2 }, { x: 0, y: g + 3 }] },
      { x: g + SAFE_SIZE, y: g, w: g, h: g, bombTiles: [{ x: size - 1, y: g + 2 }, { x: size - 1, y: g + 3 }] },
    ];
  } else {
    state.territories = [
      { x: 0, y: 0, w: g, h: g, bombTiles: [{ x: 0, y: 0 }] },
      { x: g + SAFE_SIZE, y: 0, w: g, h: g, bombTiles: [{ x: size - 1, y: 0 }] },
      { x: 0, y: g + SAFE_SIZE, w: g, h: g, bombTiles: [{ x: 0, y: size - 1 }] },
      { x: g + SAFE_SIZE, y: g + SAFE_SIZE, w: g, h: g, bombTiles: [{ x: size - 1, y: size - 1 }] },
    ];
  }
}

function corners(x, y, w, h) {
  return [
    { x, y },
    { x: x + w - 1, y },
    { x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 },
  ];
}

function newGame() {
  const cfg = playerConfig(Number(els.playerCount.value));
  state.playerCount = Number(els.playerCount.value);
  state.grid = cfg.grid;
  state.phase = "setup";
  state.active = 0;
  state.turn = 1;
  state.seconds = 20;
  state.moveNumber = 0;
  state.selectedUnitId = null;
  state.shopSelection = null;
  state.attackMode = false;
  modelRoot.clear();
  effectRoot.clear();
  animationRoot.clear();
  labelRoot.clear();
  animations.length = 0;
  unitMeshes.clear();
  state.units = [];
  state.mines = [];
  state.fires = [];
  state.traps = [];
  state.log = [];
  configureBoard();
  state.players = Array.from({ length: state.playerCount }, (_, i) => ({
    id: i,
    name: `Player ${i + 1} ${PLAYER_NAMES[i]}`,
    color: PLAYER_COLORS[i],
    tokens: cfg.tokens,
    alive: true,
    unitCap: cfg.cap,
    typeLimit: cfg.typeLimit,
    chosenTypes: new Set(),
    revealed: new Set(),
    treasureHome: null,
    treasureLost: false,
    capturedTreasures: new Set(),
    eliminatedBy: null,
  }));
  state.players.forEach((player) => seedRoyalPieces(player.id));
  state.players.forEach((player) => revealOwnTerritory(player.id));
  drawBoard();
  updateVisibility();
  renderShop();
  addLog("Match started. Deploy units in your own territory, then end setup turns to begin battle.");
  refreshUI();
  if (state.settings.options.autoFitBoard) fitEntireBoard();
  maybeRunAiTurn();
}

function seedRoyalPieces(playerId) {
  const t = state.territories[playerId];
  const kingTile = t.bombTiles[0];
  const treasureTile = t.bombTiles[t.bombTiles.length - 1];
  state.players[playerId].treasureHome = tileKey(treasureTile.x, treasureTile.y);
  addUnit({ type: "king", name: "King", owner: playerId, x: kingTile.x, y: kingTile.y, attack: 4, defense: 5, move: 1, model: "Pekka.glb", icon: "Pekka.png", cost: 0 });
  addUnit({ type: "treasure", name: "Treasure", owner: playerId, x: treasureTile.x, y: treasureTile.y, attack: 0, defense: 3, move: 0, model: "bomb.glb", icon: "bomb.png", cost: 0 });
}

function revealOwnTerritory(playerId) {
  const territory = state.territories[playerId];
  if (!territory) return;
  for (let y = territory.y; y < territory.y + territory.h; y++) {
    for (let x = territory.x; x < territory.x + territory.w; x++) {
      revealTile(playerId, x, y);
    }
  }
}

function addUnit(unit) {
  const full = { id: crypto.randomUUID(), hp: unit.defense ?? 1, carrying: null, usedTeleport: false, cooldown: 0, ...unit };
  state.units.push(full);
  createUnitMesh(full);
  return full;
}

function drawBoard() {
  boardGroup.clear();
  labelRoot.clear();
  fogRoot.clear();
  tileMeshes.clear();
  const theme = themePalette();
  const tileGeo = new THREE.BoxGeometry(TILE * 0.96, 0.08, TILE * 0.96);
  for (let y = 0; y < state.board.height; y++) {
    for (let x = 0; x < state.board.width; x++) {
      const zone = zoneAt(x, y);
      const color = zone.safe ? theme.safe : zone.player != null ? PLAYER_COLORS[zone.player] : theme.neutral;
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: zone.bomb ? 0.22 : 0.05 });
      const tile = new THREE.Mesh(tileGeo, mat);
      tile.position.copy(tileToWorld(x, y));
      tile.userData = { x, y, kind: "tile" };
      tile.receiveShadow = true;
      boardGroup.add(tile);
      tileMeshes.set(tileKey(x, y), tile);
    }
  }
  const lineMat = new THREE.LineBasicMaterial({ color: 0x2f3832, transparent: true, opacity: 0.75 });
  const points = [];
  for (let x = 0; x <= state.board.width; x++) {
    points.push(tileToWorldLine(x, 0), tileToWorldLine(x, state.board.height));
  }
  for (let y = 0; y <= state.board.height; y++) {
    points.push(tileToWorldLine(0, y), tileToWorldLine(state.board.width, y));
  }
  boardGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), lineMat));
  drawCoordinateLabels();
  drawCloudFog();
  fitCameraToBoard();
}

function drawCloudFog() {
  fogRoot.clear();
  if (!state.settings.options.showCloudFog) return;
  for (let y = 0; y < state.board.height; y++) {
    for (let x = 0; x < state.board.width; x++) {
      const zone = zoneAt(x, y);
      const cloud = makeCloudTile(x, y);
      cloud.userData = { x, y, kind: "cloud" };
      fogRoot.add(cloud);
    }
  }
}

function makeCloudTile(x, y) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: state.settings.options.highContrast ? 0xf4f7f2 : 0xc9d4d0,
    transparent: true,
    opacity: state.settings.options.highContrast ? 0.78 : 0.62,
    roughness: 0.95,
    depthWrite: false,
  });
  const offsets = [
    [-0.22, 0, 0.15],
    [0.04, 0, 0.06],
    [0.24, 0, 0.18],
    [-0.02, 0, -0.12],
  ];
  offsets.forEach(([ox, oy, oz], index) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.23 + index * 0.035, 12, 8), material.clone());
    puff.scale.y = 0.34;
    puff.position.set(ox, 0.28 + oy, oz);
    group.add(puff);
  });
  group.position.copy(tileToWorld(x, y));
  return group;
}

function highlightPlayerTerritory(playerId) {
  if (!state.settings.options.territoryHints) return;
  const territory = state.territories[playerId];
  if (!territory) return;
  for (let y = territory.y; y < territory.y + territory.h; y++) {
    for (let x = territory.x; x < territory.x + territory.w; x++) {
      playTerritoryPulse(x, y, PLAYER_COLORS[playerId]);
    }
  }
}

function playTerritoryPulse(x, y, color) {
  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(TILE * 0.9, 0.045, TILE * 0.9),
    new THREE.MeshStandardMaterial({ color, emissive: color, transparent: true, opacity: 0.28 }),
  );
  marker.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.12, 0));
  animationRoot.add(marker);
  animateObject(marker, 900, (t) => {
    marker.material.opacity = 0.32 * (1 - t);
    marker.position.y = 0.12 + Math.sin(Math.PI * t) * 0.12;
  }, () => animationRoot.remove(marker));
}

function drawCoordinateLabels() {
  labelRoot.clear();
  if (!state.field.coordinates) return;
  for (let y = 0; y < state.board.height; y++) {
    for (let x = 0; x < state.board.width; x++) {
      const label = makeCoordinateLabel(x, y);
      label.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.105, 0.34));
      label.rotation.x = -Math.PI / 2;
      label.userData = { x, y, kind: "label" };
      labelRoot.add(label);
    }
  }
}

function makeCoordinateLabel(x, y) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const zone = zoneAt(x, y);
  const fill = zone.player == null ? "rgba(242,241,233,0.82)" : `#${PLAYER_COLORS[zone.player].toString(16).padStart(6, "0")}`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(6, 8, 7, 0.72)";
  roundRect(ctx, 10, 10, 108, 44, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(242,241,233,0.38)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.font = "700 25px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${columnName(x)}${y + 1}`, 64, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.48, 0.24, 1);
  return sprite;
}

function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const mod = (n - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    n = Math.floor((n - mod) / 26);
  }
  return name;
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function themePalette() {
  const id = els.themeTier.value;
  const palettes = {
    standard: { neutral: 0x263029, safe: 0xe7e0c3 },
    galactic: { neutral: 0x1b2440, safe: 0x9fd9ff },
    legends: { neutral: 0x31283e, safe: 0xf1c76a },
    stage: { neutral: 0x30222d, safe: 0xffc15e },
    arena: { neutral: 0x2f3029, safe: 0xffffff },
    cyber: { neutral: 0x122b2a, safe: 0x56ffd6 },
    mythic: { neutral: 0x28233a, safe: 0xc9b0ff },
    world: { neutral: 0x223027, safe: 0xd6e6d1 },
    wilderness: { neutral: 0x24341f, safe: 0xf2df9b },
  };
  return palettes[id] ?? palettes.standard;
}

function createUnitMesh(unit) {
  const holder = new THREE.Group();
  holder.userData = { unitId: unit.id, kind: "unit" };
  holder.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.18, 0));
  unitMeshes.set(unit.id, holder);
  modelRoot.add(holder);

  const fallback = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.36, 0.62, 10),
    new THREE.MeshStandardMaterial({ color: unit.owner == null ? 0xffffff : PLAYER_COLORS[unit.owner], roughness: 0.55 }),
  );
  fallback.position.y = 0.35;
  holder.add(fallback);
  if (unit.spawnAnim) {
    playDeployAnimation(unit);
    unit.spawnAnim = false;
  }
  loadModel(unit).then((model) => {
    holder.clear();
    const clone = model.clone(true);
    fitModel(clone);
    tintModel(clone, unit.owner);
    holder.add(clone);
  });
}

function animateObject(object, duration, update, done) {
  object.userData.animating = true;
  animations.push({ object, start: performance.now(), duration: adjustedDuration(duration), update, done });
}

function adjustedDuration(duration) {
  if (state.settings.options.reducedMotion) return Math.max(120, duration * 0.35);
  const speed = state.settings.options.animationSpeed;
  if (speed === "slow") return duration * 1.45;
  if (speed === "fast") return duration * 0.72;
  return duration;
}

function playDeployAnimation(unit) {
  const mesh = unitMeshes.get(unit.id);
  if (!mesh) return;
  const baseY = 0.18;
  mesh.position.y = baseY + 2.2;
  mesh.scale.setScalar(0.45);
  animateObject(mesh, 520, (t) => {
    const eased = easeOutBack(t);
    mesh.position.y = baseY + (1 - eased) * 2.2;
    mesh.scale.setScalar(0.45 + eased * 0.55);
  });
  playRing(unit.x, unit.y, PLAYER_COLORS[unit.owner], 0.8);
  playUnitEntranceEffect(unit);
}

function playMoveAnimation(unit, from, to) {
  const mesh = unitMeshes.get(unit.id);
  if (!mesh) return;
  const start = tileToWorld(from.x, from.y).add(new THREE.Vector3(0, 0.18, 0));
  const end = tileToWorld(to.x, to.y).add(new THREE.Vector3(0, 0.18, 0));
  animateObject(mesh, 760, (t) => {
    const eased = easeInOut(t);
    mesh.position.lerpVectors(start, end, eased);
    mesh.position.y += Math.sin(Math.PI * eased) * 0.62;
  });
  if (state.settings.options.showMoveTrails) playMovePathLine(from, to, PLAYER_COLORS[unit.owner]);
  if (unit.type === "horseman") playDustTrail(from, to);
  if (unit.type === "phantom") playPhantomTrail(from, to);
  if (unit.type === "seeker") playSeekerScan(unit, 2.4);
  if (unit.type === "merchant") playCoinSpiral(unit.x, unit.y);
}

function playMovePathLine(from, to, color) {
  const start = tileToWorld(from.x, from.y).add(new THREE.Vector3(0, 0.22, 0));
  const end = tileToWorld(to.x, to.y).add(new THREE.Vector3(0, 0.22, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }),
  );
  animationRoot.add(line);
  animateObject(line, 820, (t) => {
    line.material.opacity = 0.85 * (1 - t);
  }, () => animationRoot.remove(line));
}

function playAttackAnimation(attacker, defender) {
  const mesh = unitMeshes.get(attacker.id);
  if (!mesh) return;
  const start = tileToWorld(attacker.x, attacker.y).add(new THREE.Vector3(0, 0.18, 0));
  const target = tileToWorld(defender.x, defender.y).add(new THREE.Vector3(0, 0.18, 0));
  const lunge = start.clone().lerp(target, 0.35);
  animateObject(mesh, 300, (t) => {
    const forward = t < 0.5 ? t * 2 : (1 - t) * 2;
    mesh.position.lerpVectors(start, lunge, easeInOut(forward));
  });
  playRing(defender.x, defender.y, 0xff6d4d, 0.65);
}

function playUnitEntranceEffect(unit) {
  if (["singleBomber", "doubleBomber", "tripleBomber"].includes(unit.type)) playBombArmingEffect(unit);
  else if (unit.type === "seeker") playSeekerScan(unit, 3.2);
  else if (unit.type === "warden") playWardenAura(unit);
  else if (unit.type === "phantom") playPhantomVanish(unit);
  else if (unit.type === "teleporter") playTeleportEffect(unit);
  else if (unit.type === "sentinel") playSentinelWake(unit);
  else if (unit.type === "burrower") playBurrowWake(unit);
  else if (unit.type === "pyromancer") playFlameColumn(unit.x, unit.y);
  else if (unit.type === "marksman") playTargetReticle(unit.x, unit.y, 0x9fd9ff);
  else if (unit.type === "disruptor") playDisruptorWave(unit);
  else if (unit.type === "chrono") playChronoSwirl(unit);
  else if (unit.type === "engineer") playBuildSparks(unit.x, unit.y);
  else if (unit.type === "merchant") playCoinSpiral(unit.x, unit.y);
  else if (unit.type === "infantry") playRing(unit.x, unit.y, 0xf2f1e9, 0.55);
}

function playBombArmingEffect(unit) {
  const bomb = makeBombMesh(0.16);
  bomb.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.75, 0));
  animationRoot.add(bomb);
  animateObject(bomb, 760, (t) => {
    bomb.rotation.y = t * Math.PI * 4;
    bomb.position.y = 0.75 + Math.sin(t * Math.PI * 2) * 0.18;
    bomb.scale.setScalar(1 + Math.sin(t * Math.PI * 5) * 0.18);
  }, () => animationRoot.remove(bomb));
  playTargetReticle(unit.x, unit.y, 0xff7138);
}

function playBombDropAnimation(attacker, target) {
  const start = tileToWorld(attacker.x, attacker.y).add(new THREE.Vector3(0, 1.35, 0));
  const end = tileToWorld(target.x, target.y).add(new THREE.Vector3(0, 0.28, 0));
  const bomb = makeBombMesh(0.2);
  bomb.position.copy(start);
  animationRoot.add(bomb);
  animateObject(bomb, 620, (t) => {
    const eased = easeInOut(t);
    bomb.position.lerpVectors(start, end, eased);
    bomb.position.y += Math.sin(Math.PI * eased) * 1.1;
    bomb.rotation.x = t * Math.PI * 8;
  }, () => {
    animationRoot.remove(bomb);
    playBlastAnimation(target.x, target.y);
  });
}

function makeBombMesh(radius) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 10),
    new THREE.MeshStandardMaterial({ color: 0x161817, roughness: 0.35, metalness: 0.35 }),
  );
  const fuse = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.12, radius * 0.12, radius * 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8c85b, emissive: 0x4a3100 }),
  );
  fuse.position.set(radius * 0.45, radius * 0.78, 0);
  fuse.rotation.z = -0.55;
  group.add(body, fuse);
  return group;
}

function playSeekerScan(unit, radius) {
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.018, 8, 48),
      new THREE.MeshStandardMaterial({ color: 0x79ddff, emissive: 0x0d5f76, transparent: true, opacity: 0.78 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.23 + i * 0.04, 0));
    animationRoot.add(ring);
    animateObject(ring, 980 + i * 120, (t) => {
      const delayed = Math.max(0, t - i * 0.12);
      ring.scale.setScalar(0.4 + delayed * radius);
      ring.material.opacity = Math.max(0, 0.78 * (1 - delayed));
    }, () => animationRoot.remove(ring));
  }
  playScanBeam(unit.x, unit.y);
}

function playScanBeam(x, y) {
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.38, 1.9, 28, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x79ddff, emissive: 0x123f55, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
  );
  beam.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.95, 0));
  beam.rotation.x = Math.PI;
  animationRoot.add(beam);
  animateObject(beam, 900, (t) => {
    beam.rotation.y = t * Math.PI * 2.4;
    beam.material.opacity = 0.32 * (1 - t);
  }, () => animationRoot.remove(beam));
}

function playWardenAura(unit) {
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(0.92, 28, 14),
    new THREE.MeshStandardMaterial({ color: 0x8fd0ff, emissive: 0x143a5c, transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
  );
  shield.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.65, 0));
  animationRoot.add(shield);
  animateObject(shield, 1150, (t) => {
    shield.scale.setScalar(0.35 + t * 1.25);
    shield.material.opacity = 0.2 * (1 - t);
  }, () => animationRoot.remove(shield));
  playRing(unit.x, unit.y, 0x8fd0ff, 1.5);
}

function playPhantomVanish(unit) {
  playRing(unit.x, unit.y, 0xbda7ff, 1.15);
  const mist = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 10),
    new THREE.MeshStandardMaterial({ color: 0xbda7ff, emissive: 0x241747, transparent: true, opacity: 0.22 }),
  );
  mist.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.45, 0));
  animationRoot.add(mist);
  animateObject(mist, 760, (t) => {
    mist.scale.setScalar(0.4 + t * 1.7);
    mist.material.opacity = 0.22 * (1 - t);
  }, () => animationRoot.remove(mist));
}

function playPhantomTrail(from, to) {
  const start = tileToWorld(from.x, from.y).add(new THREE.Vector3(0, 0.24, 0));
  const end = tileToWorld(to.x, to.y).add(new THREE.Vector3(0, 0.24, 0));
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xbda7ff, transparent: true, opacity: 0.2 }),
    );
    puff.position.lerpVectors(start, end, i / 3);
    animationRoot.add(puff);
    animateObject(puff, 680, (t) => {
      puff.position.y += 0.01;
      puff.scale.setScalar(1 + t * 1.8);
      puff.material.opacity = 0.2 * (1 - t);
    }, () => animationRoot.remove(puff));
  }
}

function playTeleportEffect(unit) {
  const color = 0x66ddff;
  playRing(unit.x, unit.y, color, 1.45);
  for (let i = 0; i < 6; i++) {
    const shard = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.46, 0.06),
      new THREE.MeshStandardMaterial({ color, emissive: 0x0b5260, transparent: true, opacity: 0.82 }),
    );
    const angle = (i / 6) * Math.PI * 2;
    shard.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(Math.cos(angle) * 0.45, 0.55, Math.sin(angle) * 0.45));
    animationRoot.add(shard);
    animateObject(shard, 780, (t) => {
      shard.position.y = 0.35 + t * 1.4;
      shard.rotation.y = t * Math.PI * 3;
      shard.material.opacity = 0.82 * (1 - t);
    }, () => animationRoot.remove(shard));
  }
}

function playSentinelWake(unit) {
  playRing(unit.x, unit.y, 0xffc65a, 1.2);
  playTargetReticle(unit.x, unit.y, 0xffc65a);
}

function playBurrowWake(unit) {
  playRing(unit.x, unit.y, 0xb08a5d, 1.1);
  for (let i = 0; i < 6; i++) {
    const clod = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x7d5a38, roughness: 0.9 }),
    );
    const angle = (i / 6) * Math.PI * 2;
    clod.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(Math.cos(angle) * 0.2, 0.2, Math.sin(angle) * 0.2));
    animationRoot.add(clod);
    animateObject(clod, 720, (t) => {
      clod.position.x += Math.cos(angle) * t * 0.7;
      clod.position.z += Math.sin(angle) * t * 0.7;
      clod.position.y = 0.2 + Math.sin(Math.PI * t) * 0.45;
      clod.scale.setScalar(1 - t * 0.55);
    }, () => animationRoot.remove(clod));
  }
}

function playFlameColumn(x, y) {
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1.15, 12),
    new THREE.MeshStandardMaterial({ color: 0xff7138, emissive: 0x8c1c00, transparent: true, opacity: 0.88 }),
  );
  flame.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.65, 0));
  animationRoot.add(flame);
  animateObject(flame, 760, (t) => {
    flame.scale.setScalar(0.6 + Math.sin(Math.PI * t) * 0.9);
    flame.rotation.y = t * Math.PI * 2;
    flame.material.opacity = 0.88 * (1 - t);
  }, () => animationRoot.remove(flame));
}

function playMarksmanShot(attacker, defender) {
  const start = tileToWorld(attacker.x, attacker.y).add(new THREE.Vector3(0, 0.82, 0));
  const end = tileToWorld(defender.x, defender.y).add(new THREE.Vector3(0, 0.58, 0));
  const bolt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.62, 8),
    new THREE.MeshStandardMaterial({ color: 0x9fd9ff, emissive: 0x1b6688 }),
  );
  bolt.rotation.z = Math.PI / 2;
  bolt.position.copy(start);
  animationRoot.add(bolt);
  animateObject(bolt, 360, (t) => {
    bolt.position.lerpVectors(start, end, easeInOut(t));
  }, () => {
    animationRoot.remove(bolt);
    playTargetReticle(defender.x, defender.y, 0x9fd9ff);
  });
}

function playDisruptorWave(unit) {
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.02, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0xff5ac8, emissive: 0x561440, transparent: true, opacity: 0.75 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.24 + i * 0.18, 0));
    animationRoot.add(ring);
    animateObject(ring, 820 + i * 120, (t) => {
      ring.scale.setScalar(0.4 + t * 1.8);
      ring.material.opacity = 0.75 * (1 - t);
    }, () => animationRoot.remove(ring));
  }
}

function playChronoSwirl(unit) {
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.42 + i * 0.11, 0.018, 8, 28, Math.PI * 1.4),
      new THREE.MeshStandardMaterial({ color: 0xc8b3ff, emissive: 0x2d1d57, transparent: true, opacity: 0.72 }),
    );
    arc.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.45 + i * 0.12, 0));
    arc.rotation.x = Math.PI / 2;
    animationRoot.add(arc);
    animateObject(arc, 900, (t) => {
      arc.rotation.z = -t * Math.PI * 3 + i;
      arc.material.opacity = 0.72 * (1 - t);
    }, () => animationRoot.remove(arc));
  }
}

function playBuildSparks(x, y) {
  for (let i = 0; i < 9; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffd66b, emissive: 0x9c5d00, transparent: true, opacity: 0.92 }),
    );
    const angle = (i / 9) * Math.PI * 2;
    spark.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.45, 0));
    animationRoot.add(spark);
    animateObject(spark, 520, (t) => {
      spark.position.x += Math.cos(angle) * t * 0.55;
      spark.position.z += Math.sin(angle) * t * 0.55;
      spark.position.y = 0.45 + Math.sin(Math.PI * t) * 0.42;
      spark.material.opacity = 0.92 * (1 - t);
    }, () => animationRoot.remove(spark));
  }
}

function playCoinSpiral(x, y) {
  for (let i = 0; i < 7; i++) {
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.018, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8c85b, emissive: 0x4a3100, metalness: 0.45, roughness: 0.28, transparent: true, opacity: 0.95 }),
    );
    coin.rotation.x = Math.PI / 2;
    coin.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.32, 0));
    animationRoot.add(coin);
    animateObject(coin, 920, (t) => {
      const angle = i + t * Math.PI * 2;
      coin.position.x = tileToWorld(x, y).x + Math.cos(angle) * (0.18 + t * 0.45);
      coin.position.z = tileToWorld(x, y).z + Math.sin(angle) * (0.18 + t * 0.45);
      coin.position.y = 0.32 + t * 0.9;
      coin.rotation.z = t * Math.PI * 5;
      coin.material.opacity = 0.95 * (1 - t);
    }, () => animationRoot.remove(coin));
  }
}

function playDustTrail(from, to) {
  const start = tileToWorld(from.x, from.y).add(new THREE.Vector3(0, 0.14, 0));
  const end = tileToWorld(to.x, to.y).add(new THREE.Vector3(0, 0.14, 0));
  for (let i = 0; i < 5; i++) {
    const dust = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xb8a782, transparent: true, opacity: 0.28 }),
    );
    dust.position.lerpVectors(start, end, i / 4);
    animationRoot.add(dust);
    animateObject(dust, 580, (t) => {
      dust.scale.setScalar(1 + t * 1.8);
      dust.material.opacity = 0.28 * (1 - t);
    }, () => animationRoot.remove(dust));
  }
}

function playTargetReticle(x, y, color) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.018, 8, 32),
    new THREE.MeshStandardMaterial({ color, emissive: color, transparent: true, opacity: 0.8 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.2, 0));
  animationRoot.add(ring);
  animateObject(ring, 680, (t) => {
    ring.scale.setScalar(1 + Math.sin(Math.PI * t) * 0.55);
    ring.material.opacity = 0.8 * (1 - t);
  }, () => animationRoot.remove(ring));
}

function playAbilityAnimation(unit, color = 0x9b7bd7) {
  playRing(unit.x, unit.y, color, 1.1);
  const mesh = unitMeshes.get(unit.id);
  if (!mesh) return;
  const original = mesh.scale.x;
  animateObject(mesh, 520, (t) => {
    mesh.scale.setScalar(original + Math.sin(Math.PI * t) * 0.22);
  }, () => mesh.scale.setScalar(original));
}

function playRing(x, y, color, maxScale) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.025, 8, 32),
    new THREE.MeshStandardMaterial({ color, emissive: color, transparent: true, opacity: 0.92 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.18, 0));
  animationRoot.add(ring);
  animateObject(ring, 620, (t) => {
    ring.scale.setScalar(0.2 + t * maxScale);
    ring.material.opacity = 0.92 * (1 - t);
  }, () => animationRoot.remove(ring));
}

function playBlastAnimation(x, y, color = 0xff7138) {
  const burst = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 10),
    new THREE.MeshStandardMaterial({ color, emissive: color, transparent: true, opacity: 0.75 }),
  );
  burst.position.copy(tileToWorld(x, y)).add(new THREE.Vector3(0, 0.55, 0));
  animationRoot.add(burst);
  animateObject(burst, 540, (t) => {
    burst.scale.setScalar(0.35 + t * 2.4);
    burst.material.opacity = 0.75 * (1 - t);
  }, () => animationRoot.remove(burst));
}

function updateAnimations() {
  const now = performance.now();
  for (let i = animations.length - 1; i >= 0; i--) {
    const anim = animations[i];
    const t = Math.min(1, (now - anim.start) / anim.duration);
    anim.update(t);
    if (t >= 1) {
      anim.object.userData.animating = false;
      anim.done?.();
      animations.splice(i, 1);
    }
  }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

async function loadModel(unit) {
  const file = unit.model || UNIT_TYPES.find((u) => u.id === unit.type)?.model;
  if (!file) throw new Error(`No model for ${unit.type}`);
  if (modelCache.has(file)) return modelCache.get(file);
  const promise = new Promise((resolve, reject) => {
    loader.load(`./3D/${encodeURIComponent(file)}`, (gltf) => resolve(gltf.scene), undefined, reject);
  });
  modelCache.set(file, promise);
  return promise;
}

function fitModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  object.scale.multiplyScalar(0.82 / maxAxis);
  const fitted = new THREE.Box3().setFromObject(object);
  object.position.y -= fitted.min.y;
}

function tintModel(object, owner) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = child.material.clone();
    if (owner != null) child.material.emissive = new THREE.Color(PLAYER_COLORS[owner]).multiplyScalar(0.09);
  });
}

function tileToWorld(x, y) {
  return new THREE.Vector3((x - state.board.width / 2 + 0.5) * TILE, 0, (y - state.board.height / 2 + 0.5) * TILE);
}

function tileToWorldLine(x, y) {
  return new THREE.Vector3((x - state.board.width / 2) * TILE, 0.055, (y - state.board.height / 2) * TILE);
}

function tileKey(x, y) {
  return `${x},${y}`;
}

function zoneAt(x, y) {
  const safe = x >= state.board.safe.x && x < state.board.safe.x + SAFE_SIZE && y >= state.board.safe.y && y < state.board.safe.y + SAFE_SIZE;
  const player = state.territories.findIndex((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
  const bomb = player >= 0 && state.territories[player].bombTiles.some((tile) => tile.x === x && tile.y === y);
  return { safe, player: player >= 0 ? player : null, bomb };
}

function renderShop() {
  els.shop.innerHTML = "";
  UNIT_TYPES.forEach((unit) => {
    const card = document.createElement("button");
    card.className = "unit-card";
    card.type = "button";
    card.dataset.unit = unit.id;
    card.innerHTML = `
      <img src="./units/${unit.icon}" alt="" />
      <span><strong>${unit.name}</strong><span>${unit.cost} tokens | ${unit.move} tile | ${unit.role}</span></span>
    `;
    card.addEventListener("click", () => {
      state.shopSelection = unit.id;
      state.selectedUnitId = null;
      state.attackMode = false;
      refreshUI();
    });
    els.shop.append(card);
  });
}

function selectedUnit() {
  return state.units.find((unit) => unit.id === state.selectedUnitId);
}

function activePlayer() {
  return state.players[state.active];
}

function refreshUI() {
  const player = activePlayer();
  const cfg = playerConfig(state.playerCount);
  els.activePlayer.textContent = player.name;
  els.activePlayer.style.color = `#${PLAYER_COLORS[player.id].toString(16).padStart(6, "0")}`;
  els.turnTimer.textContent = `${state.seconds}s`;
  els.tokenCount.textContent = player.tokens;
  els.moveCost.textContent = nextMoveCost();
  els.unitCap.textContent = `${ownedUnits(player.id).length}/${cfg.cap}`;
  els.gridSize.textContent = `${state.grid}x${state.grid}`;
  els.typeLimit.textContent = state.playerCount === 2 ? "All types" : `${cfg.typeLimit} types`;
  els.phaseBadge.textContent = state.phase === "setup" ? "Setup" : `Turn ${state.turn}`;
  els.phaseText.textContent = state.phase === "setup" ? "Deploy units in your territory. Kings and treasures start on bomb-proof tiles." : "Move, attack, build mines, steal treasure, or pass before the timer expires.";
  updateMiniSlot(player);
  els.pauseTutorial.hidden = !state.settings.tutorial || state.phase === "complete";
  els.pauseTutorial.textContent = state.settings.tutorialPaused ? "Resume Demo" : "Pause Demo";
  els.selectionText.textContent = state.shopSelection
    ? `Deploy ${unitDef(state.shopSelection).name}: click an empty tile in your territory.`
    : selectedUnit()
      ? `${selectedUnit().name} selected. Click a legal tile to move, or use an action.`
      : "Select a unit or deploy from the shop.";
  document.querySelectorAll(".unit-card").forEach((card) => card.classList.toggle("active", card.dataset.unit === state.shopSelection));
  const unit = selectedUnit();
  els.selectedUnit.innerHTML = unit
    ? `<strong>${unit.name}</strong><br>Owner: Player ${unit.owner + 1}<br>Tile: ${unit.x + 1}, ${unit.y + 1}<br>Attack ${unit.attack} | Defense ${effectiveDefense(unit)} | Move ${unit.move}${unit.carrying != null ? "<br>Carrying treasure" : ""}`
    : "No unit selected.";
  els.attack.disabled = !unit || unit.owner !== state.active || unit.attack <= 0;
  els.ability.disabled = !unit || unit.owner !== state.active || !unitAbilityAvailable(unit);
  els.mine.disabled = state.phase === "setup" || player.tokens < 200 || occupiedByUnit(selectedUnit()?.x, selectedUnit()?.y)?.type !== "engineer" || !abilityOn("engineerTools");
  els.ruleState.innerHTML = ruleStateItems().map((item) => `<li>${item}</li>`).join("");
  els.battleLog.innerHTML = state.log.slice(-18).reverse().map((line) => `<div class="log-entry">${line}</div>`).join("");
  drawEffects();
  updateVisualState();
}

function updateMiniSlot(player = activePlayer()) {
  if (!els.miniSlotText || !player) return;
  els.miniSlotText.textContent = `${state.ui.reels} Reels`;
  if (els.slotReelDisplay) els.slotReelDisplay.textContent = state.ui.reels;
  const income = state.phase === "battle" ? 100 + treasureIncome(player.id) + mineIncome(player.id) : 0;
  els.miniSlotText.title = state.phase === "battle" ? `${player.name} turn: +${income} tokens next turn` : "Choose 3 to 6 reels";
}

function spinMiniSlots() {
  const won = Math.random() > 0.58;
  const result = won ? `You won ${state.ui.wager * state.ui.reels} tokens` : `You lost ${state.ui.wager} tokens`;
  if (els.slotResultText) els.slotResultText.textContent = result;
  addLog(`Mini slots: ${result}.`);
  els.slotLever?.classList.add("pulled");
  els.slotLeverLarge?.classList.add("pulled");
  setTimeout(() => {
    els.slotLever?.classList.remove("pulled");
    els.slotLeverLarge?.classList.remove("pulled");
  }, 260);
}

function unitAbilityAvailable(unit) {
  if (!unit) return false;
  if (unit.type === "teleporter") return abilityOn("teleport") && !unit.usedTeleport;
  if (unit.type === "seeker") return abilityOn("seekerReveal");
  if (unit.type === "warden") return abilityOn("wardenBuff");
  if (unit.type === "sentinel") return abilityOn("sentinelGuard");
  if (unit.type === "burrower") return abilityOn("burrow") && unit.cooldown <= 0;
  if (unit.type === "pyromancer") return abilityOn("fire");
  if (unit.type === "marksman") return abilityOn("marksmanRange");
  if (unit.type === "disruptor") return true;
  if (unit.type === "chrono") return abilityOn("chrono");
  if (unit.type === "engineer") return abilityOn("engineerTools");
  if (unit.type === "merchant") return abilityOn("merchantBoost");
  return false;
}

function drawEffects() {
  effectRoot.clear();
  for (const mine of state.mines) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xe8c85b, emissive: 0x3a2c08, roughness: 0.38 }),
    );
    mesh.position.copy(tileToWorld(mine.x, mine.y)).add(new THREE.Vector3(0, 0.16, 0));
    effectRoot.add(mesh);
  }
  for (const fire of state.fires) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.52, 10),
      new THREE.MeshStandardMaterial({ color: 0xff7138, emissive: 0x7a1800, transparent: true, opacity: 0.82 }),
    );
    mesh.position.copy(tileToWorld(fire.x, fire.y)).add(new THREE.Vector3(0, 0.32, 0));
    effectRoot.add(mesh);
  }
  for (const trap of state.traps) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.025, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0xb8bec1, roughness: 0.45 }),
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.position.copy(tileToWorld(trap.x, trap.y)).add(new THREE.Vector3(0, 0.15, 0));
    effectRoot.add(mesh);
  }
}

function ruleStateItems() {
  const player = activePlayer();
  return [
    `Income: +100 tokens at each surviving turn start.`,
    `Movement escalates this turn: next move costs ${nextMoveCost()} tokens.`,
    `Mines active: ${state.mines.length}. Friendly mines pay 25, enemy territory mines pay 75.`,
    `Returned treasures: ${player.capturedTreasures.size}/${state.playerCount - 1} (+${treasureIncome(player.id)}/turn).`,
    `Visible enemy tiles: ${player.revealed.size}.`,
  ];
}

function updateVisualState() {
  const player = activePlayer();
  for (const [key, mesh] of tileMeshes) {
    const [x, y] = key.split(",").map(Number);
    const zone = zoneAt(x, y);
    const hidden = zone.player !== player.id && !player.revealed.has(key);
    mesh.material.opacity = hidden ? 0.27 : 1;
    mesh.material.transparent = hidden;
    mesh.position.y = zone.bomb ? 0.03 : 0;
  }
  for (const unit of state.units) {
    const mesh = unitMeshes.get(unit.id);
    if (!mesh) continue;
    const zone = zoneAt(unit.x, unit.y);
    const hidden = unit.owner !== player.id && unit.owner != null && !player.revealed.has(tileKey(unit.x, unit.y));
    mesh.visible = !hidden && state.players[unit.owner]?.alive !== false;
    if (!mesh.userData.animating) {
      mesh.position.copy(tileToWorld(unit.x, unit.y)).add(new THREE.Vector3(0, 0.18, 0));
      mesh.scale.setScalar(unit.id === state.selectedUnitId ? 1.22 : 1);
    }
  }
  for (const mesh of effectRoot.children) {
    const x = Math.round(mesh.position.x / TILE + state.board.width / 2 - 0.5);
    const y = Math.round(mesh.position.z / TILE + state.board.height / 2 - 0.5);
    const zone = zoneAt(x, y);
    mesh.visible = zone.player === player.id || player.revealed.has(tileKey(x, y));
  }
  for (const label of labelRoot.children) {
    const { x, y } = label.userData;
    const zone = zoneAt(x, y);
    const hiddenByFog = zone.player !== player.id && !player.revealed.has(tileKey(x, y));
    label.visible = state.field.coordinates && !hiddenByFog;
  }
  for (const cloud of fogRoot.children) {
    const { x, y } = cloud.userData;
    const zone = zoneAt(x, y);
    cloud.visible = Boolean(state.settings.options.showCloudFog) && zone.player !== player.id && !player.revealed.has(tileKey(x, y));
    cloud.children.forEach((puff, index) => {
      puff.position.y = 0.28 + Math.sin(performance.now() * 0.0015 + x + y + index) * 0.025;
    });
  }
}

function ownedUnits(playerId) {
  return state.units.filter((unit) => unit.owner === playerId && unit.type !== "treasure");
}

function unitDef(id) {
  return UNIT_TYPES.find((unit) => unit.id === id);
}

function nextMoveCost() {
  if (state.moveNumber === 0) return 100;
  let cost = 100;
  for (let i = 0; i < state.moveNumber; i++) cost = Math.ceil((cost * 1.5) / 50) * 50;
  return cost;
}

function clickCanvas(event) {
  if (state.field.suppressClick) {
    state.field.suppressClick = false;
    return;
  }
  const rect = els.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...modelRoot.children, ...boardGroup.children], true);
  const hit = hits.find((item) => item.object.userData.kind || item.object.parent?.userData.kind);
  if (!hit) return;
  let obj = hit.object;
  while (obj && !obj.userData.kind) obj = obj.parent;
  if (obj?.userData.kind === "unit") {
    const unit = state.units.find((u) => u.id === obj.userData.unitId);
    if (unit) handleUnitClick(unit);
    return;
  }
  if (obj?.userData.kind === "tile") handleTileClick(obj.userData.x, obj.userData.y);
}

function handleUnitClick(unit) {
  if (state.attackMode && selectedUnit()) {
    attackUnit(selectedUnit(), unit);
    return;
  }
  if (unit.owner === state.active) {
    state.selectedUnitId = unit.id;
    state.shopSelection = null;
    state.attackMode = false;
    refreshUI();
  }
}

function handleTileClick(x, y) {
  if (state.shopSelection) {
    deployUnit(x, y);
    return;
  }
  const unit = selectedUnit();
  if (!unit || unit.owner !== state.active) return;
  moveUnit(unit, x, y);
}

function deployUnit(x, y) {
  const def = unitDef(state.shopSelection);
  const player = activePlayer();
  if (state.phase !== "setup") return addLog("Deployment is only available during setup.");
  if (zoneAt(x, y).player !== player.id) {
    highlightPlayerTerritory(player.id);
    return addLog("Units must deploy in your own territory. Your legal area is highlighted.");
  }
  if (occupiedByUnit(x, y)) return addLog("That tile is occupied.");
  if (ownedUnits(player.id).length >= player.unitCap) return addLog("Unit cap reached.");
  const boardTypes = new Set(ownedUnits(player.id).filter((unit) => unit.type !== "king").map((unit) => unit.type));
  if (!boardTypes.has(def.id) && boardTypes.size >= 5) return addLog("Max 5 different unit types can be on your board at once.");
  if (!player.chosenTypes.has(def.id) && player.chosenTypes.size >= player.typeLimit) return addLog("Unit type selection limit reached for this player count.");
  if (player.tokens < def.cost) return addLog("Not enough tokens.");
  player.tokens -= def.cost;
  player.chosenTypes.add(def.id);
  addUnit({ ...def, type: def.id, owner: player.id, x, y, spawnAnim: true });
  addLog(`${player.name} deployed ${def.name}.`);
  refreshUI();
}

function moveUnit(unit, x, y) {
  if (state.phase === "setup") return addLog("End setup before moving units.");
  if (!insideBoard(x, y)) return;
  if (occupiedByUnit(x, y)) return addLog("Destination occupied.");
  if (unit.move <= 0) return addLog(`${unit.name} cannot move.`);
  const cost = nextMoveCost();
  const player = activePlayer();
  if (player.tokens < cost) return addLog("Not enough tokens for movement.");
  const distance = Math.abs(unit.x - x) + Math.abs(unit.y - y);
  if (distance > unit.move) return addLog(`${unit.name} can move ${unit.move} tile(s).`);
  player.tokens -= cost;
  state.moveNumber += 1;
  const previous = { x: unit.x, y: unit.y };
  unit.x = x;
  unit.y = y;
  playMoveAnimation(unit, previous, { x, y });
  revealAround(unit);
  resolveTileEffects(unit, previous);
  addLog(`${player.name} moved ${unit.name} for ${cost} tokens.`);
  checkWinConditions();
  refreshUI();
}

function attackUnit(attacker, defender) {
  state.attackMode = false;
  if (attacker.owner === defender.owner) return refreshUI();
  if (zoneAt(defender.x, defender.y).safe) {
    addLog("The central safe zone is immune to attacks.");
    return refreshUI();
  }
  const range = attacker.type === "marksman" && abilityOn("marksmanRange") ? 2 : 1;
  const distance = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);
  if (distance > range) {
    addLog(`${attacker.name} is out of attack range.`);
    return refreshUI();
  }
  let damage = attacker.attack;
  let defense = effectiveDefense(defender);
  if (attacker.type === "marksman" && abilityOn("marksmanRange")) defense = Math.max(0, defense - 1);
  if (attacker.type === "phantom") damage = 0;
  if (["singleBomber", "doubleBomber", "tripleBomber"].includes(attacker.type) && abilityOn("bomberBlasts")) {
    playBombDropAnimation(attacker, defender);
    blastAttack(attacker, defender);
    checkWinConditions();
    refreshUI();
    return;
  }
  if (attacker.type === "marksman" && abilityOn("marksmanRange")) {
    playMarksmanShot(attacker, defender);
  } else if (attacker.type === "disruptor") {
    playDisruptorWave(attacker);
    playAttackAnimation(attacker, defender);
  } else {
    playAttackAnimation(attacker, defender);
  }
  defender.hp -= Math.max(1, damage - Math.floor(defense / 2));
  revealTile(attacker.owner, defender.x, defender.y);
  addLog(`${attacker.name} attacked ${defender.name}.`);
  if (defender.hp <= 0) eliminateUnit(defender, attacker.owner);
  checkWinConditions();
  refreshUI();
}

function blastAttack(attacker, target) {
  const label = attacker.type === "singleBomber" ? "2x2" : attacker.type === "doubleBomber" ? "3x3" : "4x4";
  const ranges =
    attacker.type === "singleBomber"
      ? { minX: 0, maxX: 1, minY: 0, maxY: 1 }
      : attacker.type === "doubleBomber"
        ? { minX: -1, maxX: 1, minY: -1, maxY: 1 }
        : { minX: -1, maxX: 2, minY: -1, maxY: 2 };
  for (const victim of [...state.units]) {
    if (victim.owner === attacker.owner) continue;
    const dx = victim.x - target.x;
    const dy = victim.y - target.y;
    if (dx < ranges.minX || dx > ranges.maxX || dy < ranges.minY || dy > ranges.maxY) continue;
    const zone = zoneAt(victim.x, victim.y);
    if (zone.safe || zone.bomb) continue;
    victim.hp -= attacker.attack;
    revealTile(attacker.owner, victim.x, victim.y);
    if (victim.hp <= 0) eliminateUnit(victim, attacker.owner);
  }
  addLog(`${attacker.name} detonated a ${label} blast.`);
}

function effectiveDefense(unit) {
  const warded = abilityOn("wardenBuff") && state.units.some((ally) => ally.owner === unit.owner && ally.type === "warden" && Math.abs(ally.x - unit.x) <= 1 && Math.abs(ally.y - unit.y) <= 1 && ally.id !== unit.id);
  return unit.defense + (warded ? 1 : 0);
}

function eliminateUnit(unit, attackerId) {
  if (unit.type === "king") {
    state.players[unit.owner].alive = false;
    state.players[unit.owner].eliminatedBy = attackerId;
    addLog(`${state.players[unit.owner].name}'s King was eliminated.`);
  } else {
    addLog(`${unit.name} was eliminated.`);
  }
  if (unit.carrying != null) {
    const owner = unit.carrying;
    const home = state.players[owner].treasureHome.split(",").map(Number);
    addUnit({ type: "treasure", name: "Treasure", owner, x: home[0], y: home[1], attack: 0, defense: 3, move: 0, model: "bomb.glb", icon: "bomb.png", cost: 0 });
  }
  const mesh = unitMeshes.get(unit.id);
  if (mesh) modelRoot.remove(mesh);
  unitMeshes.delete(unit.id);
  state.units = state.units.filter((u) => u.id !== unit.id);
}

function occupiedByUnit(x, y) {
  if (x == null || y == null) return null;
  return state.units.find((unit) => unit.x === x && unit.y === y);
}

function resolveTileEffects(unit, previous) {
  const zone = zoneAt(unit.x, unit.y);
  if (zone.safe && unit.type === "king" && !unit.safeRewarded && abilityOn("safeRewards")) {
    const reward = state.playerCount === 4 ? 10000 : state.playerCount === 3 ? 5000 : 2000;
    activePlayer().tokens += reward;
    unit.safeRewarded = true;
    addLog(`${activePlayer().name}'s King reached the safe zone and gained ${reward} tokens.`);
  }
  const treasure = state.units.find((u) => u.type === "treasure" && u.owner !== unit.owner && u.x === unit.x && u.y === unit.y);
  if (treasure && unit.carrying == null && unit.type !== "phantom") {
    unit.carrying = treasure.owner;
    removeUnit(treasure);
    state.players[treasure.owner].treasureLost = true;
    addLog(`${unit.name} picked up Player ${treasure.owner + 1}'s treasure. Player ${treasure.owner + 1} stays in the game.`);
  }
  if (unit.carrying != null && tileKey(unit.x, unit.y) === state.players[unit.owner].treasureHome) {
    const owner = unit.carrying;
    unit.carrying = null;
    if (!state.players[unit.owner].capturedTreasures.has(owner)) {
      state.players[unit.owner].capturedTreasures.add(owner);
      state.players[unit.owner].tokens += 500;
    }
    addLog(`${activePlayer().name} returned Player ${owner + 1}'s treasure for +500 tokens and +75 tokens/turn.`);
  }
  const ownMine = state.mines.find((m) => m.owner === unit.owner && m.x === unit.x && m.y === unit.y && m.age >= 10);
  if (ownMine && abilityOn("mineBonuses")) {
    const bonus = ownMine.enemyOrigin ? 1000 : 500;
    state.players[unit.owner].tokens += bonus;
    state.mines = state.mines.filter((mine) => mine !== ownMine);
    addLog(`${unit.name} retrieved a mature mine for ${bonus} tokens.`);
  }
  const mine = state.mines.find((m) => m.x === unit.x && m.y === unit.y && m.owner !== unit.owner);
  if (mine && unit.type === "phantom" && abilityOn("phantomSteal")) {
    mine.owner = unit.owner;
    addLog("Phantom stole an enemy mine.");
  }
  const trap = state.traps.find((t) => t.x === unit.x && t.y === unit.y && t.owner !== unit.owner);
  if (trap && (unit.type !== "phantom" || !abilityOn("phantomSteal"))) {
    unit.hp -= 2;
    state.traps = state.traps.filter((t) => t !== trap);
    addLog(`${unit.name} triggered a trap.`);
    if (unit.hp <= 0) eliminateUnit(unit, trap.owner);
  }
  if (previous && abilityOn("sentinelGuard")) sentinelCounter(unit);
}

function removeUnit(unit) {
  const mesh = unitMeshes.get(unit.id);
  if (mesh) modelRoot.remove(mesh);
  unitMeshes.delete(unit.id);
  state.units = state.units.filter((u) => u.id !== unit.id);
}

function sentinelCounter(unit) {
  const sentinel = state.units.find((u) => u.type === "sentinel" && u.owner !== unit.owner && Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1);
  if (sentinel) attackUnit(sentinel, unit);
}

function revealAround(unit) {
  const radius = unit.type === "seeker" && abilityOn("seekerReveal") ? 3 : 1;
  for (let y = unit.y - radius; y <= unit.y + radius; y++) {
    for (let x = unit.x - radius; x <= unit.x + radius; x++) {
      if (insideBoard(x, y)) revealTile(unit.owner, x, y);
    }
  }
}

function revealTile(playerId, x, y) {
  state.players[playerId].revealed.add(tileKey(x, y));
}

function updateVisibility() {
  state.units.forEach(revealAround);
}

function insideBoard(x, y) {
  return x >= 0 && x < state.board.width && y >= 0 && y < state.board.height;
}

function startTurn() {
  const player = activePlayer();
  state.seconds = 20;
  state.moveNumber = 0;
  if (state.phase !== "setup") {
    player.tokens += 100 + treasureIncome(player.id) + mineIncome(player.id);
    state.fires.forEach((fire) => burnTile(fire));
    state.fires = state.fires.map((fire) => ({ ...fire, turns: fire.turns - 1 })).filter((fire) => fire.turns > 0);
  }
  refreshUI();
}

function endTurn() {
  state.selectedUnitId = null;
  state.shopSelection = null;
  state.attackMode = false;
  do {
    state.active = (state.active + 1) % state.playerCount;
    if (state.active === 0) state.turn += 1;
  } while (!activePlayer().alive);
  if (state.phase === "setup" && state.turn > 1) {
    state.phase = "battle";
    state.turn = 1;
    state.active = 0;
    addLog("Battle phase begins.");
  }
  startTurn();
  maybeRunAiTurn();
}

function maybeRunAiTurn() {
  const player = activePlayer();
  if (!state.settings.ai.enabled || state.phase === "complete" || !player.alive) return;
  if (state.settings.tutorial && state.settings.tutorialPaused) return;
  if (player.id === 0 && !state.settings.tutorial) return;
  const ai = AI_LEVELS[state.settings.ai.difficulty] ?? AI_LEVELS.intermediate;
  const delayScale = state.settings.options.aiDelay === "short" ? 0.55 : state.settings.options.aiDelay === "long" ? 1.55 : 1;
  setTimeout(() => runAiTurn(player.id), ai.delay * delayScale);
}

function runAiTurn(playerId) {
  if (activePlayer().id !== playerId || state.phase === "complete") return;
  if (state.settings.tutorial && state.settings.tutorialPaused) return;
  if (state.phase === "setup") {
    runAiSetup(playerId);
    endTurn();
    return;
  }
  runAiBattle(playerId);
  endTurn();
}

function runAiSetup(playerId) {
  const ai = AI_LEVELS[state.settings.ai.difficulty] ?? AI_LEVELS.intermediate;
  const player = state.players[playerId];
  const territory = state.territories[playerId];
  const deployCount = Math.min(ai.moves + 1, player.unitCap - ownedUnits(playerId).length);
  for (let i = 0; i < deployCount; i++) {
    const def = ai.deploys.map(unitDef).find((unit) => unit && player.tokens >= unit.cost && canAddUnitType(playerId, unit.id));
    if (!def) break;
    const tile = randomOpenTileInTerritory(territory);
    if (!tile) break;
    player.tokens -= def.cost;
    player.chosenTypes.add(def.id);
    addUnit({ ...def, type: def.id, owner: player.id, x: tile.x, y: tile.y, spawnAnim: true });
    addLog(`${player.name} AI deployed ${def.name}.`);
  }
}

function runAiBattle(playerId) {
  const ai = AI_LEVELS[state.settings.ai.difficulty] ?? AI_LEVELS.intermediate;
  const player = state.players[playerId];
  player.tokens += 0;
  const units = ownedUnits(playerId).filter((unit) => unit.move > 0 && unit.type !== "treasure");
  for (const unit of units.slice(0, ai.moves)) {
    const target = nearestEnemyUnit(unit);
    const destination = target ? stepToward(unit, target) : randomAdjacentOpenTile(unit);
    if (!destination) continue;
    const cost = nextMoveCost();
    if (player.tokens < cost) break;
    moveUnit(unit, destination.x, destination.y);
    const adjacent = nearestEnemyUnit(unit, 1);
    if (adjacent && unit.attack > 0) attackUnit(unit, adjacent);
  }
  addLog(`${player.name} AI completed its turn.`);
}

function canAddUnitType(playerId, typeId) {
  const player = state.players[playerId];
  const boardTypes = new Set(ownedUnits(playerId).filter((unit) => unit.type !== "king").map((unit) => unit.type));
  if (!boardTypes.has(typeId) && boardTypes.size >= 5) return false;
  if (!player.chosenTypes.has(typeId) && player.chosenTypes.size >= player.typeLimit) return false;
  return true;
}

function randomOpenTileInTerritory(territory) {
  const tiles = [];
  for (let y = territory.y; y < territory.y + territory.h; y++) {
    for (let x = territory.x; x < territory.x + territory.w; x++) {
      if (!occupiedByUnit(x, y)) tiles.push({ x, y });
    }
  }
  return tiles[Math.floor(Math.random() * tiles.length)];
}

function nearestEnemyUnit(unit, maxDistance = Infinity) {
  let best = null;
  let bestDistance = Infinity;
  for (const other of state.units) {
    if (other.owner === unit.owner || other.owner == null || state.players[other.owner]?.alive === false) continue;
    const distance = Math.abs(unit.x - other.x) + Math.abs(unit.y - other.y);
    if (distance < bestDistance && distance <= maxDistance) {
      best = other;
      bestDistance = distance;
    }
  }
  return best;
}

function stepToward(unit, target) {
  const candidates = [
    { x: unit.x + Math.sign(target.x - unit.x), y: unit.y },
    { x: unit.x, y: unit.y + Math.sign(target.y - unit.y) },
    { x: unit.x - Math.sign(target.x - unit.x), y: unit.y },
    { x: unit.x, y: unit.y - Math.sign(target.y - unit.y) },
  ];
  return candidates.find((tile) => insideBoard(tile.x, tile.y) && !occupiedByUnit(tile.x, tile.y) && Math.abs(tile.x - unit.x) + Math.abs(tile.y - unit.y) <= unit.move);
}

function randomAdjacentOpenTile(unit) {
  const candidates = [
    { x: unit.x + 1, y: unit.y },
    { x: unit.x - 1, y: unit.y },
    { x: unit.x, y: unit.y + 1 },
    { x: unit.x, y: unit.y - 1 },
  ].filter((tile) => insideBoard(tile.x, tile.y) && !occupiedByUnit(tile.x, tile.y));
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function mineIncome(playerId) {
  let income = 0;
  for (const mine of state.mines.filter((m) => m.owner === playerId)) {
    const zone = zoneAt(mine.x, mine.y);
    const merchantTouching = abilityOn("merchantBoost") && state.units.some((u) => u.owner === playerId && u.type === "merchant" && Math.abs(u.x - mine.x) <= 1 && Math.abs(u.y - mine.y) <= 1);
    income += (zone.player === playerId ? 25 : 75) * (merchantTouching ? 2 : 1);
    mine.age += 1;
    if (mine.age === 10) addLog(`A Player ${playerId + 1} mine is ready to retrieve for bonus tokens.`);
  }
  return income;
}

function treasureIncome(playerId) {
  return (state.players[playerId]?.capturedTreasures?.size ?? 0) * 75;
}

function burnTile(fire) {
  if (!abilityOn("fire")) return;
  const victim = state.units.find((unit) => unit.owner !== fire.owner && unit.x === fire.x && unit.y === fire.y);
  if (victim && !zoneAt(victim.x, victim.y).safe) {
    victim.hp -= 1;
    if (victim.hp <= 0) eliminateUnit(victim, fire.owner);
  }
}

function buildMine() {
  const unit = selectedUnit();
  if (!unit || unit.type !== "engineer") return;
  const player = activePlayer();
  if (player.tokens < 200) return addLog("Not enough tokens for a mine.");
  if (state.mines.some((mine) => mine.x === unit.x && mine.y === unit.y)) return addLog("A mine already exists here.");
  player.tokens -= 200;
  state.mines.push({ owner: player.id, x: unit.x, y: unit.y, age: 0 });
  state.mines[state.mines.length - 1].enemyOrigin = zoneAt(unit.x, unit.y).player !== player.id;
  playBuildSparks(unit.x, unit.y);
  playCoinSpiral(unit.x, unit.y);
  addLog(`${player.name} built a gold mine.`);
  refreshUI();
}

function useAbility() {
  const unit = selectedUnit();
  if (!unit) return;
  if (unit.type === "teleporter" && !unit.usedTeleport && abilityOn("teleport")) {
    unit.usedTeleport = true;
    unit.move = 4;
    playTeleportEffect(unit);
    addLog("Teleport Unit revealed. Its next move range is 4.");
  } else if (unit.type === "seeker" && abilityOn("seekerReveal")) {
    revealAround(unit);
    playSeekerScan(unit, 3.4);
    addLog("Seeker sent a scan through nearby fog.");
  } else if (unit.type === "warden" && abilityOn("wardenBuff")) {
    playWardenAura(unit);
    addLog("Warden projected a defense aura onto adjacent allies.");
  } else if (unit.type === "sentinel" && abilityOn("sentinelGuard")) {
    playSentinelWake(unit);
    addLog("Sentinel armed its adjacent guard stance.");
  } else if (unit.type === "burrower" && unit.cooldown <= 0 && abilityOn("burrow")) {
    unit.move = 3;
    unit.cooldown = 3;
    playBurrowWake(unit);
    addLog("Burrower tunnel is ready. Its next move range is 3.");
  } else if (unit.type === "pyromancer" && abilityOn("fire")) {
    state.fires.push({ owner: unit.owner, x: unit.x, y: unit.y, turns: 2 });
    playFlameColumn(unit.x, unit.y);
    playBlastAnimation(unit.x, unit.y, 0xff7138);
    addLog("Pyromancer created a two-turn fire field.");
  } else if (unit.type === "marksman" && abilityOn("marksmanRange")) {
    playTargetReticle(unit.x, unit.y, 0x9fd9ff);
    addLog("Marksman checked firing lanes up to 2 tiles.");
  } else if (unit.type === "disruptor") {
    playDisruptorWave(unit);
    addLog("Disruptor released a cancellation wave around itself.");
  } else if (unit.type === "chrono" && abilityOn("chrono")) {
    playChronoSwirl(unit);
    addLog("Chrono reversal is represented as a once-per-game interrupt in this prototype.");
    unit.type = "chronoUsed";
  } else if (unit.type === "engineer" && abilityOn("engineerTools")) {
    const player = activePlayer();
    const mine = state.mines.find((m) => m.owner === player.id && m.x === unit.x && m.y === unit.y);
    if (mine) {
      mine.age = Math.max(0, mine.age - 2);
      playBuildSparks(unit.x, unit.y);
      addLog("Engineer repaired the mine on this tile.");
    } else if (!state.traps.some((trap) => trap.x === unit.x && trap.y === unit.y)) {
      state.traps.push({ owner: player.id, x: unit.x, y: unit.y });
      playBuildSparks(unit.x, unit.y);
      playTargetReticle(unit.x, unit.y, 0xb8bec1);
      addLog("Engineer built a trap on this tile.");
    }
  } else if (unit.type === "merchant" && abilityOn("merchantBoost")) {
    playCoinSpiral(unit.x, unit.y);
    addLog("Merchant counted mine income around adjacent tiles.");
  } else {
    addLog("That special ability is disabled in Advanced Setup.");
  }
  refreshUI();
}

function checkWinConditions() {
  const alive = state.players.filter((player) => player.alive);
  if (alive.length === 1) {
    addLog(`${alive[0].name} wins the match.`);
    if (alive[0].id === 0 && state.settings.ai.enabled) {
      unlockNextDifficulty(state.settings.ai.difficulty);
    }
    state.phase = "complete";
    return;
  }
  const treasureWinner = state.players.find((player) => player.alive && player.capturedTreasures.size >= state.playerCount - 1);
  if (treasureWinner) {
    addLog(`${treasureWinner.name} wins by capturing every rival treasure.`);
    if (treasureWinner.id === 0 && state.settings.ai.enabled) {
      unlockNextDifficulty(state.settings.ai.difficulty);
    }
    state.phase = "complete";
  }
}

function addLog(text) {
  state.log.push(text);
  refreshLogOnly();
}

function addChatMessage(text, author = "bot") {
  const message = document.createElement("div");
  message.className = `chat-message ${author}`;
  message.textContent = text;
  els.chatMessages.append(message);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function normalizeQuestion(question) {
  const q = question.toLowerCase();
  const aliases = {
    win: ["ganar", "victoria", "victoire", "gagner", "sieg", "gewinnen", "vitoria", "vencer"],
    treasure: ["tesoro", "tresor", "schatz", "tesouro"],
    fog: ["niebla", "nube", "brouillard", "nuage", "nebel", "wolke", "nevoa"],
    move: ["mover", "movimiento", "deplacer", "mouvement", "bewegen", "bewegung", "movimento", "mover-se"],
    mine: ["mina", "oro", "mine", "or", "gold", "ouro"],
    ai: ["ia", "difficulte", "ki", "schwierigkeit", "dificuldade"],
    pause: ["pausa", "pausar", "pause", "pausieren"],
    server: ["servidor", "en ligne", "serveur", "online", "servidor online"],
    unit: ["unidad", "habilidad", "unite", "capacite", "einheit", "unidade", "habilidade"],
  };
  return Object.entries(aliases).reduce((text, [canonical, words]) => {
    return words.some((word) => q.includes(word)) ? `${text} ${canonical}` : text;
  }, q);
}

function answerTutorialQuestion(question, language = "auto") {
  const q = normalizeQuestion(question);
  const languageNote = language !== "auto" ? ` Language mode: ${language}.` : "";
  if (q.includes("win") || q.includes("victory")) return "You win by capturing and returning every rival treasure, or by being the last surviving King.";
  if (q.includes("treasure")) return "Treasures can be stolen and returned home. Losing your treasure does not eliminate you, but the capturer gains +500 tokens and +75 tokens per turn.";
  if (q.includes("fog") || q.includes("cloud")) return "Fog covers every unrevealed tile outside your own territory. Seekers, movement, and combat reveal nearby tiles.";
  if (q.includes("move") || q.includes("movement")) return "Select one of your units, then click a legal tile. Movement costs tokens and gets more expensive for each extra move in the same turn.";
  if (q.includes("mine") || q.includes("gold")) return "Engineers build mines. Mines generate income each turn, and Merchants can double adjacent mine income.";
  if (q.includes("ai") || q.includes("level") || q.includes("difficulty")) return "AI levels unlock in order: Beginner, Novice, Intermediate, Pro, then World-Class. Beat each level to unlock the next phrase and difficulty.";
  if (q.includes("pause")) return "In tutorial mode, use Pause Demo in the bottom HUD. It freezes AI turn progression until you resume.";
  if (q.includes("server") || q.includes("online")) return "Online multiplayer is not connected yet. It needs a WebSocket server with rooms, authoritative state, and reconnect support.";
  if (q.includes("unit") || q.includes("ability")) return "Each unit has a different role and animation. Use the Ability button after selecting a unit to trigger special effects like Seeker scans or Warden shields.";
  if (q.includes("shop") || q.includes("coin") || q.includes("theme")) return "Shop and paid themes are wired behind Google login and Stripe Checkout. This build shows the flow, but real purchases need Firebase Functions and Stripe keys.";
  if (q.includes("profile") || q.includes("friend") || q.includes("follower") || q.includes("login")) return "Profile works locally as a guest. Google login is optional, but required for cloud stats, friends, followers, purchases, and leaderboard submissions.";
  if (q.includes("auction")) return "Auctions show item rarity, bids, buyouts, sellers, and countdowns. Real bidding needs server validation before coins can be spent.";
  return `I can answer questions about winning, treasure, fog, movement, mines, AI levels, units, shop, profile, auctions, pause, and online servers.${languageNote}`;
}

function handleChatFiles() {
  const files = Array.from(els.chatFileInput?.files ?? []);
  if (!files.length) return;
  const summary = files.map((file) => `${file.name} (${file.type || "file"})`).join(", ");
  addChatMessage(`Attached: ${summary}`, "user");
  addChatMessage("I can keep those screenshots, screen recordings, or voice recordings attached in this browser session. A real support or AI review flow would send them to a server endpoint.", "bot");
  els.chatFileInput.value = "";
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addChatMessage("Speech-to-text is not available in this browser. You can still type your question or attach an audio recording.", "bot");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = els.chatLanguage?.value === "auto" ? navigator.language || "en-US" : els.chatLanguage.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  els.voiceInput.textContent = "Listening";
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    if (!transcript) return;
    els.chatInput.value = transcript;
    addChatMessage(transcript, "user");
    addChatMessage(answerTutorialQuestion(transcript, els.chatLanguage?.value ?? "auto"), "bot");
    els.chatInput.value = "";
  };
  recognition.onerror = () => addChatMessage("Voice input failed. Check microphone permissions, then try again.", "bot");
  recognition.onend = () => {
    els.voiceInput.textContent = "Speak";
  };
  recognition.start();
}

function refreshLogOnly() {
  if (!els.battleLog) return;
  els.battleLog.innerHTML = state.log.slice(-18).reverse().map((line) => `<div class="log-entry">${line}</div>`).join("");
}

function tick() {
  if (state.phase === "complete") return;
  if (!els.menuOverlay.classList.contains("hidden")) return;
  if (state.settings.tutorial && state.settings.tutorialPaused) {
    els.turnTimer.textContent = "Paused";
    return;
  }
  if (state.phase === "setup") {
    els.turnTimer.textContent = "Setup";
    return;
  }
  if (!state.settings.options.turnTimer) {
    els.turnTimer.textContent = "Timer Off";
    return;
  }
  state.seconds -= 1;
  if (state.seconds <= 0) {
    addLog(`${activePlayer().name} passed by timeout.`);
    endTurn();
  } else {
    els.turnTimer.textContent = `${state.seconds}s`;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  updateAnimations();
  updateCloudAnimation(time);
  modelRoot.children.forEach((child, i) => {
    if (!child.userData.animating) child.rotation.y = Math.sin(time + i) * 0.05;
  });
  if (creatorAvatar && state.ui.creatorRotating) creatorAvatar.rotation.y += 0.01;
  if (creatorRenderer) creatorRenderer.render(creatorScene, creatorCamera);
  renderer.render(scene, camera);
}

function updateCloudAnimation(time) {
  for (const cloud of fogRoot.children) {
    if (!cloud.visible) continue;
    cloud.children.forEach((puff, index) => {
      puff.position.y = 0.28 + Math.sin(time * 1.35 + cloud.userData.x + cloud.userData.y + index) * 0.035;
      puff.rotation.y = time * 0.15 + index;
    });
  }
}

els.canvas.addEventListener("click", clickCanvas);
els.canvas.addEventListener("pointerdown", (event) => {
  if (state.field.mode !== "drag") return;
  dragState = { x: event.clientX, y: event.clientY, panX: state.field.panX, panZ: state.field.panZ, rotation: state.field.rotation, moved: false };
  els.canvas.setPointerCapture(event.pointerId);
});
els.canvas.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  const dx = event.clientX - dragState.x;
  const dy = event.clientY - dragState.y;
  if (Math.abs(dx) + Math.abs(dy) < 4) return;
  dragState.moved = true;
  if (event.shiftKey) {
    state.field.rotation = Math.max(-180, Math.min(180, dragState.rotation + dx * 0.35));
  } else {
    state.field.panX = dragState.panX + dx * 0.018;
    state.field.panZ = dragState.panZ + dy * 0.018;
  }
  applyFieldTransform();
});
els.canvas.addEventListener("pointerup", (event) => {
  if (dragState?.moved) state.field.suppressClick = true;
  dragState = null;
  if (els.canvas.hasPointerCapture(event.pointerId)) els.canvas.releasePointerCapture(event.pointerId);
});
els.canvas.addEventListener("wheel", (event) => {
  if (state.field.mode !== "drag") return;
  event.preventDefault();
  state.field.scale = Math.max(0.9, Math.min(1.8, state.field.scale + (event.deltaY < 0 ? 0.04 : -0.04)));
  applyFieldTransform();
}, { passive: false });
els.playNow.addEventListener("click", () => {
  handleTileAction("live");
});
els.singlePlayer.addEventListener("click", () => handleTileAction("singlePlayer"));
document.querySelectorAll(".royal-tile:not(#playNowButton):not(#singlePlayerButton)").forEach((button) => {
  button.addEventListener("click", () => handleTileAction(button.dataset.action));
});
document.querySelectorAll("[data-sort]").forEach((button) => {
  button.addEventListener("click", () => sortTiles(button.dataset.sort, button));
});
els.createGame.addEventListener("click", () => showMenu("createGameMenu"));
els.quickDuel.addEventListener("click", () => {
  applyPreset("duel");
  startConfiguredGame();
});
els.startLocalMultiplayer.addEventListener("click", startLocalMultiplayer);
els.showOnlineSetup.addEventListener("click", showOnlineServerPlan);
els.watchTutorial.addEventListener("click", startTutorialDemo);
els.watchUnitTutorial.addEventListener("click", startTutorialDemo);
document.querySelectorAll("[data-campaign-level]").forEach((button) => {
  button.addEventListener("click", () => startCampaignLevel(button.dataset.campaignLevel));
});
els.advancedSetup.addEventListener("click", () => {
  els.advancedBack.dataset.menuTarget = "createGameMenu";
  showMenu("advancedMenu");
});
els.startConfiguredGame.addEventListener("click", startConfiguredGame);
document.querySelectorAll("[data-menu-target]").forEach((button) => {
  button.addEventListener("click", () => showMenu(button.dataset.menuTarget));
});
document.querySelectorAll("[data-player-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    els.setupPlayerCount.value = button.dataset.playerPreset;
    syncSetupControls();
    showMenu("createGameMenu");
  });
});
document.querySelectorAll("#singlePlayerMenu [data-ai-level]").forEach((button) => {
  button.addEventListener("click", () => setAiDifficulty(button.dataset.aiLevel));
});
els.presetSelect.addEventListener("change", () => applyPreset(els.presetSelect.value));
els.setupPlayerCount.addEventListener("change", syncSetupControls);
els.setupThemeTier.addEventListener("change", syncSetupControls);
els.aiDifficulty.addEventListener("change", () => setAiDifficulty(els.aiDifficulty.value));
els.enableAllAbilities.addEventListener("click", () => setAllAbilities(true));
els.disableSpecialAbilities.addEventListener("click", setCoreRulesOnly);
els.newGame.addEventListener("click", newGame);
els.openMenu.addEventListener("click", () => showMenu("mainMenu"));
els.cornerProfile.addEventListener("click", () => showMenu("profileMenu"));
els.cornerMenu.addEventListener("click", () => {
  els.hamburgerDrawer.hidden = !els.hamburgerDrawer.hidden;
});
els.drawerClose?.addEventListener("click", () => {
  els.hamburgerDrawer.hidden = true;
});
document.querySelectorAll("[data-drawer-action]").forEach((button) => {
  button.addEventListener("click", () => {
    els.hamburgerDrawer.hidden = true;
    if (button.dataset.drawerAction === "signin") simulateGoogleLogin();
    else handleTileAction(button.dataset.drawerAction);
  });
});
els.modalClose.addEventListener("click", closeModal);
els.modalBackdrop.addEventListener("click", (event) => {
  if (event.target === els.modalBackdrop) closeModal();
});
els.musicClose.addEventListener("click", () => {
  els.musicDrawer.hidden = true;
});
els.miniSlotToggle.addEventListener("click", () => {
  els.reelsPanel.hidden = !els.reelsPanel.hidden;
});
els.slotLever.addEventListener("click", () => {
  els.reelsPanel.hidden = !els.reelsPanel.hidden;
});
els.slotLeverLarge.addEventListener("click", spinMiniSlots);
els.slotSpin.addEventListener("click", spinMiniSlots);
els.autoSpin.addEventListener("change", () => {
  if (els.autoSpin.checked) {
    spinMiniSlots();
    els.autoSpin.checked = false;
  }
});
document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.querySelector(`#${button.dataset.closePanel}`);
    if (panel) panel.hidden = true;
  });
});
document.querySelectorAll("[data-reels]").forEach((button) => {
  button.addEventListener("click", () => {
    state.ui.reels = Number(button.dataset.reels);
    document.querySelectorAll("[data-reels]").forEach((item) => item.classList.toggle("active", item === button));
    updateMiniSlot();
  });
});
document.querySelectorAll("[data-wager]").forEach((button) => {
  button.addEventListener("click", () => {
    state.ui.wager = Number(button.dataset.wager);
    document.querySelectorAll("[data-wager]").forEach((item) => item.classList.toggle("active", item === button));
  });
});
els.googleLogin.addEventListener("click", simulateGoogleLogin);
els.syncProfile.addEventListener("click", () => requireLogin("Cloud stat sync"));
els.profileBack.addEventListener("click", () => {
  const previous = state.ui.profileStack.pop();
  if (previous) {
    state.profile = previous;
    renderProfile();
  } else {
    showMenu("mainMenu");
  }
});
els.profileClose.addEventListener("click", () => showMenu("mainMenu"));
els.editProfile.addEventListener("click", openEditProfileModal);
els.profileSettings.addEventListener("click", () => openModal("Profile Settings", "<p>Profile visibility, requests, badges, and notification settings live here.</p>"));
els.editProfileImage.addEventListener("click", () => els.profileImageInput.click());
els.profileImageInput.addEventListener("change", handleProfileImageUpload);
document.querySelectorAll("[data-social-search]").forEach((input) => {
  input.addEventListener("input", () => renderSocialLists(input.value));
});
els.rotateCreator.addEventListener("click", () => {
  state.ui.creatorRotating = !state.ui.creatorRotating;
  els.rotateCreator.textContent = state.ui.creatorRotating ? "Stop" : "Rotate";
});
document.querySelectorAll("[data-creator-color]").forEach((button) => {
  button.addEventListener("click", () => {
    state.ui.creatorColor = button.dataset.creatorColor;
    updateCreatorColor();
  });
});
els.themeTier.addEventListener("change", () => {
  els.setupThemeTier.value = els.themeTier.value;
  drawBoard();
  updateVisualState();
});
els.playerCount.addEventListener("change", () => {
  els.setupPlayerCount.value = els.playerCount.value;
});
els.selectMode.addEventListener("click", () => {
  state.field.mode = "select";
  applyFieldTransform();
});
els.dragMode.addEventListener("click", () => {
  state.field.mode = "drag";
  applyFieldTransform();
});
els.fieldRotate.addEventListener("input", () => {
  state.field.rotation = Number(els.fieldRotate.value);
  applyFieldTransform();
});
els.fieldTilt.addEventListener("input", () => {
  state.field.tilt = Number(els.fieldTilt.value);
  applyFieldTransform();
});
els.fieldScale.addEventListener("input", () => {
  state.field.scale = Math.max(0.9, Math.min(1.8, Number(els.fieldScale.value) / 100));
  applyFieldTransform();
});
els.coordinateToggle.addEventListener("change", () => {
  state.field.coordinates = els.coordinateToggle.checked;
  state.settings.options.showCoordinates = els.coordinateToggle.checked;
  renderSettings();
  drawCoordinateLabels();
  updateVisualState();
});
els.fitBoard.addEventListener("click", fitEntireBoard);
els.resetField.addEventListener("click", resetFieldTransform);
els.endTurn.addEventListener("click", endTurn);
els.pauseTutorial.addEventListener("click", toggleTutorialPause);
els.pass.addEventListener("click", endTurn);
els.attack.addEventListener("click", () => {
  state.attackMode = true;
  els.selectionText.textContent = "Attack mode: click an enemy unit in range.";
});
els.ability.addEventListener("click", useAbility);
els.mine.addEventListener("click", buildMine);
els.chatToggle.addEventListener("click", () => {
  els.chatPanel.hidden = !els.chatPanel.hidden;
});
els.chatClose.addEventListener("click", () => {
  els.chatPanel.hidden = true;
});
els.languageToggle.addEventListener("click", () => {
  els.languagePanel.hidden = !els.languagePanel.hidden;
});
document.querySelectorAll("[data-lang-label]").forEach((button) => {
  button.addEventListener("click", () => {
    addChatMessage(WELCOME_TRANSLATIONS[button.dataset.langLabel] ?? WELCOME_TRANSLATIONS.English, "bot");
    els.languagePanel.hidden = true;
  });
});
document.querySelectorAll("[data-chat-topic]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-chat-topic]").forEach((item) => item.classList.toggle("active", item === button));
    const topicPrompts = {
      rules: "Rules help loaded. Ask about winning, movement, fog, mines, units, or treasure.",
      tutorial: "Tutorial help loaded. Ask how the AI demo, pause button, or difficulty unlocks work.",
      shop: "Shop help loaded. Ask about coins, paid themes, auctions, or Stripe checkout.",
      signin: "Sign-in help loaded. Google login is optional for play, but needed for cloud stats, friends, followers, purchases, and leaderboards.",
    };
    addChatMessage(topicPrompts[button.dataset.chatTopic], "bot");
  });
});
els.chatFileInput.addEventListener("change", handleChatFiles);
els.voiceInput.addEventListener("click", startVoiceInput);
els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = els.chatInput.value.trim();
  if (!question) return;
  addChatMessage(question, "user");
  addChatMessage(answerTutorialQuestion(question, els.chatLanguage.value), "bot");
  els.chatInput.value = "";
});
window.addEventListener("resize", setupRenderer);
window.addEventListener("click", (event) => {
  if (!event.target.closest?.(".social-context-menu") && !event.target.closest?.("[data-social-user]")) {
    document.querySelector(".social-context-menu")?.remove();
  }
});

setupRenderer();
applyImageAssets();
renderAbilityToggles();
renderAiCharacters();
renderPlayerCharacters();
renderSettings();
renderProfile();
initCreatorAvatar();
document.querySelector('[data-wager="10"]')?.classList.add("active");
document.querySelector('[data-reels="3"]')?.classList.add("active");
applyPreset("official");
setAiDifficulty(state.settings.ai.difficulty);
applySettingEffects();
applyFieldTransform();
setupCreatorRenderer();
showMenu("mainMenu");
animate();
timerId = setInterval(tick, 1000);
