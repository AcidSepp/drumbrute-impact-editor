var midi_out;
var midi_in;

// { [param_id]: true/false }
// true => request sent, waiting for param
// false => not waiting for param
var params_waiting = {};

async function open_midi_out() {
    midi_out = undefined;
    $('#midiOutName').html('No Connection');
    midi_out = JZZ({sysex: true}).openMidiOut(/Impact/)
        .or(function () {
            $('#midiOutName').html('Cannot find DrumBrute Impact!');
        })
        .and(function () {
            $('#midiOutName').html(this.name());
            console.log(this.info());
        });
    try {
        await midi_out;
        return true;
    } catch (e) {
        console.warn(e.message);
        return false;
    }
}

async function open_midi_in() {
    midi_in = undefined;
    $('#midiInName').html('No Connection');
    midi_in = JZZ({sysex: true}).openMidiIn(/Impact/)
        .or(function () {
            $('#midiInName').html('Cannot find DrumBrute Impact!');
        })
        .and(function () {
            $('#midiInName').html(this.name());
            console.log(this.info());
        })
        .connect(update_param);
    try {
        await midi_in;
        return true;
    } catch (e) {
        console.warn(e.message);
        return false;
    }
}

async function update_param(msg) {
    if (msg.isSysEx()) {
        if (msg.length === 12) {
            let param_id = msg[9];
            params_waiting[param_id] = false;
            let param_str = 'param_' + param_id;

            let value = msg[10]

            $('#' + param_str).val(value);
            const row = $('#row_' + param_id);
            row.removeClass('disabled').find('select,input').prop('disabled', false);
            row[0].update_defaultness();
            console.log('Set Parameter ' + param_id + ' to ' + value);
        }
    }
}


function set_param(param_id, value) {
    let msg = [0xf0, 0x0, 0x20, 0x6b, 0x7f, 0x42, 0x2, 0x0, 0x41, param_id, value, 0xf7]
    midi_out.send(msg);
}

function read_param(param_id) {
    let msg = [0xf0, 0x0, 0x20, 0x6b, 0x7f, 0x42, 0x1, 0x0, 0x41, param_id, 0xf7]
    console.log('Sending read request for Parameter ' + param_id);
    params_waiting[param_id] = true;
    midi_out.send(msg);
}

async function sleep(time_ms) {
    return new Promise(r => setTimeout(r, time_ms));
}

function is_waiting_for(param_id) {
    return params_waiting[param_id];
}

async function scan_midi(param_ids, wait_ms) {
    await sleep(500);
    for (let param_id of param_ids) {
        read_param(param_id);
        await sleep(wait_ms);
    }
    return Object.keys(params_waiting)
        .map(k => ({k, v: params_waiting[k]}))
        .filter(({v}) => v) // keep ones we are still waiting for.
        .map(({k}) => k);
}
