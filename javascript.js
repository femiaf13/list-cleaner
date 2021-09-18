var inputElement = document.getElementById('input-list')
var outputElement = document.getElementById('output-list')

function clean() {
    outputElement.innerHTML = "";
    parseList(inputElement.value);
}

const splitLines = str => str.split(/\r?\n/);

let in_battalion = false;
const BATTALION_NAMES = [
    "Hunters of the Heartlands",
    "Alpha-Beast Pack",
    "Warlord",
    "Command Entourage",
    "Vanguard",
    "Grand Battery",
    "Battle Regiment",
    "Linebreaker",
    "Redemption Brotherhood",
    "Brotherhood Command",
    "Soulstrike Brotherhood",
    "Ironjawz Fist",
    "Kruleboyz Finga",
    "Bonesplitterz Rukk"
]
const BATTALION_SYMBOL = "+";

/**
 * Global variable for army list
 */
let army_list = {
    army_name: "",
    army_alleigance: "",
    army_type: "",
    army_subfaction: "",
    grand_strategy: "",
    triumphs: "",
    unique_enhancement: "",
    units: {
        battalions:[],
        none: []
    },
    endless_spells: [],
    total_points: ""

};

/**
 * 
 * @param {object} army_list 
 */
function refreshArmyListObject() {
    army_list = {
        army_name: "",
        army_alleigance: "",
        army_type: "",
        army_subfaction: "",
        grand_strategy: "",
        triumphs: "",
        unique_enhancement: "",
        units: {
            battalions:[],
            none: []
        },
        endless_spells: [],
        total_points: ""
    }
}

/**
 * This function goes through the export line by line
 * and parses the important info out
 * @param {string} list export from AoS app
 */
function parseList(list) {
    // let lines = splitLines(list).reduce((accum, line) => {
    //   if (!line.match(/^ *(Battlefield Role|Battalion Slot Filled).*$/)) accum.push(line)
    //   return accum
    // }, []);
    // let output = lines.join('\n')

    // Blank the previous list before doing anything else 
    refreshArmyListObject()
    var arr = list.split(/\r?\n/);
    let parsing_units = false;
    let parsing_battalions = false;
    let parsing_endless = false;
    let num_batts = 0;

    for (var i = 0; i < arr.length; i++){

        let line = arr[i];
        if (line == "") {
            continue;
        }
        // console.log(JSON.stringify(line))
        parseArmyWide(line);
        
        if (line.includes("Total Points")) {
            parsing_units = false;
            parsing_battalions = false;
            parsing_endless = false;
        }
        else if (line.includes("Core Battalions")) {
            parsing_units = false;
            parsing_battalions = true;
            parsing_endless = false;
            // Skip to the name of the first battalion
            continue;
        }
        else if (line.includes("Endless Spells")) {
            parsing_units = false;
            parsing_battalions = false;
            parsing_endless = true;
            // Skip to the name of the first endless
            continue;
        }

        if (parsing_units) {
            // Unit name and start of the unit
            const start_index = i;
            let final_unit_index = i+1;

            // parseint because IDK if JS is copy by value or ref
            for (let j = parseInt(i+1); j < arr.length; j++) {
                const element = arr[j];
                // Mark the end of this unit
                if(element.includes("Points")){
                    final_unit_index = j;
                    break;
                }
            }

            let unit_stats = parseUnit(start_index, final_unit_index, arr)
            army_list.units.none.push(unit_stats);
            // No need to iterate over again, skip ahead to the nex one
            i = final_unit_index;
        }
        else if (parsing_battalions) {
            // Batt name and start of the batt
            const start_index = i;
            let final_batt_index = i+1;

            // parseint because IDK if JS is copy by value or ref
            for (let j = parseInt(i+1); j < arr.length; j++) {
                let element = arr[j].trim();
                // Mark the end of this battalion
                if(BATTALION_NAMES.indexOf(element) != -1){
                    // The next battalion minu 1 line
                    final_batt_index = j-1;
                    break;
                }
                // Because the batts might just end gotta catch it
                if (element.includes("Total Points") || element.includes("Endless Spells")) {
                    final_batt_index = j-1;
                    break;
                }
            }

            num_batts++;
            let batt = parseBattalion(start_index, final_batt_index, arr, num_batts)
            army_list.units.battalions.push(batt);

            // army_list.units.battalions.push(arr[start_index].trim());

            // let unit_stats = parseUnit(start_index, final_batt_index, arr)
            // army_list.units.none.push(unit_stats);
            // No need to iterate over again, skip ahead to the nex one
            i = final_batt_index;
        }
        else if (parsing_endless) {
             // Unit name and start of the unit
             const start_index = i;
             let final_endless_index = i+1;
 
             // parseint because IDK if JS is copy by value or ref
             for (let j = parseInt(i+1); j < arr.length; j++) {
                 const element = arr[j];
                 // Mark the end of this unit
                 if(element.includes("Points")){
                     final_unit_index = j;
                     break;
                 }
             }
 
             let endless_stats = parseEndless(start_index, final_unit_index, arr)
             army_list.endless_spells.push(endless_stats);
             // No need to iterate over again, skip ahead to the nex one
             i = final_unit_index;
        }

        // Some flags to control flow through this
        if (!parsing_units && line.includes("Units")) {
            parsing_units = true;
            parsing_battalions = false
        }
        

    }

    // Change the output text box
    // outputElement.innerText = output;
    outputElement.innerText = formatList(army_list);

}

