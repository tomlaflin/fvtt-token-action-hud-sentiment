export const DEFAULT_LAYOUT = Object.freeze({
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
        },
        {
            id: 'swing',
            nestId: 'swing',
            name: 'Swing',
            groups: [{ id: 'swing-none', nestId: 'swing_swing-none', name: 'None', type: 'system' }]
        }
    ],
    group: [
        { id: 'core', name: 'Core', type: 'system' },
        { id: 'custom', name: 'Custom', type: 'system' },
        { id: 'swing-none', name: 'None', type: 'system' }
    ]
});