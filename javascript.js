var outputElement = document.getElementById('output-list')

const splitLines = str => str.split(/\r?\n/);

function updateList(val) {
  var lines = splitLines(val).reduce((accum, line) => {
    if (!line.match(/^ *(Battlefield Role|Battalion Slot Filled).*$/)) accum.push(line)
    return accum
  }, []);
  var output = lines.join('\n')
  outputElement.innerText = output;
}

new ClipboardJS('.btn');