/**
 * Take the line and parse it depending on the contents
 * @param {string} line one line from the list
 */
function parseArmyWide(line) {
    if (line.includes("Army Name:")) {
        army_list.army_name = line.split(":")[1].trim();
    }
    else if (line.includes("Army Faction:")) {
        army_list.army_alleigance = line.split(":")[1].trim();
    }
    else if (line.includes("Army Type:")) {
        army_list.army_type = line.split(":")[1].trim();
    }
    else if (line.includes("Subfaction:")) {
        army_list.army_subfaction = line.split(":")[1].trim();
    }
    else if (line.includes("Grand Strategy:")) {
        army_list.grand_strategy = line.split(":")[1].trim();
    }
    else if (line.includes("Triumph")) {
        army_list.triumphs = line.split(":")[1].trim();
    }
    else if (line.includes("Total Points")) {
        army_list.total_points = line.split(":")[1].trim();
    }
    else if (line.includes("Holy Commands")) {
        army_list.unique_enhancement = line.split(":")[1].trim();
    }
}

/**
 * Parse all the lines of a unit
 * @param {number} start_index index for first line of unit(unit name)
 * @param {number} end_index index of last line of unit(point cost)
 * @param {string} list raw string from input box
 * @param {number} num_batt_symbol symbol to give all the units in this battalion
 */
function parseUnit(start_index, end_index, list, num_batt_symbol=0) {
    let unit = {
        unit_name: "",
        unit_role: "",
        // unit_trait: "",
        // unit_artefact: "",
        // unit_prayers: "",
        // unit_spells: "",
        // unit_mount_traits: "",
        // unit_reinforced: "",
        unit_points: "",
        unit_batt_symbol: BATTALION_SYMBOL.repeat(num_batt_symbol)
    };
    unit.unit_name = list[start_index].trim();
    for (let i = start_index; i<=end_index; i++) {
        const line = list[i];
        if (line == "") {
            continue;
        }

        if (line.includes("Battlefield Role:")) {
            unit.unit_role = line.split(":")[1].trim();
        }
        else if (line.includes("Command Traits:")){
            unit.unit_trait = line.split(":")[1].trim();
        }
        else if (line.includes("Artefact")){
            unit.unit_artefact = line.split(":")[1].trim();
        }
        else if (line.includes("Prayer")){
            unit.unit_prayers = line.split(":")[1].trim();
        }
        else if (line.includes("Spell")){
            unit.unit_spells = line.split(":")[1].trim();
        }
        else if (line.includes("Mount Trait")){
            unit.unit_mount_traits = line.split(":")[1].trim();
        }
        else if (line.includes("Reinforced")){
            unit.unit_reinforced = line.split(":")[1].trim();
        }
        else if (line.includes("Points")){
            unit.unit_points = line.split(":")[1].trim();
        }
    }

    return unit;
}

