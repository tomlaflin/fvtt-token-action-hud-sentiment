
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
                    },
                    {
                        id: 'attribute-status',
                        nestId: 'attribute-status',
                        name: 'Attribute Status',
                        groups: []
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
        CustomRoll: "custom-roll",
        SetAttributeStatus: "set-attribute-status"
    });

    const CoreRollAction = Object.freeze({
        RollToDo: {
            id: ActionType.RollToDo,
            name: CONFIG.Sentiment.RollTypes.RollToDo.DisplayName,
            encodedValue: JSON.stringify({ action: ActionType.RollToDo }),
            img: "icons/svg/d20-grey.svg"
        },
        RollToDye: {
            id: ActionType.RollToDye,
            name: CONFIG.Sentiment.RollTypes.RollToDye.DisplayName,
            encodedValue: JSON.stringify({ action: ActionType.RollToDye }),
            img: "icons/svg/d6-grey.svg"
        },
        RecoveryRoll: {
            id: ActionType.RecoveryRoll,
            name: CONFIG.Sentiment.RollTypes.RecoveryRoll.DisplayName,
            encodedValue: JSON.stringify({ action: ActionType.RecoveryRoll }),
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

            const customRolls = this.actor.items.filter((item) => item.type == "customRoll");

            if (customRolls.length > 0) {
                const customGroup = {
                    id: 'custom',
                    type: 'system'
                };

                const actions = customRolls.map((customRoll) => {
                    const value = {
                        action: ActionType.CustomRoll,
                        customRoll
                    };

                    const coreRollAction = CoreRollAction[customRoll.system.rollType];
                    if (!coreRollAction) {
                        console.error("Unexpected roll type " + customRoll.system.rollType + " on Custom Roll with ID  " + customRoll._id);
                        return {};
                    }

                    return {
                        id: ActionType.CustomRoll + '_' + customRoll._id,
                        name: customRoll.name,
                        encodedValue: JSON.stringify(value),
                        img: coreRollAction.img
                    }
                });

                this.addGroup(customGroup);
                this.addActions(actions, customGroup);
            }

            const attributeStatusParentGroup = { id: 'attribute-status' };
            const attributes = this.actor.items.filter((item) => item.type == "attribute");
            if (!attributes.length) {
                this.removeGroup(attributeStatusParentGroup);
            }
            else {
                attributes.forEach((attribute) => {
                    const attributeStatusGroup = {
                        id: 'attribute-' + attribute._id,
                        name: attribute.name,
                        type: 'system-derived',
                        settings: {
                            showTitle: true,
                            //image: attribute.img
                        }
                    }

                    const currentStatus = attribute.system.status;
                    const actions = [
                        {
                            id: ActionType.SetAttributeStatus + '_' + attributeStatusGroup.id + '_normal',
                            name: "Normal",
                            encodedValue: JSON.stringify({
                                action: ActionType.SetAttributeStatus,
                                attributeId: attribute._id,
                                status: CONFIG.Sentiment.AttributeStatus.Normal
                            }),
                            cssClass: currentStatus === CONFIG.Sentiment.AttributeStatus.Normal ? "toggle active" : "toggle"
                        },
                        {
                            id: ActionType.SetAttributeStatus + '_' + attributeStatusGroup.id + '_locked-out',
                            name: "Locked Out",
                            encodedValue: JSON.stringify({
                                action: ActionType.SetAttributeStatus,
                                attributeId: attribute._id,
                                status: CONFIG.Sentiment.AttributeStatus.LockedOut
                            }),
                            cssClass: currentStatus === CONFIG.Sentiment.AttributeStatus.LockedOut ? "toggle active" : "toggle"
                        },
                        {
                            id: ActionType.SetAttributeStatus + '_' + attributeStatusGroup.id + '_wounded',
                            name: "Wounded",
                            encodedValue: JSON.stringify({
                                action: ActionType.SetAttributeStatus,
                                attributeId: attribute._id,
                                status: CONFIG.Sentiment.AttributeStatus.Wounded
                            }),
                            cssClass: currentStatus === CONFIG.Sentiment.AttributeStatus.Wounded ? "toggle active" : "toggle"
                        }
                    ];

                    this.addGroup(attributeStatusGroup, attributeStatusParentGroup);
                    this.addActions(actions, attributeStatusGroup);
                });
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
            const value = JSON.parse(encodedValue);
            console.log(value);

            switch (value.action) {
                case ActionType.RollToDo:
                    this.actor.rollToDo();
                    break;
                case ActionType.RollToDye:
                    this.actor.rollToDye();
                    break;
                case ActionType.RecoveryRoll:
                    this.actor.recoveryRoll();
                    break;
                case ActionType.CustomRoll:
                    this.actor.executeCustomRoll(value.customRoll._id);
                    break;
                case ActionType.SetAttributeStatus:
                    this.actor.setAttributeStatus(value.attributeId, value.status);
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