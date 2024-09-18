import { ActionType } from "./constants.mjs"

export let RollHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {

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
                case ActionType.DropSwing:
                    this.actor.dropSwing();
                    break;
                case ActionType.SetSwing:
                    this.actor.setSwing(value.attributeId, value.swingValue);
                    break;
                default:
                    console.error("Unexpected encodedValue encountered in handleActionClick");
                    break;
            }
        }
    }
});