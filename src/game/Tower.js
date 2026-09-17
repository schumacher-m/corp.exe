/**
 * CORP-TOWER-01 — plaza → lobby → elevator → floor graybox + phase logic.
 * Soft-fail GLB loads; empties named per docs/TOWER_HOOKS.md.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const BEAT_POOL = ["coffee", "security", "hr_poster", "sync_ping", "wet_floor"];

/** Writer camelCase → GD snake_case */
const WRITER_BEAT_KEYS = {
  coffee: "coffee",
  security: "security",
  hr_poster: "hrPoster",
  sync_ping: "syncPing",
  wet_floor: "wetFloor",
};

const BEAT_SANITY = {
  badge: 0,
  coffee: 2,
  security: 1,
  hr_poster: 1,
  sync_ping: 2,
  wet_floor: 1,
};

const FALLBACK_TOAST = {
  coffee: "Sludge dispensed. Leadership calls it fuel.",
  security: "You blinked second. Cleared.",
  hr_poster: "Values absorbed. None retained.",
  sync_ping: "Lobby Sync answered. Meeting still happening.",
  wet_floor: "Liability noted. Floor still wet.",
};

const FALLBACK_LABEL = {
  coffee: "Coffee",
  security: "Security",
  hr_poster: "HR poster",
  sync_ping: "Sync ping",
  wet_floor: "Wet floor",
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daySeedInt() {
  const s = new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function boxMesh(w, h, d, color, y = 0) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  m.position.y = y + h / 2;
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

function empty(name, x, y, z) {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  return o;
}

/**
 * @param {object} opts
 * @param {THREE.Scene} opts.scene
 * @param {THREE.Group} opts.officeRoot — farm; hidden until floor
 * @param {object} opts.audio
 * @param {function} opts.toast
 * @param {function} opts.setPrompt
 * @param {object} opts.player — { pos, eye, speed }
 * @param {object} opts.G — game state (phase, keys, yaw, lookY)
 * @param {object} opts.win95 — for hitSanity / sprint
 * @param {object} opts.copy
 * @param {function} [opts.forceNearest]
 * @param {function} [opts.onEnterWalk] — after floor handoff to walk controls
 */
export function createTower(opts) {
  const {
    scene,
    officeRoot,
    audio,
    toast,
    setPrompt,
    player,
    G,
    win95,
    copy,
    forceNearest,
    onEnterWalk,
  } = opts;

  const root = new THREE.Group();
  root.name = "TowerRoot";
  scene.add(root);

  const hooks = Object.create(null);
  const ta = () => copy.towerArrival || {};

  let offered = [];
  let badgeDone = false;
  let badgeFailedOnce = false;
  let beatsDone = Object.create(null);
  let elevatorUnlocked = false;
  let wrongFloorHit = false;
  let securityHold = 0;
  let stuckTimer = 0;
  let interactCooldown = 0;
  let floorHanded = false;

  const plaza = new THREE.Group();
  plaza.name = "Plaza";
  const lobby = new THREE.Group();
  lobby.name = "Lobby";
  const elevator = new THREE.Group();
  elevator.name = "Elevator";
  root.add(plaza, lobby, elevator);
  plaza.visible = false;
  lobby.visible = false;
  elevator.visible = false;

  /* —— Graybox geometry + named empties —— */
  function buildPlaza() {
    const ground = boxMesh(24, 0.15, 30, 0x4a4840, -0.075);
    ground.position.set(0, 0, -4);
    plaza.add(ground);
    // Tower massing ahead (−Z)
    const tower = boxMesh(10, 18, 6, 0x3a3830, 0);
    tower.position.set(0, 0, -14);
    plaza.add(tower);
    const entranceFrame = boxMesh(3.2, 3.2, 0.4, 0x2a2820, 0);
    entranceFrame.position.set(0, 0, -10.8);
    plaza.add(entranceFrame);
    const door = boxMesh(2.4, 2.8, 0.15, 0x1a1814, 0.1);
    door.position.set(0, 0, -10.55);
    plaza.add(door);

    const spawn = empty("plaza_spawn", 0, 0, 6);
    const entrance = empty("tower_entrance", 0, 1.2, -10.2);
    plaza.add(spawn, entrance);
    hooks.plaza_spawn = spawn;
    hooks.tower_entrance = entrance;
  }

  function buildLobby() {
    const floor = boxMesh(16, 0.12, 14, 0x454238, -0.06);
    lobby.add(floor);
    const ceiling = boxMesh(16, 0.2, 14, 0x2e2c26, 3.5);
    lobby.add(ceiling);
    // Walls
    lobby.add(boxMesh(16, 3.6, 0.3, 0x3d3a32, 0).translateZ(-7));
    lobby.add(boxMesh(16, 3.6, 0.3, 0x3d3a32, 0).translateZ(7));
    lobby.add(boxMesh(0.3, 3.6, 14, 0x3d3a32, 0).translateX(-8));
    lobby.add(boxMesh(0.3, 3.6, 14, 0x3d3a32, 0).translateX(8));

    // Props (gray boxes) near empties
    const badgeBox = boxMesh(0.5, 1.2, 0.3, 0x555248, 0.9);
    badgeBox.position.set(-3.5, 0, -4);
    lobby.add(badgeBox);
    const coffeeBox = boxMesh(0.7, 1.4, 0.6, 0x4a4038, 0);
    coffeeBox.position.set(3.2, 0, -3.5);
    lobby.add(coffeeBox);
    const secBox = boxMesh(2.2, 1.1, 1.0, 0x3a3830, 0);
    secBox.position.set(0, 0, -5.5);
    lobby.add(secBox);
    const poster = boxMesh(1.2, 1.6, 0.08, 0x5a5040, 1.0);
    poster.position.set(-6.5, 0, 0);
    lobby.add(poster);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.7, 6),
      new THREE.MeshLambertMaterial({ color: 0xc87820, flatShading: true })
    );
    cone.position.set(2.5, 0.35, 2.5);
    lobby.add(cone);
    const elevDoors = boxMesh(2.4, 2.6, 0.2, 0x2a2820, 0.1);
    elevDoors.position.set(0, 0, 6.2);
    lobby.add(elevDoors);

    const names = {
      badge_reader: [-3.5, 1.4, -3.7],
      coffee_machine: [3.2, 1.2, -3.1],
      security_desk: [0, 1.3, -4.8],
      hr_poster: [-6.2, 1.6, 0],
      lobby_sync_chip: [1.5, 1.4, -1.5],
      wet_floor: [2.5, 0.5, 2.5],
      elevator_call: [0, 1.4, 5.8],
    };
    for (const [n, p] of Object.entries(names)) {
      const e = empty(n, p[0], p[1], p[2]);
      lobby.add(e);
      hooks[n] = e;
    }
    // lobby spawn (not in hooks doc but useful)
    const lobbySpawn = empty("lobby_spawn", 0, 0, 4);
    lobby.add(lobbySpawn);
    hooks.lobby_spawn = lobbySpawn;
  }

  function buildElevator() {
    const car = boxMesh(2.2, 2.4, 2.2, 0x3a3834, 0);
    car.position.set(0, 0, 0);
    elevator.add(car);
    // Interior walls (open +Z door side visually darker)
    elevator.add(boxMesh(2.0, 2.2, 0.08, 0x2e2c28, 0.1).translateZ(-1.0));
    elevator.add(boxMesh(0.08, 2.2, 2.0, 0x2e2c28, 0.1).translateX(-1.0));
    elevator.add(boxMesh(0.08, 2.2, 2.0, 0x2e2c28, 0.1).translateX(1.0));
    const panel = boxMesh(0.35, 0.9, 0.08, 0x1a1814, 1.2);
    panel.position.set(0.75, 0, -0.85);
    elevator.add(panel);

    const interior = empty("elevator_interior", 0, 0, 0);
    elevator.add(interior);
    hooks.elevator_interior = interior;

    const door = empty("elevator_door", 0, 1.2, 1.05);
    elevator.add(door);
    hooks.elevator_door = door;

    const correct = empty("btn_floor_player", 0.75, 1.45, -0.8);
    elevator.add(correct);
    hooks.btn_floor_player = correct;

    for (let i = 0; i < 4; i++) {
      const y = 1.7 - i * 0.22;
      const b = empty(`btn_floor_wrong_${i + 1}`, 0.75, y, -0.8);
      // offset slightly so not stacked on correct
      if (i === 1) continue; // leave slot for player btn visual
      b.position.y = y === 1.45 ? 1.9 : y;
      elevator.add(b);
      hooks[b.name] = b;
    }
    // Wrong buttons as small lit cubes
    for (let i = 1; i <= 4; i++) {
      const btn = boxMesh(0.12, 0.1, 0.04, 0x888870, 0);
      btn.position.set(0.75, 1.85 - (i - 1) * 0.2, -0.78);
      elevator.add(btn);
    }
    const okBtn = boxMesh(0.14, 0.12, 0.05, 0x70a060, 0);
    okBtn.position.set(0.75, 1.45, -0.76);
    elevator.add(okBtn);
  }

  buildPlaza();
  buildLobby();
  buildElevator();

  /* Soft-fail GLB overlays from manifest paths */
  const loader = new GLTFLoader();
  const TOWER_GLBS = [
    ["tower_plaza", plaza],
    ["tower_lobby", lobby],
    ["elevator_car", elevator],
    ["prop_badge_reader", lobby],
    ["prop_coffee", lobby],
    ["prop_security_desk", lobby],
    ["prop_hr_poster", lobby],
    ["prop_elevator_panel", elevator],
  ];

  async function tryLoadGlbs() {
    let paths = [];
    try {
      const man = await (await fetch("assets/manifest.json")).json();
      paths = man.models || [];
    } catch (_) {
      paths = [];
    }
    for (const [name, parent] of TOWER_GLBS) {
      const path =
        paths.find((p) => p.includes(`/${name}.glb`) || p.endsWith(`${name}.glb`)) ||
        `assets/models/${name}.glb`;
      try {
        const g = await loader.loadAsync(path);
        if (forceNearest) forceNearest(g.scene);
        g.scene.name = name;
        // Keep empties; hide crude massing when a real plaza/lobby/car lands
        if (name === "tower_plaza" || name === "tower_lobby" || name === "elevator_car") {
          parent.children.forEach((c) => {
            if (c.isMesh) c.visible = false;
          });
        }
        parent.add(g.scene);
        console.info("[tower] loaded", name);
      } catch (_) {
        /* graybox only — Designer has no kits yet */
      }
    }
  }
  tryLoadGlbs();

  function beatCopy(id) {
    const writerKey = WRITER_BEAT_KEYS[id];
    const beats = ta().beats || {};
    return beats[writerKey] || beats[id] || {};
  }

  function checklistMet() {
    if (!badgeDone) return false;
    let n = 0;
    for (const id of offered) if (beatsDone[id]) n++;
    return n >= 2;
  }

  function checklistHud() {
    const c = ta().checklist || {};
    const badgeMark = badgeDone ? "[x]" : "[ ]";
    const parts = offered.map((id) => {
      const lab = beatCopy(id).label || FALLBACK_LABEL[id] || id;
      return `${beatsDone[id] ? "[x]" : "[ ]"} ${lab}`;
    });
    const hint = c.beatsHint || "Complete 2 of 3";
    return `${c.badgeLabel || "Badge"} ${badgeMark} · ${hint}\n${parts.join(" · ")}`;
  }

  function refreshElevatorLock() {
    const was = elevatorUnlocked;
    elevatorUnlocked = checklistMet();
    if (elevatorUnlocked && !was) {
      toast((ta().checklist || {}).elevatorReady || "Elevator unlocked. Your floor awaits.", true);
    }
  }

  function completeBeat(id, { auto = false } = {}) {
    if (beatsDone[id]) return;
    beatsDone[id] = true;
    if (auto) {
      toast("HR marked you present.", true);
    } else {
      const bc = beatCopy(id);
      toast(bc.toast || FALLBACK_TOAST[id] || "Done.", true);
      const hit = BEAT_SANITY[id] || 0;
      if (hit) win95.hitSanity?.(hit);
      if (id === "sync_ping") {
        win95.state.sprint = (win95.state.sprint || 0) + 1;
      }
    }
    refreshElevatorLock();
  }

  function hideAllSets() {
    plaza.visible = false;
    lobby.visible = false;
    elevator.visible = false;
  }

  function stopTowerAmbs() {
    try {
      audio.stopLoop("plazaAmb");
      audio.stopLoop("lobbyAmb");
      audio.stopLoop("elevatorAmb");
      audio.stopLoop("floorAmb");
    } catch (_) {}
  }

  function startPlaza() {
    hideAllSets();
    plaza.visible = true;
    if (officeRoot) officeRoot.visible = false;
    floorHanded = false;
    badgeDone = false;
    badgeFailedOnce = false;
    beatsDone = Object.create(null);
    elevatorUnlocked = false;
    wrongFloorHit = false;
    securityHold = 0;
    stuckTimer = 0;
    interactCooldown = 0;

    const rng = mulberry32(daySeedInt() ^ 0x70ae);
    offered = shuffle(BEAT_POOL, rng).slice(0, 3);

    const sp = hooks.plaza_spawn;
    player.pos.set(sp.position.x, player.eye, sp.position.z);
    G.yaw = Math.PI; // look toward tower (−Z from +Z spawn)
    G.lookY = 0;
    G.phase = "plaza";

    audio.stopBgm?.();
    stopTowerAmbs();
    audio.playLoop("plazaAmb", { volume: 0.32 });
    setPrompt((ta().plaza || {}).enterPrompt || "WASD · Enter tower (E)");
    toast((ta().plaza || {}).toast || "Welcome to the building.", true);
  }

  function enterLobby() {
    hideAllSets();
    lobby.visible = true;
    if (officeRoot) officeRoot.visible = false;
    G.phase = "lobby";
    const sp = hooks.lobby_spawn;
    player.pos.set(sp.position.x, player.eye, sp.position.z);
    G.yaw = Math.PI; // toward security / back wall (−Z)
    G.lookY = 0;
    stuckTimer = 0;
    stopTowerAmbs();
    audio.playLoop("lobbyAmb", { volume: 0.32 });
    toast((ta().plaza || {}).toast || "Lobby.", true);
    setPrompt(checklistHud());
  }

  function enterElevator() {
    hideAllSets();
    elevator.visible = true;
    if (officeRoot) officeRoot.visible = false;
    G.phase = "elevator";
    const sp = hooks.elevator_interior;
    player.pos.set(sp.position.x, player.eye, sp.position.z);
    G.yaw = Math.PI; // face panel (−Z)
    G.lookY = 0;
    wrongFloorHit = false;
    stopTowerAmbs();
    audio.playLoop("elevatorAmb", { volume: 0.34 });
    setPrompt((ta().elevator || {}).panelHint || "Pick your floor");
  }

  function enterFloor() {
    hideAllSets();
    if (officeRoot) officeRoot.visible = true;
    G.phase = "floor";
    // elevator_exit ≈ (0, 1.55, 10.4) looking −Z
    player.pos.set(0, player.eye, 10.4);
    G.yaw = 0; // look −Z (yaw 0 → forward −Z in updateWalk)
    G.lookY = 0;
    stopTowerAmbs();
    audio.playLoop("floorAmb", { volume: 0.32 });
    audio.playSfx?.("elevatorDing", { volume: 0.55 });
    toast((ta().elevator || {}).arrive || "Your floor. Walk like you belong.", true);
    setPrompt("WASD · walk to Cubicle 4-B");
    // Hand off to existing walk after a beat (or immediately)
    floorHanded = false;
  }

  function handoffToWalk() {
    if (floorHanded) return;
    floorHanded = true;
    G.phase = "walk";
    // Keep floorAmb until sit; do not start exhausted bed / walk BGM during commute clock freeze
    if (typeof onEnterWalk === "function") onEnterWalk();
    else setPrompt("WASD · find Cubicle 4-B · E to sit");
  }

  function nearHook(name, r = 1.6) {
    const h = hooks[name];
    if (!h) return false;
    const dx = player.pos.x - h.position.x;
    const dz = player.pos.z - h.position.z;
    // Lobby/plaza hooks are in local space of their group at origin — world ≈ local
    const world = new THREE.Vector3();
    h.getWorldPosition(world);
    const ddx = player.pos.x - world.x;
    const ddz = player.pos.z - world.z;
    return Math.hypot(ddx, ddz) < r;
  }

  function tryInteract() {
    if (interactCooldown > 0) return;
    interactCooldown = 0.35;

    if (G.phase === "plaza") {
      if (nearHook("tower_entrance", 2.2)) {
        enterLobby();
      }
      return;
    }

    if (G.phase === "lobby") {
      if (nearHook("badge_reader", 1.8)) {
        doBadge();
        return;
      }
      for (const id of offered) {
        const hookName =
          id === "coffee"
            ? "coffee_machine"
            : id === "security"
              ? "security_desk"
              : id === "hr_poster"
                ? "hr_poster"
                : id === "sync_ping"
                  ? "lobby_sync_chip"
                  : id === "wet_floor"
                    ? "wet_floor"
                    : null;
        if (!hookName || beatsDone[id]) continue;
        if (id === "security") continue; // hold, not tap
        if (nearHook(hookName, 1.8)) {
          completeBeat(id);
          setPrompt(checklistHud());
          return;
        }
      }
      // Flavor on non-offered props — toast only, no credit
      for (const id of BEAT_POOL) {
        if (offered.includes(id) || beatsDone[id]) continue;
        const hookName =
          id === "coffee"
            ? "coffee_machine"
            : id === "security"
              ? "security_desk"
              : id === "hr_poster"
                ? "hr_poster"
                : id === "sync_ping"
                  ? "lobby_sync_chip"
                  : "wet_floor";
        if (nearHook(hookName, 1.5)) {
          toast(beatCopy(id).toast || FALLBACK_TOAST[id] || "Noted.");
          return;
        }
      }
      if (nearHook("elevator_call", 1.8)) {
        if (!elevatorUnlocked) {
          toast((ta().checklist || {}).elevatorLocked || "Elevator locked. Badge + 2 beats first.");
        } else {
          enterElevator();
        }
        return;
      }
      return;
    }

    if (G.phase === "elevator") {
      if (nearHook("btn_floor_player", 1.4) || playerLookingAtPanel()) {
        // Prefer explicit: if near correct button zone
        if (nearHook("btn_floor_player", 1.5) || G._elevPickCorrect) {
          audio.playSfx?.("elevatorDing", { volume: 0.55 });
          toast((ta().elevator || {}).ding || "Ding.", true);
          enterFloor();
          return;
        }
      }
      // Wrong floors: any other panel interact
      for (let i = 1; i <= 4; i++) {
        if (nearHook(`btn_floor_wrong_${i}`, 1.2)) {
          doWrongFloor();
          return;
        }
      }
      // Fallback: if facing panel closely, cycle — E near panel picks wrong first then need correct
      if (nearHook("btn_floor_player", 2.0) || Math.abs(player.pos.z) < 0.8) {
        // Second E / click after a wrong, or click green: treat as correct if looking up
        if (G.lookY > 0.05 || G._elevWantCorrect) {
          audio.playSfx?.("elevatorDing", { volume: 0.55 });
          toast((ta().elevator || {}).ding || "Ding.", true);
          enterFloor();
        } else {
          doWrongFloor();
          G._elevWantCorrect = true; // next E goes correct
        }
      }
    }
  }

  function playerLookingAtPanel() {
    return G.phase === "elevator" && Math.abs(player.pos.x) < 1 && Math.abs(player.pos.z) < 1;
  }

  function doBadge() {
    if (badgeDone) {
      toast((ta().badge || {}).success || "Already badged.", true);
      return;
    }
    if (!badgeFailedOnce) {
      badgeFailedOnce = true;
      toast((ta().badge || {}).failOnce || "Badge rejected. Try again.");
      win95.hitSanity?.(1);
      audio.playSfx?.("badgeDeny", { volume: 0.45 });
      // auto-pass on next interaction or after short delay
      setTimeout(() => {
        if (!badgeDone && G.phase === "lobby") {
          badgeDone = true;
          audio.playSfx?.("badgeBeep", { volume: 0.55 });
          toast((ta().badge || {}).success || "Access granted.", true);
          refreshElevatorLock();
          setPrompt(checklistHud());
        }
      }, 900);
      return;
    }
    badgeDone = true;
    audio.playSfx?.("badgeBeep", { volume: 0.55 });
    toast((ta().badge || {}).success || "Access granted.", true);
    refreshElevatorLock();
    setPrompt(checklistHud());
  }

  function doWrongFloor() {
    const lines = ta().wrongFloor || ["Wrong floor."];
    toast(lines[Math.floor(Math.random() * lines.length)]);
    if (!wrongFloorHit) {
      wrongFloorHit = true;
      win95.hitSanity?.(1);
    }
  }

  function updateFpMove(dt, bounds) {
    const forward = (G.keys["w"] || G.keys["arrowup"] ? 1 : 0) - (G.keys["s"] || G.keys["arrowdown"] ? 1 : 0);
    const strafe = (G.keys["d"] || G.keys["arrowright"] ? 1 : 0) - (G.keys["a"] || G.keys["arrowleft"] ? 1 : 0);
    if (forward || strafe) {
      const ang = G.yaw;
      const fx = -Math.sin(ang);
      const fz = -Math.cos(ang);
      const rx = Math.cos(ang);
      const rz = -Math.sin(ang);
      player.pos.x += (fx * forward + rx * strafe) * player.speed * dt;
      player.pos.z += (fz * forward + rz * strafe) * player.speed * dt;
      player.pos.x = THREE.MathUtils.clamp(player.pos.x, bounds.xmin, bounds.xmax);
      player.pos.z = THREE.MathUtils.clamp(player.pos.z, bounds.zmin, bounds.zmax);
      G._towerFoot = (G._towerFoot || 0) + dt;
      if (G._towerFoot > 0.38) {
        G._towerFoot = 0;
        audio.footstep?.();
      }
    }
  }

  function update(dt, camera) {
    if (interactCooldown > 0) interactCooldown -= dt;

    if (G.phase === "plaza") {
      updateFpMove(dt, { xmin: -10, xmax: 10, zmin: -11, zmax: 8 });
      camera.position.set(player.pos.x, player.eye, player.pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = G.yaw;
      camera.rotation.x = G.lookY;
      if (nearHook("tower_entrance", 2.2)) {
        setPrompt((ta().plaza || {}).enterPrompt || "E — Enter tower");
      } else {
        setPrompt("WASD · walk to the tower entrance");
      }
      return;
    }

    if (G.phase === "lobby") {
      updateFpMove(dt, { xmin: -7.2, xmax: 7.2, zmin: -6.2, zmax: 6.2 });
      camera.position.set(player.pos.x, player.eye, player.pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = G.yaw;
      camera.rotation.x = G.lookY;

      // Security hold bar
      if (offered.includes("security") && !beatsDone.security && nearHook("security_desk", 2.0)) {
        const holding = !!(G.keys["e"] || G.keys[" "] || G.keys["enter"] || G.keys["space"]);
        if (holding) {
          securityHold += dt;
          const need = 1.7;
          setPrompt(`Security stare… ${Math.min(100, Math.floor((securityHold / need) * 100))}%`);
          if (securityHold >= need) {
            completeBeat("security");
            securityHold = 0;
            setPrompt(checklistHud());
          }
        } else {
          securityHold = Math.max(0, securityHold - dt * 0.5);
          setPrompt(beatCopy("security").prompt || "Hold E — eye contact");
        }
      } else {
        // Proximity prompts
        let prompt = checklistHud();
        if (!badgeDone && nearHook("badge_reader", 1.8)) prompt = (ta().badge || {}).prompt || "E — Scan badge";
        else if (nearHook("elevator_call", 1.8))
          prompt = elevatorUnlocked
            ? (ta().elevator || {}).prompt || "E — Call elevator"
            : (ta().checklist || {}).elevatorLocked || "Elevator locked";
        else {
          for (const id of offered) {
            if (beatsDone[id] || id === "security") continue;
            const hookName =
              id === "coffee"
                ? "coffee_machine"
                : id === "hr_poster"
                  ? "hr_poster"
                  : id === "sync_ping"
                    ? "lobby_sync_chip"
                    : id === "wet_floor"
                      ? "wet_floor"
                      : null;
            if (hookName && nearHook(hookName, 1.8)) {
              prompt = beatCopy(id).prompt || `E — ${FALLBACK_LABEL[id]}`;
              break;
            }
          }
        }
        setPrompt(prompt);
      }

      // Softlock watchdog: if badge+progress stalled, auto-complete after 8s of stuck beat attempt
      const progress = (badgeDone ? 1 : 0) + offered.filter((id) => beatsDone[id]).length;
      if (progress < 3) {
        stuckTimer += dt;
        if (stuckTimer > 8) {
          stuckTimer = 0;
          if (!badgeDone) {
            badgeDone = true;
            toast("HR marked you present.", true);
            refreshElevatorLock();
          } else {
            const missing = offered.find((id) => !beatsDone[id]);
            if (missing) completeBeat(missing, { auto: true });
          }
          setPrompt(checklistHud());
        }
      } else {
        stuckTimer = 0;
      }
      return;
    }

    if (G.phase === "elevator") {
      updateFpMove(dt, { xmin: -0.7, xmax: 0.7, zmin: -0.7, zmax: 0.7 });
      camera.position.set(player.pos.x, player.eye, player.pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = G.yaw;
      camera.rotation.x = G.lookY;
      setPrompt((ta().elevator || {}).panelHint || "E — floor buttons (green = yours)");
      return;
    }

    if (G.phase === "floor") {
      // Brief floor phase then walk — allow movement with extended +Z bound
      updateFpMove(dt, { xmin: -10.5, xmax: 10.5, zmin: -8.5, zmax: 11.5 });
      camera.position.set(player.pos.x, player.eye, player.pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = G.yaw;
      camera.rotation.x = G.lookY;
      G._floorT = (G._floorT || 0) + dt;
      if (G._floorT > 0.4) handoffToWalk();
      return;
    }
  }

  function onKeyInteract(e) {
    const sitKey =
      e.code === "KeyE" ||
      e.code === "Space" ||
      e.key === "e" ||
      e.key === "E" ||
      e.key === " " ||
      e.key === "Enter" ||
      e.code === "Enter";
    if (!sitKey) return false;
    if (!["plaza", "lobby", "elevator"].includes(G.phase)) return false;
    e.preventDefault();
    tryInteract();
    return true;
  }

  function onPointerInteract() {
    if (!["plaza", "lobby", "elevator"].includes(G.phase)) return false;
    tryInteract();
    return true;
  }

  /** Call from beginSit / seated handoff */
  function onSitStart() {
    try {
      audio.stopLoop("floorAmb");
    } catch (_) {}
  }

  function destroy() {
    stopTowerAmbs();
    scene.remove(root);
  }

  return {
    root,
    hooks,
    startPlaza,
    enterLobby,
    enterElevator,
    enterFloor,
    update,
    onKeyInteract,
    onPointerInteract,
    onSitStart,
    stopTowerAmbs,
    destroy,
    get offered() {
      return offered.slice();
    },
  };
}
