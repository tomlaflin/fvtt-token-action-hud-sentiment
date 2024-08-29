
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
                            { id: 'core', nestId: 'rolls_core', name: 'Core', type: 'system' },
                            { id: 'custom', nestId: 'rolls_custom', name: 'Custom', type: 'system' }
                        ]
                    }
                ],
                group: [
                    { id: 'core', name: 'Core', type: 'system' },
                    { id: 'custom', name: 'Custom', type: 'system' }
                ]
            };
        }

        /** Register Token Action HUD system module settings.
         * @override
         * @param {function} onChangeFunction The Token Action HUD Core update function
         */
        registerSettings(onChangeFunction) {}
    }

    const ActionType = Object.freeze({
        RollToDo: "roll-to-do",
        RollToDye: "roll-to-dye",
        RecoveryRoll: "recovery-roll",
        CustomRoll: "custom-roll"
    });

    const CoreRollAction = Object.freeze({
        RollToDo: {
            id: ActionType.RollToDo,
            name: "Roll to Do",
            encodedValue: ActionType.RollToDo,
            img: "icons/svg/d20-grey.svg"
        },
        RollToDye: {
            id: ActionType.RollToDye,
            name: "Roll to Dye",
            encodedValue: ActionType.RollToDye,
            img: "icons/svg/d6-grey.svg"
        },
        RecoveryRoll: {
            id: ActionType.RecoveryRoll,
            name: "Recovery Roll",
            encodedValue: ActionType.RecoveryRoll,
            img: "icons/svg/heal.svg"
        }
    })

    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD.
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {

        /** Build system actions.
         * @override
         * @param {array}
         */
        async buildSystemActions(_) {
            const coreGroup = {
                id: 'core',
                type: 'system'
            };

            this.addGroup(coreGroup);
            this.addActions(
                [
                    CoreRollAction.RollToDo,
                    CoreRollAction.RollToDye,
                    CoreRollAction.RecoveryRoll
                ],
                coreGroup);

            if (this.actor.system.customRolls.length > 0) {
                const customGroup = {
                    id: 'custom',
                    type: 'system'
                }

                const actions = this.actor.system.customRolls.map((customRoll) => {
                    const value = {
                        action: ActionType.CustomRoll,
                        customRoll
                    };

                    let img = "";
                    switch (customRoll.rollType) {
                        case CONFIG.Sentiment.RollType.RollToDo:
                            img = CoreRollAction.RollToDo.img;
                            break;
                        case CONFIG.Sentiment.RollType.RollToDye:
                            img = CoreRollAction.RollToDye.img;
                            break;
                        case CONFIG.Sentiment.RollType.RecoveryRoll:
                            img = CoreRollAction.RecoveryRoll.img;
                            break;
                        default:
                            console.error("Unexpected rollType for custom roll " + customRoll.name + " encountered in buildSystemActions");
                            break;
                    }

                    return {
                        id: ActionType.CustomRoll + '_' + customRoll.name,
                        name: customRoll.name,
                        encodedValue: JSON.stringify(value),
                        img
                    }
                });

                this.addGroup(customGroup);
                this.addActions(actions, customGroup);
            }
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
        handleActionClick(event, encodedValue) {
            console.log(encodedValue);
            switch (encodedValue) {
                case ActionType.RollToDo:
                    this.actor.rollToDo();
                    break;
                case ActionType.RollToDye:
                    this.actor.rollToDye();
                    break;
                case ActionType.RecoveryRoll:
                    this.actor.recoveryRoll();
                    break;
                default:
                    console.error("Unexpected encodedValue encountered in handleActionClick");
                    break;
            }
        }
    }
})

const MODULE_ID = 'token-action-hud-sentiment'
const REQUIRED_CORE_MODULE_VERSION = '1.5'

Hooks.on('tokenActionHudCoreApiReady', async () => {
    const module = game.modules.get(MODULE_ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
})