import { SystemManager } from "./system-manager.mjs"

const MODULE_ID = "token-action-hud-sentiment";

Hooks.on("tokenActionHudCoreApiReady", async () => {
    const module = game.modules.get(MODULE_ID)
    module.api = {
        SystemManager
    }

    Hooks.call("tokenActionHudSystemReady", module)
})