import {
    ActionType,
    GroupType
} from "./constants.mjs"

import {
    CORE_ROLLS_GROUP,
    CUSTOM_ROLLS_GROUP,
    ATTRIBUTE_STATUS_GROUP,
    SWING_GROUP,
    SWING_NONE_GROUP
} from "./groups.mjs"

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {

    /**
    * The types of rolls core to the Sentiment system and associated properties.
    */
    const CoreRollActions = Object.freeze({
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
     * Extends Token Action HUD Core"s ActionHandler class and builds system-defined actions for the HUD.
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
            this.addGroup(CORE_ROLLS_GROUP);
            this.addActions(
                [
                    CoreRollActions.RollToDo,
                    CoreRollActions.RollToDye,
                    CoreRollActions.RecoveryRoll
                ],
                CORE_ROLLS_GROUP);
        }

        /**
         * Build and populate the group containing the character's custom roll actions.
         */
        #buildCustomRollGroup() {
            const customRolls = this.actor.items.filter((item) => item.type == "customRoll");
            if (!customRolls.length) {
                return;
            }

            const actions = customRolls.map((customRoll) => {
                const coreRollAction = CoreRollActions[customRoll.system.rollType];
                if (!coreRollAction) {
                    console.error(`Unexpected roll type ${customRoll.system.rollType} on Custom Roll with ID ${customRoll._id}`);
                    return {};
                }

                return {
                    id: `${ActionType.CustomRoll}_${customRoll._id}`,
                    name: customRoll.name,
                    encodedValue: JSON.stringify({
                        action: ActionType.CustomRoll,
                        customRollId: customRoll._id
                    }),
                    img: coreRollAction.img
                }
            });

            this.addGroup(CUSTOM_ROLLS_GROUP);
            this.addActions(actions, CUSTOM_ROLLS_GROUP);
        }

        /**
         * Build and populate the group providing actions to set the status of each of the character's attributes.
         */
        #buildAttributeStatusGroup() {
            const attributes = this.actor.getAttributes();
            if (!attributes.length) {
                this.removeGroup(ATTRIBUTE_STATUS_GROUP);
                return;
            }

            attributes.forEach((attribute) => {
                const attributeStatusGroup = {
                    id: `${ActionType.SetAttributeStatus}_${attribute._id}`,
                    name: attribute.name,
                    type: GroupType.SystemDerived,
                    settings: { showTitle: true }
                }

                const actions = [];
                CONFIG.Sentiment.AttributeStatusStrings.forEach((statusString, status) => {
                    actions.push({
                        id: `${attributeStatusGroup.id}_${statusString}`,
                        name: statusString,
                        encodedValue: JSON.stringify({
                            action: ActionType.SetAttributeStatus,
                            attributeId: attribute._id,
                            status
                        }),
                        cssClass: attribute.system.status === status ? "toggle active" : "toggle"
                    });
                });

                this.addGroup(attributeStatusGroup, ATTRIBUTE_STATUS_GROUP);
                this.addActions(actions, attributeStatusGroup);
            });
        }

        /**
         * Build and populate the group providing actions to set the character's swing attribute and value.
         */
        #buildSwingGroup() {
            const healthyAttributes = this.actor.getAttributes().filter((attribute) => attribute.system.status == CONFIG.Sentiment.AttributeStatus.Normal);

            if (!healthyAttributes.length) {
                this.removeGroup(SWING_GROUP);
                return;
            }

            const currentSwing = this.actor.system.swing;

            const swingNoneAction = {
                id: "swing-none-action",
                name: "None",
                encodedValue: JSON.stringify({ action: ActionType.DropSwing }),
                cssClass: "toggle"
            };

            if (currentSwing.attributeId === CONFIG.Sentiment.AttributeIdNoSwing) {
                swingNoneAction.cssClass += " active";
            }

            this.addGroup(SWING_NONE_GROUP, SWING_GROUP);
            this.addActions([swingNoneAction], SWING_NONE_GROUP);

            healthyAttributes.forEach((attribute) => {
                const attributeSetSwingGroup = {
                    id: `${ActionType.SetSwing}_${attribute._id}`,
                    name: attribute.name,
                    type: GroupType.SystemDerived,
                    settings: { showTitle: true }
                }

                const actions = [];
                for (let swingValue = attribute.system.modifier + 1; swingValue < attribute.system.modifier + 7; swingValue++) {
                    actions.push({
                        id: `${attributeSetSwingGroup.id}_${swingValue}`,
                        name: `${swingValue}`,
                        encodedValue: JSON.stringify({
                            action: ActionType.SetSwing,
                            attributeId: attribute._id,
                            swingValue
                        }),
                        cssClass: currentSwing.attributeId === attribute._id && currentSwing.value === swingValue ? "toggle active" : "toggle"
                    });
                }

                this.addGroup(attributeSetSwingGroup, SWING_GROUP);
                this.addActions(actions, attributeSetSwingGroup);
            });
        }
    }
});