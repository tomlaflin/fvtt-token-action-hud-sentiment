import { ActionHandler } from './action-handler.mjs'
import { RollHandler } from './roll-handler.mjs'
import { DEFAULT_LAYOUT } from './groups.mjs'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SystemManager = class SystemManager extends coreModule.api.SystemManager {

        /** Returns an instance of the ActionHandler to Token Action HUD Core.
         * @override
         * @returns {class} The ActionHandler instance
         */
        getActionHandler() {
            return new ActionHandler();
        }

        /** Returns a list of roll handlers to Token Action HUD Core.
         * Used to populate the Roll Handler module setting choices.
         * @override
         * @returns {object} The available roll handlers
         */
        getAvailableRollHandlers() {
            return { core: 'Sentiment' }
        }

        /** Returns an instance of the RollHandler to Token Action HUD Core.
         * @override
         * @param {string} id   The roll handler ID
         * @returns {class}     The RollHandler instance
         */
        getRollHandler(id) {
            return new RollHandler();
        }

        /** Returns the default layout and groups to Token Action HUD Core.
         * @override
         * @returns {object} The default layout and groups
         */
        async registerDefaults() {
            return DEFAULT_LAYOUT;
        }

        /** Register Token Action HUD system module settings.
         * @override
         * @param {function} onChangeFunction The Token Action HUD Core update function
         */
        registerSettings(onChangeFunction) {}
    }
});