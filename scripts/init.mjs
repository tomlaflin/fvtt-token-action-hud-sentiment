import { SystemManager } from './system-manager.mjs'

const MODULE_ID = 'token-action-hud-sentiment';
const REQUIRED_CORE_MODULE_VERSION = '1.5';

Hooks.on('tokenActionHudCoreApiReady', async () => {
    const module = game.modules.get(MODULE_ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager
    }

    Hooks.call('tokenActionHudSystemReady', module)
})