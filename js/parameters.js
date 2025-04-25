function Value(id, name) {
    this.id = id;
    this.name = name;
}

function Param(id, name, values, notes) {
    this.id = id;
    this.name = name;
    this.values = values;
    this.notes = notes;
    this.values.attr('id', 'param_'+id);
    this.values.change(async function() {
        console.log('Parameter ' + id + ' changed to ' + $(this).val());
        const row = $('#row_'+id);
        row.addClass('disabled').find('select,input').prop('disabled', true);
        set_param(id, parseInt($(this).val()));
        await sleep(100);
        while(true) {
            read_param(id);
            await sleep(100);
            if (!is_waiting_for(id)) {
                break;
            }
        }
    })
}

function Slider(start, end, default_value) {
    let input = $('<input/>', {class: 'custom-range', type: 'range', tooltip: 'always', min: start, max: end, disabled: true});
    input[0].default_value = default_value;
    return input;
}

function Options(values, default_value, default_note) {
    let selector = $('<select/>', {class: 'custom-select', disabled: true});
    selector[0].default_value = default_value;
    let default_str = 'Default';
    if(default_note) { default_str += ' – ' + default_note}
    for(let i = 0; i < values.length; i++) {
        let value_str = values[i];
        if(i === default_value) { value_str += ' (' + default_str + ')' }
        selector.append($('<option/>', {value: i, text: value_str}));
    }
    return selector;
}

function Range(start, end) {
    return [...Array(end - start + 1).keys()].map(i => i + start);
}

let params = [
    new Param(0x6, 'MIDI Channel', Options(Range(0, 15), 0)),
];