/**
 * Parse all the lines of an endless spell
 * @param {number} start_index index for first line of unit(unit name)
 * @param {number} end_index index of last line of unit(point cost)
 * @param {string} list raw string from input box

 */
 function parseEndless(start_index, end_index, list) {
    let endless = {
        endless_name: "",
        endless_points: "",
    };
    endless.endless_name = list[start_index].trim();
    for (let i = start_index; i<=end_index; i++) {
        const line = list[i];
        if (line == "") {
            continue;
        }
        if (line.includes("Points")) {
            endless.endless_points = line.split(":")[1].trim();
        }
    }

    return endless;
}

/**
 * Parse all the lines of a battalion
 * @param {number} start_index index for first line of unit(unit name)
 * @param {number} end_index index of last line of unit(point cost)
 * @param {string} list raw string from input 
 * @param {number} num_batt_symbol symbol to give all the units in this battalion
 */
function parseBattalion(start_index, end_index, list, num_batt_symbol) {
    let battalion = {
        batt_name: "",
        batt_units: [],
        // batt_bonus: "",
    };
    battalion.batt_name = list[start_index].trim();
    for (let i = start_index+1; i<=end_index; i++) {
        const line = list[i];
        if (line == "") {
            continue;
        }

        if (line.includes("Magnificent")) {
            battalion.batt_bonus = line.split(":")[1].trim();
        }
        else {
            // Unit name and start of the unit
            const start_unit_index = i;
            let final_unit_index = i+1;

            // parseint because IDK if JS is copy by value or ref
            for (let j = parseInt(i+1); j < list.length; j++) {
                const element = list[j];
                // Mark the end of this unit
                if(element.includes("Points")){
                    final_unit_index = j;
                    break;
                }
            }

            let unit_stats = parseUnit(start_unit_index, final_unit_index, list, num_batt_symbol)
            battalion.batt_units.push(unit_stats);
            // No need to iterate over again, skip ahead to the nex one
            i = final_unit_index;
        }        
    }
    return battalion;
}

/**
 * Format a specific unit and add to export string
 * @param {string} army_export raw string for export
 * @param {object} unit unit object to export to string
 */
function formatUnit(army_export, unit) {
    army_export += unit.unit_name + ' ('+unit.unit_points+')' + unit.unit_batt_symbol+'\n';
    if ('unit_trait' in unit) {
        army_export += '- Command Trait: '+unit.unit_trait+'\n';
    }
    if ('unit_artefact' in unit) {
        army_export += '- Artefact: '+unit.unit_artefact+'\n';
    }
    if ('unit_spells' in unit) {
        army_export += '- Spell: '+unit.unit_spells+'\n';
    }
    if ('unit_prayers' in unit) {
        army_export += '- Prayer: '+unit.unit_prayers+'\n';
    }
    if ('unit_mount_traits' in unit) {
        army_export += '- Mount Trait: '+unit.unit_mount_traits+'\n';
    }
    if ('unit_reinforced' in unit) {
        army_export += '- Reinforced: '+unit.unit_reinforced+'\n';
    }

    return army_export;
}

/**
 * Format the passed in army list to be readable
 * @param {object} army_list army list parsed from the AoS app input
 */
