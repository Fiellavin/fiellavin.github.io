function optimize() {
    const rbinput = document.querySelector('#rbinput').value.replace(/\s/g, '').trim();
    let lines = rbinput.split(';');
    lines = lines.map(line => {
        const match = line.match(/^RemoveBuildingForPlayer\(playerid,([0-9]+),([0-9.-]+),([0-9.-]+),([0-9.-]+),([0-9.-]+)\)$/);
        if (!match || match.length !== 6) {
            return;
        }

        return {
            model: Number(match[1]),
            x: Number(match[2]),
            y: Number(match[3]),
            z: Number(match[4]),
            range: Number(match[5]),
        }
    }).filter(l => l);

    const byModel = {};
    lines.forEach(line => {
        if (byModel[line.model]) {
            byModel[line.model].push(line);
        } else {
            byModel[line.model] = [line];
        }
    });

    const rbs = [];

    Object.keys(byModel).map(Number).forEach(model => {

        let minx = Math.min(...byModel[model].map(l => l.x));
        let maxx = Math.max(...byModel[model].map(l => l.x));
        let miny = Math.min(...byModel[model].map(l => l.y));
        let maxy = Math.max(...byModel[model].map(l => l.y));
        let minz = Math.min(...byModel[model].map(l => l.z));
        let maxz = Math.max(...byModel[model].map(l => l.z));

        const xdiff = maxx - minx;
        const ydiff = maxy - miny;
        const zdiff = maxz - minz;

        const diameter = getDistance(minx, miny, minz, maxx, maxy, maxz) + Math.max(...byModel[model].map(l => l.range * 2));
        const center = {x: minx + (xdiff / 2), y: miny + (ydiff / 2), z: minz + (zdiff / 2)};

        const affected = world.objects.filter(wo => {
            if (wo[0] !== model) {
                return false;
            }
            return getDistance(Number(wo[2]), Number(wo[3]), Number(wo[4]), center.x, center.y, center.z) <= (diameter / 2);
        });

        if (affected.length === byModel[model].length && affected.length > 1) {
            rbs.push({
                model: model,
                x: center.x,
                y: center.y,
                z: center.z,
                range: diameter / 2
            })
        } else {
            rbs.push(...byModel[model]);
        }
    });

    const optimized = document.querySelector('#optimized');

    optimized.textContent = rbs.map(rb => `RemoveBuildingForPlayer(playerid, ${rb.model}, ${rb.x}, ${rb.y}, ${rb.z}, ${rb.range});`).join('\n');
    optimized.style.display = 'block';
    document.querySelector('#report').innerText = `Reduced calls from ${lines.length} to ${rbs.length} (${100 - Math.round((rbs.length / lines.length * 100))}%)!`


}

function getDistance(x1, y1, z1, x2, y2, z2) {
    const a = x1 - x2;
    const b = y1 - y2;
    const c = z1 - z2;
    return Math.sqrt(a * a + b * b + c * c);
}
