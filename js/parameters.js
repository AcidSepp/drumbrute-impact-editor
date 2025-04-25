function Value(id, name) {
    this.id = id;
    this.name = name;
}

function Param(id, name, values, notes) {
    this.id = id;
    this.name = name;
    this.values = values;
    this.notes = notes;
    this.values.attr("id", "param_"+id);
    this.values.change(async function() {
        console.log("Parameter " + id + " changed to " + $(this).val());
        const row = $("#row_"+id);
        row.addClass("disabled").find("select,input").prop("disabled", true);
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
    let input = $("<input/>", {class: "custom-range", type: "range", tooltip: "always", min: start, max: end, disabled: true});
    input[0].default_value = default_value;
    return input;
}

function Options(values, default_value, default_note) {
    let selector = $("<select/>", {class: "custom-select", disabled: true});
    selector[0].default_value = default_value;
    let default_str = "Default";
    if(default_note) { default_str += " – " + default_note}
    for(let i = 0; i < values.length; i++) {
        let value_str = values[i];
        if(i === default_value) { value_str += " (" + default_str + ")" }
        selector.append($("<option/>", {value: i, text: value_str}));
    }
    return selector;
}

function Range(start, end) {
    return [...Array(end - start + 1).keys()].map(i => i + start);
}

let midiRoutingOptions = ["Off", "USB and MIDI", "USB", "MIDI"];
let params = [
    // Global
    new Param(0x6, "MIDI Channel", Options(Range(0, 15), 0)),
    new Param(0x10, "Clock In/Out Settings", Options(["1_PULSE", "2PULSE", "24PPQ", "48PPQ"], 2)),
    new Param(0x11, "Auto Sync", Options(["Off", "On"], 1)),
    new Param(0x21, "Tap Tempo", Options(["1", "2", "3", "4"], 2)),
    new Param(0x13, "Global BPM", Options(["Off", "On"], 1)),
    new Param(0x16, "Wait to Load Pattern", Options(["Off", "On"], 1)),
    new Param(0x20, "Accent Velocity Threshold", Options(Range(0, 127), 1)),
    new Param(0x21, "Pads send MIDI notes", Options(midiRoutingOptions, 1)),
    new Param(0x17, "Sequencer sends MIDI notes", Options(midiRoutingOptions, 1)),
    new Param(0x22, "Metronome", Options("1/4, 1/4T, 1/8, 1/8T, 1/16, 1/16T, 1/32", 0)),
    new Param(0x51, "Step Repeat Randomizer", Options(["Off", "On"], 0)),
    new Param(0x52, "Step Repeat Probability", Options(Range(0, 100), 100)),
    new Param(0x50, "Vegas mode", Options(["Off", "On"], 0)),
    new Param(0x23, "Pause mode", Options(["From current", "From beginning"], 1)),
    new Param(0x24, "Next bank", Options(["Click on bank then pattern", "Click on bank switches instantly"], 0)),
    new Param(0x1, "Local Control", Options(["Off", "On"], 1)),
    new Param(0x2c, "Solo / Mute mode", Options(["Toggle", "Latch"], 0)),

    // Roller/looper
    new Param(0x53, "Roller/Looper Mode", Options(["Looper", "Roller"], 1)),
    new Param(0x2b, "Roller/Looper MIDI Send", Options(["Off", "On"], 1)),
    new Param(0x25, "Roller/Looper MIDI CC", Options(Range(0, 127), 0)),

    // Transport
    new Param(0x2c, "Transports", Options(["Off", "MIDI", "MMC", "Both"], 3)),
    new Param(0x61, "Stop Channel", Options(Range(0, 15), 0)),
    new Param(0x62, "Rec Channel", Options(Range(0, 15), 0)),
    new Param(0x63, "Play Channel", Options(Range(0, 15), 0)),
    new Param(0x64, "Stop CC", Options(Range(0, 127), 51)),
    new Param(0x65, "Rec CC", Options(Range(0, 127), 0)),
    new Param(0x66, "Play CC", Options(Range(0, 127), 54)),

    // MIDI MAPPING
    new Param(0x30, "Kick", Options(Range(0, 127), 36)),
    new Param(0x31, "Snare1", Options(Range(0, 127), 37)),
    new Param(0x32, "Snare2", Options(Range(0, 127), 38)),
    new Param(0x33, "Tom H", Options(Range(0, 127), 39)),
    new Param(0x34, "Tom L", Options(Range(0, 127), 40)),
    new Param(0x35, "Cymbal", Options(Range(0, 127), 41)),
    new Param(0x36, "Cowbell", Options(Range(0, 127), 42)),
    new Param(0x37, "Cl Hat", Options(Range(0, 127), 43)),
    new Param(0x38, "Op Hat", Options(Range(0, 127), 44)),
    new Param(0x39, "FM", Options(Range(0, 127), 45)),

    new Param(0x3a, "Colored Kick", Options(Range(0, 127), 48)),
    new Param(0x3b, "Colored Snare1", Options(Range(0, 127), 49)),
    new Param(0x3c, "Colored Snare2", Options(Range(0, 127), 50)),
    new Param(0x3d, "Colored Tom H", Options(Range(0, 127), 51)),
    new Param(0x3e, "Colored Tom L", Options(Range(0, 127), 52)),
    new Param(0x3f, "Colored Cymbal", Options(Range(0, 127), 53)),
    // no colored Cowbell
    new Param(0x40, "Colored Cl Hat", Options(Range(0, 127), 55)),
    new Param(0x41, "Colored Op Hat", Options(Range(0, 127), 56)),
    new Param(0x42, "Colored FM", Options(Range(0, 127), 57)),
];