function formatList(army_list) {
    let army_export = '';
    army_export += 'List Name: '+army_list.army_name+'\n';
    army_export += 'Allegiance: '+army_list.army_alleigance+'\n';
    army_export += '- Subfaction: '+army_list.army_subfaction+'\n';
    if (army_list.army_type != "") {
        army_export += '- Army Type: '+army_list.army_type+'\n';
    }
    army_export += '- Grand Strategy: '+army_list.grand_strategy+'\n';
    army_export += '- Triumphs: '+army_list.triumphs+'\n';
    if (army_list.unique_enhancement != "") {
        army_export += '- Unique Enhancement: '+army_list.unique_enhancement+'\n';
    }
    army_export += '\n';
    army_export += 'Leaders\n';
    army_export += '----------\n';
    // Format the leaders in battalions
    army_list.units.battalions.forEach(batt => {
        batt.batt_units.forEach(batt_unit => {
            if (batt_unit.unit_role.includes("Leader")) {
                army_export = formatUnit(army_export, batt_unit);
            }
        });
    });
    // And now the ones not in battalions
    army_list.units.none.forEach(unit => {
        if (unit.unit_role.includes("Leader")) {
            army_export = formatUnit(army_export, unit);
        }
    });

    army_export += '\n';
    army_export += 'Battleline\n';
    army_export += '----------\n';
    // Format the battleline in battalions
    army_list.units.battalions.forEach(batt => {
        batt.batt_units.forEach(batt_unit => {
            if (batt_unit.unit_role == "Battleline") {
                army_export = formatUnit(army_export, batt_unit);
            }
        });
    });
    // And now the ones not in battalions
    army_list.units.none.forEach(unit => {
        if (unit.unit_role == "Battleline") {
            army_export = formatUnit(army_export, unit);
        }
    });

    army_export += '\n';
    army_export += 'Units\n';
    army_export += '----------\n';
    // Format the battleline in battalions
    army_list.units.battalions.forEach(batt => {
        batt.batt_units.forEach(batt_unit => {
            if (batt_unit.unit_role == "Other") {
                army_export = formatUnit(army_export, batt_unit);
            }
        });
    });
    // And now the ones not in battalions
    army_list.units.none.forEach(unit => {
        if (unit.unit_role == "Other") {
            army_export = formatUnit(army_export, unit);
        }
    });

    army_export += '\n';
    army_export += 'Artillery\n';
    army_export += '----------\n';
    // Format the artillery in battalions
    army_list.units.battalions.forEach(batt => {
        batt.batt_units.forEach(batt_unit => {
            if (batt_unit.unit_role == "Artillery") {
                army_export = formatUnit(army_export, batt_unit);
            }
        });
    });
    // And now the ones not in battalions
    army_list.units.none.forEach(unit => {
        if (unit.unit_role == "Artillery") {
            army_export = formatUnit(army_export, unit);
        }
    });

    army_export += '\n';
    army_export += 'Behemoth\n';
    army_export += '----------\n';
    // Format the artillery in battalions
    army_list.units.battalions.forEach(batt => {
        batt.batt_units.forEach(batt_unit => {
            if (batt_unit.unit_role == "Behemoth") {
                army_export = formatUnit(army_export, batt_unit);
            }
        });
    });
    // And now the ones not in battalions
    army_list.units.none.forEach(unit => {
        if (unit.unit_role == "Behemoth") {
            army_export = formatUnit(army_export, unit);
        }
    });

    army_export += '\n';
    army_export += 'Endless Spells & Invocations\n';
    army_export += '----------\n';
    army_list.endless_spells.forEach(spell => {
        army_export += spell.endless_name + ' ('+spell.endless_points+')\n';
    })

    // Now name the core battalions and label which number of * they are
    army_export += '\n';
    army_export += 'Core Battalions\n';
    army_export += '----------\n';
    army_list.units.battalions.forEach(batt => {
        // If they don't put anything in a battalion there won't be a symbol
        if (batt.batt_units.length != 0) {
            army_export += batt.batt_name + batt.batt_units[0].unit_batt_symbol+'\n';
        }
        else {
            army_export += batt.batt_name +'\n';
        }
        if ('batt_bonus' in batt) {
            army_export += '- Bonus Enhancement: '+batt.batt_bonus+'\n';
        }
    });

    army_export += '\n';
    army_export += 'Total Points: '+army_list.total_points+'\n';
    army_export += 'Made with AoS App List Cleaner - https://femiaf13.github.io/list-cleaner/ ';
    return army_export;
}

new ClipboardJS('.btn');