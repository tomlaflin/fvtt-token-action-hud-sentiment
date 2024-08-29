
let SystemManager, ActionHandler, RollHandler;

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
            return {
                layout: [
                    {
                        id: 'rolls',
                        nestId: 'rolls',
                        name: 'Rolls',
                        groups: [
                            { id: 'core', nestId: 'rolls_core', name: 'Core', type: 'system' }
                        ]
                    }
                ],
                group: [
                    { id: 'core', name: 'Core', type: 'system' }
                ]
            };
        }

        /** Register Token Action HUD system module settings.
         * @override
         * @param {function} onChangeFunction The Token Action HUD Core update function
         */
        registerSettings(onChangeFunction) {}
    }

    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD.
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {

        /** Build system actions.
         * @override
         * @param {array}
         */
        async buildSystemActions(_) {
            const group = {
                id: 'core',
                type: 'system'
            };

            this.addGroup(group);
            this.addActions(
                [
                    {
                        id: 'roll_to_do',
                        name: "Roll to Do",
                        encodedValue: '',
                        img: "icons/svg/d20-grey.svg"
                    },
                    {
                        id: 'roll_to_dye',
                        name: "Roll to Dye",
                        encodedValue: '',
                        img: "icons/svg/d6-grey.svg"
                    },
                    {
                        id: 'roll_to_recover',
                        name: "Roll to Recover",
                        encodedValue: '',
                        img: "icons/svg/heal.svg"
                    }
                ],
                group);
        }
    }

    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked.
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {

        /** Handle when an action is left or right-clicked.
         * @override
         * @param {object} event
         * @param {string} code 
         */
        handleActionClick(event, code) {}

    }

})

const ID = 'token-action-hud-sentiment'
const REQUIRED_CORE_MODULE_VERSION = '1.5'

Hooks.on('tokenActionHudCoreApiReady', async () => {
    const module = game.modules.get(ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
})