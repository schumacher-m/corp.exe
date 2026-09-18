/**
 * CORP-TOWER-01 — plaza → lobby → elevator → floor.
 * Loads Designer GLBs when present; soft-fails to graybox empties.
 *
 * GLB empties: plaza_spawn, tower_entrance,
 *   lobby_spawn, badge_reader, coffee_machine, security_desk, hr_poster, elevator_call,
 *   elevator_interior, btn_floor_player, btn_floor_wrong_1/2, elevator_door.
 * Extra: lobby_sync_chip; wet_floor empty on lobby GLB (fallback in code).
 * CORP-TOWER-03: prop_security_guard, prop_wet_floor, prop_hr_poster landmarks.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const BEAT_POOL = ["coffee", "security", "hr_poster", "sync_ping", "wet_floor"];

const WRITER_BEAT_KEYS = {
  coffee: "coffee",
  security: "security",
  hr_poster: "hrPoster",
  sync_ping: "syncPing",
  wet_floor: "wetFloor",
};

const BEAT_SANITY = {
  coffee: 2,
  security: 1,
  hr_poster: 1,
  sync_ping: 2,
  wet_floor: 1,
};

const FALLBACK_TOAST = {
  coffee: "Sludge dispensed. Leadership calls it fuel.",
  security: "Security stared back. You blinked first (spiritually).",
  hr_poster: "HR poster absorbed. Values still optional.",
  sync_ping: "Lobby Sync answered. Meeting still happening.",
  wet_floor: "Wet floor noted. Dignity not covered by policy.",
};

const FALLBACK_LABEL = {
  coffee: "Coffee",
  security: "Security",
  hr_poster: "HR poster",
  sync_ping: "Sync ping",
  wet_floor: "Wet floor",
};

const BEAT_HOOK = {
  coffee: "coffee_machine",
  security: "security_desk",
  hr_poster: "hr_poster",
  sync_ping: "lobby_sync_chip",
  wet_floor: "wet_floor",
};

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
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
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      emissive: new THREE.Color(color).multiplyScalar(0.18),
      emissiveIntensity: 0.35,
    })
  );
  m.position.y = y + h / 2;
  return m;
}

function empty(name, x, y, z) {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  return o;
}

function collectNamed(root, into) {
  root.traverse((o) => {
    if (o.name) into[o.name] = o;
  });
}

/**
 * @param {object} opts
 * @param {THREE.Scene} opts.scene
 * @param {THREE.Group} opts.officeRoot
 * @param {object} opts.audio
 * @param {function} opts.toast
 * @param {function} opts.setPrompt
 * @param {{pos:THREE.Vector3,eye:number,speed:number}} opts.player
 * @param {object} opts.G
 * @param {object} opts.win95
 * @param {object} opts.copy
 * @param {function} [opts.forceNearest]
 * @param {function} [opts.onEnterWalk]
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
    setFarmCommutePaused,
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
  let ready = false;

  /* Tower-phase look — farm fluo grid doesn't reach plaza spawn; don't dim farm pass. */
  const FARM_FOG = { color: 0x5a5848, near: 18, far: 40, bg: 0x4a4840 };
  const TOWER_FOG = { color: 0x3a4248, near: 26, far: 72, bg: 0x353a40 };
  const towerLightRoot = new THREE.Group();
  towerLightRoot.name = "TowerLights";
  scene.add(towerLightRoot);
  const towerAmb = new THREE.AmbientLight(0xa8b4c0, 0);
  towerAmb.userData.baseI = 2.45;
  towerLightRoot.add(towerAmb);
  const towerKey = new THREE.DirectionalLight(0xd0d8e0, 0);
  towerKey.userData.baseI = 1.75;
  towerKey.position.set(3, 14, 6);
  towerLightRoot.add(towerKey);
  /* Phase B: ≤6 PointLights active in tower commute */
  const towerFluoSpots = [
    [0, 3.6, 7.2, 0xc8d0d8, 1.45, 18],
    [0, 3.2, -2.0, 0xb8c4d0, 1.35, 16],
    [-4.5, 3.0, 2.5, 0xb0bcc8, 1.1, 13],
    [4.5, 3.0, 2.5, 0xb0bcc8, 1.1, 13],
    [0, 2.9, -11, 0xa8b0b8, 1.2, 18],
    [0, 2.4, 0, 0xc8d0d8, 1.15, 10],
  ];
  for (const [x, y, z, col, inten, dist] of towerFluoSpots) {
    const fl = new THREE.PointLight(col, 0, dist);
    fl.userData.baseI = inten;
    fl.position.set(x, y, z);
    towerLightRoot.add(fl);
  }

  function ensurePlazaDeck() {
    if (plaza.getObjectByName("PlazaDeck")) return;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.08, 34),
      new THREE.MeshLambertMaterial({
        color: 0x6a6658,
        flatShading: true,
        emissive: 0x2a2820,
        emissiveIntensity: 0.25,
      })
    );
    deck.name = "PlazaDeck";
    deck.position.set(0, -0.06, 0); /* under Designer floor slab */
    plaza.add(deck);
  }

  function setTowerLook(on) {
    const fog = on ? TOWER_FOG : FARM_FOG;
    if (scene.fog) {
      scene.fog.color.setHex(fog.color);
      scene.fog.near = fog.near;
      scene.fog.far = fog.far;
    }
    if (scene.background && scene.background.isColor) scene.background.setHex(fog.bg);
    towerLightRoot.traverse((o) => {
      if (o.isLight && o.userData && o.userData.baseI != null) {
        o.intensity = on ? o.userData.baseI : 0;
      }
    });
    if (typeof setFarmCommutePaused === "function") setFarmCommutePaused(!!on);
  }

  function nearestTowerMaps(root) {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat) continue;
        for (const key of ["map", "emissiveMap", "roughnessMap", "metalnessMap", "normalMap"]) {
          const tex = mat[key];
          if (!tex) continue;
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;
          tex.needsUpdate = true;
        }
        if (mat.isMeshStandardMaterial) {
          mat.metalness = Math.min(mat.metalness || 0, 0.05);
          mat.roughness = Math.max(mat.roughness || 0.8, 0.85);
        }
        mat.needsUpdate = true;
      }
    });
  }

  function brightenTowerMats(root) {
    /* Graybox / void-fail only — do not wash Designer readable-grim mapped albedos. */
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat || mat.map) continue;
        if (mat.color && mat.color.isColor) {
          const c = mat.color;
          const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
          if (lum < 0.18) c.setRGB(Math.min(1, c.r + 0.28), Math.min(1, c.g + 0.26), Math.min(1, c.b + 0.22));
          else if (lum < 0.32) c.offsetHSL(0, 0, 0.1);
        }
        mat.needsUpdate = true;
      }
    });
  }

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

  const grayPlaza = new THREE.Group();
  grayPlaza.name = "PlazaGray";
  const grayLobby = new THREE.Group();
  grayLobby.name = "LobbyGray";
  const grayElev = new THREE.Group();
  grayElev.name = "ElevGray";
  plaza.add(grayPlaza);
  lobby.add(grayLobby);
  elevator.add(grayElev);

  function buildGrayPlaza() {
    /* Interim albedos — readable under tower lights; Designer textured kits replace later */
    grayPlaza.add(boxMesh(24, 0.15, 30, 0x6e6a58, -0.075));
    const towerMass = boxMesh(10, 18, 6, 0x58564c, 0);
    towerMass.position.set(0, 0, -14);
    grayPlaza.add(towerMass);
    const door = boxMesh(2.4, 2.8, 0.15, 0x3a3428, 0.1);
    door.position.set(0, 0, -4.2);
    grayPlaza.add(door);
    const spawn = empty("plaza_spawn", 0, 0, 7);
    const entrance = empty("tower_entrance", 0, 0, -4.4);
    grayPlaza.add(spawn, entrance);
    hooks.plaza_spawn = spawn;
    hooks.tower_entrance = entrance;
  }

  function buildGrayLobby() {
    grayLobby.add(boxMesh(16, 0.12, 14, 0x5a5648, -0.06));
    grayLobby.add(boxMesh(16, 0.2, 14, 0x3e3c34, 3.5));
    const places = {
      lobby_spawn: [0, 0, 5.5],
      badge_reader: [-5.6, 1.25, 4.0],
      coffee_machine: [-5.2, 0, -2.5],
      security_desk: [2.5, 0, 1.5],
      hr_poster: [-5.7, 1.6, 0.5],
      elevator_call: [1.4, 1.3, -6.4],
      lobby_sync_chip: [0.5, 1.4, 2.0],
      wet_floor: [-2.0, 0, 2.5],
    };
    grayLobby.add(boxMesh(0.5, 1.2, 0.3, 0x555248, 0.9).translateX(-5.6).translateZ(4));
    grayLobby.add(boxMesh(0.7, 1.4, 0.6, 0x4a4038, 0).translateX(-5.2).translateZ(-2.5));
    grayLobby.add(boxMesh(2.2, 1.1, 1.0, 0x3a3830, 0).translateX(2.5).translateZ(1.5));
    grayLobby.add(boxMesh(1.2, 1.6, 0.08, 0x5a5040, 1.0).translateX(-5.7).translateZ(0.5));
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.7, 6),
      new THREE.MeshLambertMaterial({ color: 0xc87820, flatShading: true })
    );
    cone.position.set(3.5, 0.35, -1.5);
    grayLobby.add(cone);
    grayLobby.add(boxMesh(2.4, 2.6, 0.2, 0x2a2820, 0.1).translateX(1.4).translateZ(-6.5));
    for (const [n, p] of Object.entries(places)) {
      const e = empty(n, p[0], p[1], p[2]);
      grayLobby.add(e);
      hooks[n] = e;
    }
  }

  function buildGrayElevator() {
    grayElev.add(boxMesh(2.2, 2.4, 2.2, 0x3a3834, 0));
    grayElev.add(boxMesh(2.0, 2.2, 0.08, 0x2e2c28, 0.1).translateZ(-1.0));
    grayElev.add(boxMesh(0.08, 2.2, 2.0, 0x2e2c28, 0.1).translateX(-1.0));
    grayElev.add(boxMesh(0.08, 2.2, 2.0, 0x2e2c28, 0.1).translateX(1.0));
    const panel = boxMesh(0.35, 0.9, 0.08, 0x1a1814, 1.0);
    panel.position.set(0.7, 0, -0.85);
    grayElev.add(panel);
    const places = {
      elevator_interior: [0, 0, 0],
      btn_floor_player: [0.7, 1.25, -0.2],
      btn_floor_wrong_1: [0.7, 1.45, -0.2],
      btn_floor_wrong_2: [0.7, 1.05, -0.2],
      elevator_door: [0, 1.05, 0.9],
    };
    for (const [n, p] of Object.entries(places)) {
      const e = empty(n, p[0], p[1], p[2]);
      grayElev.add(e);
      hooks[n] = e;
    }
    const okBtn = boxMesh(0.14, 0.12, 0.05, 0x70a060, 0);
    okBtn.position.set(0.7, 1.25, -0.18);
    grayElev.add(okBtn);
    for (const y of [1.45, 1.05]) {
      const b = boxMesh(0.12, 0.1, 0.04, 0x888870, 0);
      b.position.set(0.7, y, -0.18);
      grayElev.add(b);
    }
  }

  buildGrayPlaza();
  buildGrayLobby();
  buildGrayElevator();
  brightenTowerMats(grayPlaza);
  brightenTowerMats(grayLobby);
  brightenTowerMats(grayElev);

  const loader = new GLTFLoader();

  async function loadModel(path) {
    const g = await loader.loadAsync(path);
    if (forceNearest) forceNearest(g.scene);
    return g.scene;
  }

  function ensureExtraLobbyHooks() {
    if (!hooks.lobby_sync_chip) {
      const e = empty("lobby_sync_chip", 0.5, 1.4, 2.0);
      lobby.add(e);
      hooks.lobby_sync_chip = e;
    }
    if (!hooks.wet_floor) {
      const e = empty("wet_floor", -2.0, 0, 2.5);
      lobby.add(e);
      hooks.wet_floor = e;
    }
  }

  async function loadKits() {
    let paths = [];
    try {
      const man = await (await fetch("assets/manifest.json")).json();
      paths = man.models || [];
    } catch (_) {}

    function pathFor(name) {
      return (
        paths.find((p) => p.endsWith("/" + name + ".glb") || p.endsWith(name + ".glb")) ||
        "assets/models/" + name + ".glb"
      );
    }

    try {
      const sc = await loadModel(pathFor("tower_plaza"));
      sc.name = "tower_plaza";
      /* Readable-grim kits include floor — hide gray (z-fight); PlazaDeck under as void insurance. */
      grayPlaza.visible = false;
      plaza.add(sc);
      collectNamed(sc, hooks);
      if (forceNearest) forceNearest(sc);
      nearestTowerMaps(sc);
      console.info("[tower] tower_plaza OK (readable-grim)");
    } catch (e) {
      console.warn("[tower] plaza GLB soft-fail", e && e.message ? e.message : e);
    }

    try {
      const sc = await loadModel(pathFor("tower_lobby"));
      sc.name = "tower_lobby";
      grayLobby.visible = false;
      lobby.add(sc);
      collectNamed(sc, hooks);
      if (forceNearest) forceNearest(sc);
      nearestTowerMaps(sc);
      console.info("[tower] tower_lobby OK (readable-grim)");
    } catch (e) {
      console.warn("[tower] lobby GLB soft-fail", e && e.message ? e.message : e);
    }

    try {
      const sc = await loadModel(pathFor("elevator_car"));
      sc.name = "elevator_car";
      grayElev.visible = false;
      elevator.add(sc);
      collectNamed(sc, hooks);
      if (forceNearest) forceNearest(sc);
      nearestTowerMaps(sc);
      console.info("[tower] elevator_car OK (readable-grim)");
    } catch (e) {
      console.warn("[tower] elevator GLB soft-fail", e && e.message ? e.message : e);
    }

    const propMap = [
      ["prop_turnstile", "badge_reader", lobby],
      ["prop_coffee", "coffee_machine", lobby],
      ["prop_security_desk", "security_desk", lobby],
      ["prop_security_guard", "security_guard", lobby],
      ["prop_hr_poster", "hr_poster", lobby],
      ["prop_wet_floor", "wet_floor", lobby],
      ["prop_elevator_panel", "elevator_panel", elevator],
    ];
    const FLOOR_PROPS = new Set(["prop_coffee", "prop_security_desk", "prop_security_guard", "prop_wet_floor", "prop_turnstile"]);
    const WALL_PROPS = new Set(["prop_hr_poster", "prop_elevator_panel"]);
    const WALL_Y_MAX = 1.55;
    const WALL_Y_MIN = 0.35;
    const _hookPos = new THREE.Vector3();
    const _hookQuat = new THREE.Quaternion();
    const _parentQuat = new THREE.Quaternion();
    const _localQuat = new THREE.Quaternion();

    function attachAtHook(sc, hookName, parent, prop) {
      let name = hookName;
      if (prop === "prop_elevator_panel") {
        if (hooks.elevator_panel) name = "elevator_panel";
        else if (hooks.btn_floor_player) name = "btn_floor_player";
      }
      /* CORP-TOWER-03.2 — Guard ONLY on security_guard; fallback behind desk AABB */
      if (prop === "prop_security_guard") {
        if (hooks.security_guard) name = "security_guard";
        else if (hooks.security_desk) name = "security_desk";
        else {
          parent.add(sc);
          return;
        }
      }
      const h = hooks[name];
      if (!h) {
        parent.add(sc);
        return;
      }
      h.getWorldPosition(_hookPos);
      h.getWorldQuaternion(_hookQuat);
      parent.worldToLocal(_hookPos);
      parent.getWorldQuaternion(_parentQuat);
      _localQuat.copy(_parentQuat).invert().multiply(_hookQuat);

      if (FLOOR_PROPS.has(prop)) {
        _hookPos.y = 0;
      } else if (WALL_PROPS.has(prop)) {
        _hookPos.y = THREE.MathUtils.clamp(_hookPos.y, WALL_Y_MIN, WALL_Y_MAX);
      }

      sc.position.copy(_hookPos);
      sc.quaternion.copy(_localQuat);

      const ident = Math.abs(_localQuat.x) + Math.abs(_localQuat.y) + Math.abs(_localQuat.z) < 1e-4;
      if (ident && WALL_PROPS.has(prop)) {
        if (prop === "prop_hr_poster") {
          const faceX = -Math.sign(sc.position.x || -1);
          sc.rotation.set(0, faceX > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
        } else if (prop === "prop_elevator_panel") {
          sc.lookAt(0, sc.position.y, 0);
          sc.rotateY(Math.PI);
        }
      }
      if (ident && prop === "prop_turnstile") {
        sc.rotation.set(0, 0, 0);
      }

      /* CORP-TOWER-03.2 Guard FAIL: clear desk AABB + yaw to approach */
      if (prop === "prop_security_guard") {
        sc.position.y = Math.max(sc.position.y, 0) + 0.18;
        let deskX = 2.5;
        let deskZ = 1.5;
        if (hooks.security_desk) {
          const dp = new THREE.Vector3();
          hooks.security_desk.getWorldPosition(dp);
          parent.worldToLocal(dp);
          deskX = dp.x;
          deskZ = dp.z;
        }
        let dx = sc.position.x - deskX;
        let dz = sc.position.z - deskZ;
        let dist = Math.hypot(dx, dz);
        if (dist < 0.2) {
          dx = 1.2;
          dz = -0.15;
          dist = Math.hypot(dx, dz);
        }
        if (dist < 1.25) {
          const s = 1.35 / dist;
          sc.position.x = deskX + dx * s;
          sc.position.z = deskZ + dz * s;
        }
        const toApproachX = 0 - sc.position.x;
        const toApproachZ = 5.5 - sc.position.z;
        sc.rotation.set(0, Math.atan2(toApproachX, toApproachZ), 0);
      }

      parent.add(sc);
    }

    let turnstileOk = false;
    for (const [prop, hookName, parent] of propMap) {
      try {
        const sc = await loadModel(pathFor(prop));
        sc.name = prop;
        attachAtHook(sc, hookName, parent, prop);
        if (forceNearest) forceNearest(sc);
        nearestTowerMaps(sc);
        if (prop === "prop_turnstile") turnstileOk = true;
        console.info("[tower] prop", prop, "OK");
      } catch (e) {
        if (prop === "prop_turnstile") {
          console.warn("[tower] turnstile missing — fallback badge_reader", e && e.message ? e.message : e);
        }
      }
    }
    if (!turnstileOk) {
      try {
        const sc = await loadModel(pathFor("prop_badge_reader"));
        sc.name = "prop_badge_reader";
        WALL_PROPS.add("prop_badge_reader");
        attachAtHook(sc, "badge_reader", lobby, "prop_badge_reader");
        if (forceNearest) forceNearest(sc);
        nearestTowerMaps(sc);
        console.info("[tower] prop prop_badge_reader OK (fallback)");
      } catch (_) {}
    }

    ensureExtraLobbyHooks();
    if (!hooks.elevator_panel && hooks.btn_floor_player) {
      const e = empty("elevator_panel", 0.78, 1.25, -0.2);
      elevator.add(e);
      hooks.elevator_panel = e;
    }

    // Phase B1: keep interact empties out of ceiling for nearHook
    for (const name of ["hr_poster", "elevator_call", "lobby_sync_chip"]) {
      const h = hooks[name];
      if (h) h.position.y = THREE.MathUtils.clamp(h.position.y, 0.35, 1.55);
    }
    /* badge_reader / turnstile sits at floor Y — do not lift */

    for (const name of ["coffee_machine", "security_desk", "wet_floor"]) {
      const h = hooks[name];
      if (h) h.position.y = Math.min(h.position.y, 0.15);
    }
    ready = true;
  }

  const kitsPromise = loadKits();

  function beatCopy(id) {
    const writerKey = WRITER_BEAT_KEYS[id];
    const beats = ta().beats || {};
    const fromBeats = beats[writerKey] || beats[id] || {};
    const lm = ta().landmarks || {};
    const lmKey = { security: "guard", hr_poster: "hrPoster", wet_floor: "wetFloor" }[id];
    const fromLm = lmKey ? lm[lmKey] || {} : {};
    /* Landmark prompts/toasts win when present (CORP-TOWER-03). */
    return Object.assign({}, fromBeats, fromLm);
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
      return (beatsDone[id] ? "[x]" : "[ ]") + " " + lab;
    });
    const hint = c.beatsHint || "Complete 2 of 3";
    return (c.badgeLabel || "Badge") + " " + badgeMark + " · " + hint + " · " + parts.join(" · ");
  }

  function refreshElevatorLock() {
    const was = elevatorUnlocked;
    elevatorUnlocked = checklistMet();
    if (elevatorUnlocked && !was) {
      toast((ta().checklist || {}).elevatorReady || "Elevator unlocked. Your floor awaits.", true);
    }
  }

  function completeBeat(id, opts2) {
    const auto = !!(opts2 && opts2.auto);
    if (beatsDone[id]) return;
    beatsDone[id] = true;
    if (auto) {
      toast("HR marked you present.", true);
    } else {
      const bc = beatCopy(id);
      toast(bc.toast || FALLBACK_TOAST[id] || "Done.", true);
      const hit = BEAT_SANITY[id] || 0;
      if (hit && win95 && win95.hitSanity) win95.hitSanity(hit);
      if (id === "sync_ping" && win95 && win95.state) {
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

  function worldOf(name) {
    const h = hooks[name];
    if (!h) return null;
    const v = new THREE.Vector3();
    h.getWorldPosition(v);
    return v;
  }

  function nearHook(name, r) {
    if (r == null) r = 1.6;
    const w = worldOf(name);
    if (!w) return false;
    return Math.hypot(player.pos.x - w.x, player.pos.z - w.z) < r;
  }

  function placeAtHook(name, yaw) {
    if (yaw == null) yaw = Math.PI;
    const w = worldOf(name);
    if (w) player.pos.set(w.x, player.eye, w.z);
    G.yaw = yaw;
    G.lookY = 0;
  }

  async function startPlaza() {
    await kitsPromise;
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
    G._elevWantCorrect = false;
    G._floorT = 0;

    const rng = mulberry32(daySeedInt() ^ 0x70ae);
    offered = shuffle(BEAT_POOL, rng).slice(0, 3);

    ensurePlazaDeck();
    placeAtHook("plaza_spawn", 0);
    G.phase = "plaza";
    setTowerLook(true);

    try {
      if (audio.stopBgm) audio.stopBgm();
    } catch (_) {}
    stopTowerAmbs();
    audio.playLoop("plazaAmb", { volume: 0.32 });
    setPrompt("WASD · walk to the tower entrance");
    toast((ta().plaza || {}).toast || "Welcome to the building.", true);
  }

  function enterLobby() {
    hideAllSets();
    lobby.visible = true;
    if (officeRoot) officeRoot.visible = false;
    G.phase = "lobby";
    setTowerLook(true);
    placeAtHook("lobby_spawn", Math.PI);
    stuckTimer = 0;
    stopTowerAmbs();
    audio.playLoop("lobbyAmb", { volume: 0.32 });
    setPrompt(checklistHud());
  }

  function enterElevator() {
    hideAllSets();
    elevator.visible = true;
    if (officeRoot) officeRoot.visible = false;
    G.phase = "elevator";
    setTowerLook(true);
    placeAtHook("elevator_interior", Math.PI);
    player.pos.x = 0;
    player.pos.z = 0;
    wrongFloorHit = false;
    G._elevWantCorrect = false;
    stopTowerAmbs();
    audio.playLoop("elevatorAmb", { volume: 0.34 });
    setPrompt((ta().elevator || {}).panelHint || "Pick your floor (E)");
  }

  function enterFloor() {
    hideAllSets();
    if (officeRoot) officeRoot.visible = true;
    G.phase = "floor";
    // No office_floor.glb — farm handoff at elevator_exit ≈ (0,~,10.4) looking −Z
    player.pos.set(0, player.eye, 10.4);
    G.yaw = 0;
    G.lookY = 0;
    G._floorT = 0;
    floorHanded = false;
    stopTowerAmbs();
    audio.playLoop("floorAmb", { volume: 0.32 });
    if (audio.playSfx) audio.playSfx("elevatorDing", { volume: 0.55 });
    toast((ta().elevator || {}).arrive || "Your floor. Walk like you belong.", true);
    setPrompt("WASD · walk to Cubicle 4-B");
  }

  function handoffToWalk() {
    if (floorHanded) return;
    floorHanded = true;
    setTowerLook(false);
    G.phase = "walk";
    if (typeof onEnterWalk === "function") onEnterWalk();
    else setPrompt("WASD · find Cubicle 4-B · E to sit");
  }

  function doBadge() {
    if (badgeDone) {
      toast((ta().badge || {}).success || "Already badged.", true);
      return;
    }
    if (!badgeFailedOnce) {
      badgeFailedOnce = true;
      toast((ta().badge || {}).failOnce || "Badge rejected. Try again.");
      if (win95 && win95.hitSanity) win95.hitSanity(1);
      if (audio.playSfx) audio.playSfx("badgeDeny", { volume: 0.45 });
      setTimeout(() => {
        if (!badgeDone && G.phase === "lobby") {
          badgeDone = true;
          if (audio.playSfx) audio.playSfx("badgeBeep", { volume: 0.55 });
          toast((ta().badge || {}).success || "Access granted.", true);
          refreshElevatorLock();
          setPrompt(checklistHud());
        }
      }, 900);
      return;
    }
    badgeDone = true;
    if (audio.playSfx) audio.playSfx("badgeBeep", { volume: 0.55 });
    toast((ta().badge || {}).success || "Access granted.", true);
    refreshElevatorLock();
    setPrompt(checklistHud());
  }

  function doWrongFloor() {
    const lines = ta().wrongFloor || ["Wrong floor."];
    toast(lines[Math.floor(Math.random() * lines.length)]);
    if (!wrongFloorHit) {
      wrongFloorHit = true;
      if (win95 && win95.hitSanity) win95.hitSanity(1);
    }
  }

  /* Entrance volume: graybox door ~2.4 wide @ z=-4.4; keep forgiving for GLB/approach. */
  const ENTRANCE_ENTER_R = 5.5;
  const ENTRANCE_PROMPT_R = 8.0;
  const ENTRANCE_MAGNET_R = 9.0;
  /* CORP-TOWER-03 — slight beat-radius bump; counts locked */
  const BEAT_NEAR_R = 2.35;
  const BADGE_NEAR_R = 2.7;
  const SECURITY_NEAR_R = 2.65;

  function plazaDoorPrompt() {
    const pl = ta().plaza || {};
    return pl.doorPrompt || pl.enterPrompt || "E -- Enter lobby";
  }

  function softMagnetEntrance(dt, bounds) {
    const w = worldOf("tower_entrance");
    if (!w) return;
    const dx = w.x - player.pos.x;
    const dz = w.z - player.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.2 || dist > ENTRANCE_MAGNET_R) return;
    const t = 1 - dist / ENTRANCE_MAGNET_R;
    const pull = player.speed * 0.42 * t * t;
    player.pos.x += (dx / dist) * pull * dt;
    player.pos.z += (dz / dist) * pull * dt;
    player.pos.x = THREE.MathUtils.clamp(player.pos.x, bounds.xmin, bounds.xmax);
    player.pos.z = THREE.MathUtils.clamp(player.pos.z, bounds.zmin, bounds.zmax);
  }

  function tryInteract() {
    if (interactCooldown > 0) return;

    if (G.phase === "plaza") {
      if (nearHook("tower_entrance", ENTRANCE_ENTER_R)) {
        interactCooldown = 0.35;
        enterLobby();
      }
      return;
    }
    interactCooldown = 0.35;

    if (G.phase === "lobby") {
      if (nearHook("badge_reader", BADGE_NEAR_R)) {
        doBadge();
        return;
      }
      for (const id of offered) {
        if (beatsDone[id] || id === "security") continue;
        const hookName = BEAT_HOOK[id];
        if (hookName && nearHook(hookName, BEAT_NEAR_R)) {
          completeBeat(id);
          setPrompt(checklistHud());
          return;
        }
      }
      for (const id of BEAT_POOL) {
        if (offered.includes(id)) continue;
        const hookName = BEAT_HOOK[id];
        if (hookName && nearHook(hookName, 1.5)) {
          toast(beatCopy(id).toast || FALLBACK_TOAST[id] || "Noted.");
          return;
        }
      }
      if (nearHook("elevator_call", BEAT_NEAR_R)) {
        if (!elevatorUnlocked) {
          toast((ta().checklist || {}).elevatorLocked || "Elevator locked. Badge + 2 beats first.");
        } else {
          enterElevator();
        }
      }
      return;
    }

    if (G.phase === "elevator") {
      if (nearHook("btn_floor_player", 1.1) || G.lookY > 0.08 || G._elevWantCorrect) {
        if (audio.playSfx) audio.playSfx("elevatorDing", { volume: 0.55 });
        toast((ta().elevator || {}).ding || "Ding.", true);
        enterFloor();
        return;
      }
      if (nearHook("btn_floor_wrong_1", 1.0) || nearHook("btn_floor_wrong_2", 1.0)) {
        doWrongFloor();
        G._elevWantCorrect = true;
        return;
      }
      doWrongFloor();
      G._elevWantCorrect = true;
    }
  }

  function updateFpMove(dt, bounds) {
    const forward =
      (G.keys["w"] || G.keys["arrowup"] ? 1 : 0) - (G.keys["s"] || G.keys["arrowdown"] ? 1 : 0);
    const strafe =
      (G.keys["d"] || G.keys["arrowright"] ? 1 : 0) - (G.keys["a"] || G.keys["arrowleft"] ? 1 : 0);
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
        if (audio.footstep) audio.footstep();
      }
    }
  }

  function applyCamera(camera) {
    camera.position.set(player.pos.x, player.eye, player.pos.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = G.yaw;
    camera.rotation.x = G.lookY;
  }

  function update(dt, camera) {
    if (interactCooldown > 0) interactCooldown -= dt;

    if (G.phase === "plaza") {
      const plazaBounds = { xmin: -11, xmax: 11, zmin: -10.5, zmax: 9 };
      updateFpMove(dt, plazaBounds);
      softMagnetEntrance(dt, plazaBounds);
      applyCamera(camera);
      setPrompt(
        nearHook("tower_entrance", ENTRANCE_PROMPT_R)
          ? plazaDoorPrompt()
          : "WASD · walk to the tower entrance"
      );
      return;
    }

    if (G.phase === "lobby") {
      updateFpMove(dt, { xmin: -7.5, xmax: 7.5, zmin: -7, zmax: 7 });
      applyCamera(camera);

      if (offered.includes("security") && !beatsDone.security && nearHook("security_desk", SECURITY_NEAR_R)) {
        const holding = !!(G.keys["e"] || G.keys[" "] || G.keys["enter"] || G.keys["space"]);
        if (holding) {
          securityHold += dt;
          const need = 1.7;
          setPrompt("Security stare… " + Math.min(100, Math.floor((securityHold / need) * 100)) + "%");
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
        let prompt = checklistHud();
        if (!badgeDone && nearHook("badge_reader", BADGE_NEAR_R)) {
          prompt = (ta().badge || {}).prompt || "E — Scan badge";
        } else if (nearHook("elevator_call", BEAT_NEAR_R)) {
          prompt = elevatorUnlocked
            ? (ta().elevator || {}).prompt || "E — Call elevator"
            : (ta().checklist || {}).elevatorLocked || "Elevator locked";
        } else {
          for (const id of offered) {
            if (beatsDone[id] || id === "security") continue;
            const hookName = BEAT_HOOK[id];
            if (hookName && nearHook(hookName, BEAT_NEAR_R)) {
              prompt = beatCopy(id).prompt || "E — " + FALLBACK_LABEL[id];
              break;
            }
          }
        }
        setPrompt(prompt);
      }

      const nearStuck =
        (!badgeDone && nearHook("badge_reader", BADGE_NEAR_R)) ||
        offered.some(function (id) {
          return !beatsDone[id] && BEAT_HOOK[id] && nearHook(BEAT_HOOK[id], id === "security" ? SECURITY_NEAR_R : BEAT_NEAR_R);
        });
      if (nearStuck && !checklistMet()) {
        stuckTimer += dt;
        if (stuckTimer > 8) {
          stuckTimer = 0;
          if (!badgeDone) {
            badgeDone = true;
            toast("HR marked you present.", true);
            refreshElevatorLock();
          } else {
            const missing = offered.find(function (id) {
              return !beatsDone[id];
            });
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
      applyCamera(camera);
      setPrompt((ta().elevator || {}).panelHint || "E — floor buttons (look up / 2nd press = yours)");
      return;
    }

    if (G.phase === "floor") {
      updateFpMove(dt, { xmin: -10.5, xmax: 10.5, zmin: -8.5, zmax: 11.5 });
      applyCamera(camera);
      G._floorT = (G._floorT || 0) + dt;
      if (G._floorT > 0.35) handoffToWalk();
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
    if (G.phase !== "plaza" && G.phase !== "lobby" && G.phase !== "elevator") return false;
    e.preventDefault();
    tryInteract();
    return true;
  }

  function onPointerInteract() {
    if (G.phase !== "plaza" && G.phase !== "lobby" && G.phase !== "elevator") return false;
    tryInteract();
    return true;
  }

  function onSitStart() {
    try {
      audio.stopLoop("floorAmb");
    } catch (_) {}
  }

  function hideForDeskSkip() {
    hideAllSets();
    stopTowerAmbs();
    setTowerLook(false);
    if (officeRoot) officeRoot.visible = true;
  }

  return {
    root: root,
    hooks: hooks,
    kitsPromise: kitsPromise,
    startPlaza: startPlaza,
    enterLobby: enterLobby,
    enterElevator: enterElevator,
    enterFloor: enterFloor,
    update: update,
    onKeyInteract: onKeyInteract,
    onPointerInteract: onPointerInteract,
    onSitStart: onSitStart,
    stopTowerAmbs: stopTowerAmbs,
    hideForDeskSkip: hideForDeskSkip,
    get offered() {
      return offered.slice();
    },
    get ready() {
      return ready;
    },
  };
}
