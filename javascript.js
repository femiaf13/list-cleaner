var outputElement = document.getElementById('output-list')

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
    "Linebreaker"
]

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
    units: {
        battalions:[],
        none: []
    },
    total_points: ""

};

/**
 * 
 * @param {object} army_list 
 */
function refreshArmyListObject(army_list) {
    army_list = {
        army_name: "",
        army_alleigance: "",
        army_type: "",
        army_subfaction: "",
        grand_strategy: "",
        triumphs: "",
        units: {
            battalions:[],
            none: []
        },
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
    refreshArmyListObject(army_list)
    var arr = list.split(/\r?\n/);
    let parsing_units = false;
    let parsing_battalions = false;
    let num_batts = 0;

    for (var i = 0; i < arr.length; i++){

        let line = arr[i];
        // console.log(JSON.stringify(line))
        parseArmyWide(line);
        
        if (line.includes("Total Points") || line.includes("Endless Spells")) {
            parsing_units = false;
            parsing_battalions = false;
        }
        else if (line.includes("Core Battalions")) {
            parsing_units = false;
            parsing_battalions = true;
            // Skip to the name of the first battalion
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

        // Some flags to control flow through this
        if (!parsing_units && line.includes("Units")) {
            parsing_units = true;
            parsing_battalions = false
        }
        

    }

    // Change the output text box
    // outputElement.innerText = output;
    outputElement.innerText = JSON.stringify(army_list);

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
    // else if (line.includes("Battle Regiment")) {
    //     // army_list.triumphs = line.split(":")[1].trim();
    //     in_battalion = true;
    //     army_list.battalions.battle_regiment.one = {};
    // }
    // || line.includes("Warlord") || line.includes("Hunters of the Heartlands")

    // console.log(JSON.stringify(army_list))
}

/**
 * Parse all the lines of a unit
 * @param {number} start_index index for first line of unit(unit name)
 * @param {number} end_index index of last line of unit(point cost)
 * @param {string} list raw string from input box
 * @param {number} num_asterisk symbol to give all the units in this battalion
 */
function parseUnit(start_index, end_index, list, num_asterisk=0) {
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
        unit_batt_symbol: "*".repeat(num_asterisk)
    };
    unit.unit_name = list[start_index].trim();
    for (let i = start_index; i<=end_index; i++) {
        const line = list[i];

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
 * Parse all the lines of a battalion
 * @param {number} start_index index for first line of unit(unit name)
 * @param {number} end_index index of last line of unit(point cost)
 * @param {string} list raw string from input 
 * @param {number} num_asterisk symbol to give all the units in this battalion
 */
function parseBattalion(start_index, end_index, list, num_asterisk) {
    let battalion = {
        batt_name: "",
        // batt_symbol: "*".repeat(num_asterisk),
        batt_units: [],
        // batt_bonus: "",
    };
    battalion.batt_name = list[start_index].trim();
    for (let i = start_index+1; i<=end_index; i++) {
        const line = list[i];

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

            let unit_stats = parseUnit(start_unit_index, final_unit_index, list, num_asterisk)
            battalion.batt_units.push(unit_stats);
            // No need to iterate over again, skip ahead to the nex one
            i = final_unit_index;
        }        
    }
    return battalion;
}

new ClipboardJS('.btn');