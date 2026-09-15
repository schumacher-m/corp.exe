/**
 * corp.exe entry -- boot + game.
 */
import { fitStage } from "./util/boot.js";
fitStage();
await import("./game/Game.js");
