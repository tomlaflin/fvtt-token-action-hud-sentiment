import { GroupType } from "./constants.mjs"

export const ROLLS_GROUP = {
    id: "rolls",
    nestId: "rolls",
    name: "Rolls",
}

export const CORE_ROLLS_GROUP = {
    id: "core-rolls",
    name: "Core",
    type: GroupType.System
};

export const CUSTOM_ROLLS_GROUP = {
    id: "custom-rolls",
    name: "Custom",
    type: GroupType.System
};

export const ATTRIBUTE_STATUS_GROUP = {
    id: "attribute-status",
    nestId: "attribute-status",
    name: "Attribute Status",
};

export const SWING_NONE_GROUP = {
    id: "swing-none",
    name: "None",
    type: GroupType.System
};

export const SWING_GROUP = {
    id: "swing",
    nestId: "swing",
    name: "Swing"
};

function buildNestId(group, parent) {
    return `${parent.nestId}_${group.id}`;
}

export const DEFAULT_LAYOUT = Object.freeze({
    layout: [
        {
            ...ROLLS_GROUP,
            groups: [
                { ...CORE_ROLLS_GROUP, nestId: buildNestId(CORE_ROLLS_GROUP, ROLLS_GROUP) },
                { ...CUSTOM_ROLLS_GROUP, nestId: buildNestId(CUSTOM_ROLLS_GROUP, ROLLS_GROUP) },
            ]
        },
        {
            ...ATTRIBUTE_STATUS_GROUP,
            groups: []
        },
        {
            ...SWING_GROUP,
            groups: [{ ...SWING_NONE_GROUP, nestId: buildNestId(SWING_NONE_GROUP, SWING_GROUP) }]
        }
    ],
    group: [
        CORE_ROLLS_GROUP,
        CUSTOM_ROLLS_GROUP,
        SWING_NONE_GROUP
    ]
});