import { ActionType } from './constants.mjs'

export let ActionHandler = null;

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {

    /**
    * The types of rolls core to the Sentiment system and associated properties.
    */
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
    });

    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD.
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {

        /** 
         * Build system actions.
         * @override
         * @param {array}
         */
        async buildSystemActions(_) {
            this.#buildCoreRollGroup();
            this.#buildCustomRollGroup();
            this.#buildAttributeStatusGroup();
            this.#buildSwingGroup();
        }

        /**
         * Build and populate the group containing Sentiment's core roll actions.
         */
        #buildCoreRollGroup() {
            const coreRollGroup = {
                id: 'core-rolls',
                type: 'system'
            };

            this.addGroup(coreRollGroup);
            this.addActions(
                [
                    CoreRollAction.RollToDo,
                    CoreRollAction.RollToDye,
                    CoreRollAction.RecoveryRoll
                ],
                coreRollGroup);
        }

        /**
         * Build and populate the group containing the character's custom roll actions.
         */
        #buildCustomRollGroup() {
            const customRolls = this.actor.items.filter((item) => item.type == "customRoll");
            if (!customRolls.length) {
                return;
            }

            const customRollGroup = {
                id: 'custom-rolls',
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

            this.addGroup(customRollGroup);
            this.addActions(actions, customRollGroup);
        }

        /**
         * Build and populate the group providing actions to set the status of each of the character's attributes.
         */
        #buildAttributeStatusGroup() {
            const attributeStatusParentGroup = { id: 'attribute-status' };
            const attributes = this.actor.getAttributes();

            if (!attributes.length) {
                this.removeGroup(attributeStatusParentGroup);
                return;
            }

            attributes.forEach((attribute) => {
                const attributeStatusGroup = {
                    id: ActionType.SetAttributeStatus + '_' + attribute._id,
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
                        id: attributeStatusGroup.id + '_normal',
                        name: "Normal",
                        encodedValue: JSON.stringify({
                            action: ActionType.SetAttributeStatus,
                            attributeId: attribute._id,
                            status: CONFIG.Sentiment.AttributeStatus.Normal
                        }),
                        cssClass: currentStatus === CONFIG.Sentiment.AttributeStatus.Normal ? "toggle active" : "toggle"
                    },
                    {
                        id: attributeStatusGroup.id + '_locked-out',
                        name: "Locked Out",
                        encodedValue: JSON.stringify({
                            action: ActionType.SetAttributeStatus,
                            attributeId: attribute._id,
                            status: CONFIG.Sentiment.AttributeStatus.LockedOut
                        }),
                        cssClass: currentStatus === CONFIG.Sentiment.AttributeStatus.LockedOut ? "toggle active" : "toggle"
                    },
                    {
                        id: attributeStatusGroup.id + '_wounded',
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

        /**
         * Build and populate the group providing actions to set the character's swing attribute and value.
         */
        #buildSwingGroup() {
            const swingParentGroup = { id: 'swing' };
            const healthyAttributes = this.actor.getAttributes().filter((attribute) => attribute.system.status == CONFIG.Sentiment.AttributeStatus.Normal);

            if (!healthyAttributes.length) {
                this.removeGroup(swingParentGroup);
                return;
            }

            const currentSwing = this.actor.system.swing;
            const swingNoneGroup = {
                id: 'swing-none',
                type: 'system'
            };

            const swingNoneAction = {
                id: 'swing-none-action',
                name: "None",
                encodedValue: JSON.stringify({ action: ActionType.DropSwing }),
                cssClass: 'toggle'
            };

            if (currentSwing.attributeId === CONFIG.Sentiment.AttributeIdNoSwing) {
                swingNoneAction.cssClass += ' active';
            }

            this.addGroup(swingNoneGroup, swingParentGroup);
            this.addActions([swingNoneAction], swingNoneGroup);

            healthyAttributes.forEach((attribute) => {
                const attributeSetSwingGroup = {
                    id: ActionType.SetSwing + '_' + attribute._id,
                    name: attribute.name,
                    type: 'system-derived',
                    settings: {
                        showTitle: true,
                        //image: attribute.img
                    }
                }

                const actions = [];
                for (let swingValue = attribute.system.modifier + 1; swingValue < attribute.system.modifier + 7; swingValue++) {
                    actions.push({
                        id: attributeSetSwingGroup.id + '_' + swingValue,
                        name: `${swingValue}`,
                        encodedValue: JSON.stringify({
                            action: ActionType.SetSwing,
                            attributeId: attribute._id,
                            swingValue
                        }),
                        cssClass: currentSwing.attributeId === attribute._id && currentSwing.value === swingValue ? "toggle active" : "toggle"
                    });
                }

                this.addGroup(attributeSetSwingGroup, swingParentGroup);
                this.addActions(actions, attributeSetSwingGroup);
            });
        }
    }
});