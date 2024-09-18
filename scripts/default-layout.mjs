export const DEFAULT_LAYOUT = Object.freeze({
    layout: [
        {
            id: 'rolls',
            nestId: 'rolls',
            name: 'Rolls',
            groups: [
                { id: 'core-rolls', nestId: 'rolls_core-rolls', name: 'Core', type: 'system' },
                { id: 'custom-rolls', nestId: 'rolls_custom-rolls', name: 'Custom', type: 'system' }
            ]
        },
        {
            id: 'attribute-status',
            nestId: 'attribute-status',
            name: 'Attribute Status',
            groups: []
        },
        {
            id: 'swing',
            nestId: 'swing',
            name: 'Swing',
            groups: [{ id: 'swing-none', nestId: 'swing_swing-none', name: 'None', type: 'system' }]
        }
    ],
    group: [
        { id: 'core-rolls', name: 'Core', type: 'system' },
        { id: 'custom-rolls', name: 'Custom', type: 'system' },
        { id: 'swing-none', name: 'None', type: 'system' }
    ]
});