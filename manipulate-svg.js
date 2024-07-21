document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('svg-container');

    // Load the SVG file
    fetch('RegionMap.svg')
        .then(response => response.text())
        .then(svgText => {
            // Insert the SVG into the container
            svgContainer.innerHTML = svgText;

            // After loading SVG, fetch coordinates and add circles
            fetchCoordinatesAndAddCircles(svgContainer); // Pass svgContainer as an argument
        })
        .catch(error => console.error('Error fetching the SVG:', error));
});

async function fetchCoordinatesAndAddCircles(svgContainer) {
    url = new URL(window.location.href);
    // Extract the query parameters
    params = new URLSearchParams(url.search);
    // Get the value of the 'cmdr' parameter
    const cmdr = params.get('cmdr');

    if (!cmdr) {
        console.error('No cmdr parameter found in the URL');
        return;
    }

    // Fetch the list of entryid and hud_category from the API
    const apiUrl = `https://us-central1-canonn-api-236217.cloudfunctions.net/query/missing/codex?cmdr=${cmdr}`;

    try {
        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
            throw new Error(`API request failed with status ${apiResponse.status}`);
        }
        const data = await apiResponse.json();

        if (!Array.isArray(data)) {
            throw new Error('API response is not an array');
        }

        for (const item of data) {
            const { entryid, hud_category, english_name } = item;

            if (!entryid || !hud_category || !english_name) {
                console.warn('Invalid item in API response', item);
                continue;
            }

            const coordinatesUrl = `https://storage.googleapis.com/canonn-downloads/dumpr/${hud_category}/${entryid}.csv`;

            try {
                const response = await fetch(coordinatesUrl);
                if (!response.ok) {
                    throw new Error(`CSV request failed with status ${response.status}`);
                }
                const csvText = await response.text();
                const svgElement = svgContainer.querySelector('svg');

                if (svgElement) {
                    // Split CSV text into lines
                    const lines = csvText.trim().split('\n');
                    const circleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    svgElement.append(circleGroup); // Add the group as the first child of the SVG

                    // Process each line (assuming no header and x, y are in fields 2 and 3)
                    let index = 0;
                    const batchSize = 1000; // Number of circles to add in each batch
                    const intervalId = setInterval(() => {
                        for (let i = 0; i < batchSize && index < lines.length; i++) {
                            const line = lines[index];
                            const fields = line.split(',');
                            if (fields.length >= 3) {
                                const x = parseFloat(fields[1]);
                                const y = parseFloat(fields[3]);
                                const title = fields[0] + '<br>' + english_name
                                const cRegion = fields[6]
                                const bRegion = fields[7]

                                var regionElement = svgElement.getElementById("Region_" + cRegion.padStart(2, '0'));
                                // Check if the element exists
                                if (regionElement) {
                                    // Set the fill-opacity to 50%
                                    regionElement.style.fillOpacity = "0.5";
                                }

                                if (!isNaN(x) && !isNaN(y)) {
                                    tx = ((x + 49985) * 83 / 4096)
                                    ty = ((y + 24105) * 83 / 4096)

                                    addCircleToSVG(svgElement, circleGroup, tx, 2048 - ty, title, fields[0], entryid, hud_category);
                                }
                            }
                            index++;
                        }
                        if (index >= lines.length) {
                            clearInterval(intervalId); // Stop interval when all circles are added
                        }
                    }, 0); // Interval of 0ms (no delay)

                    var paths = svgElement.querySelectorAll('.borderlines');
                    paths.forEach(function (path) {
                        svgElement.appendChild(path); // Move each text element to the end of the SVG
                        path.style.pointerEvents = "none";
                    });

                    var texts = svgElement.querySelectorAll('text');
                    texts.forEach(function (text) {
                        svgElement.appendChild(text); // Move each text element to the end of the SVG
                        text.style.pointerEvents = "none";
                    });
                }
            } catch (error) {
                console.error(`Error fetching CSV for entryid ${entryid} and hud_category ${hud_category}:`, error);
            }
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
}


function showTooltip(evt, text) {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
}

function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
}


function addCircleToSVG(parent, svgElement, x, y, hoverText, systemName, entryid, hud_category) {
    const svgns = 'http://www.w3.org/2000/svg';


    // Create circle element
    const newCircle = document.createElementNS(svgns, 'circle');
    newCircle.setAttribute('cx', x);
    newCircle.setAttribute('cy', y);
    newCircle.setAttribute('r', '8'); // Adjust radius as needed
    newCircle.setAttribute('fill', 'red');
    newCircle.setAttribute('fill-opacity', '0.5'); // 50% transparency
    newCircle.setAttribute('class', `entry_${entryid}`); // Set the class to the entryid

    // Add click event listener to copy the title to the clipboard
    newCircle.addEventListener('click', () => {
        navigator.clipboard.writeText(systemName).then(() => {
            console.log(`Copied to clipboard: ${systemName}`);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    newCircle.addEventListener('contextmenu', (event) => {
        // Prevent the default context menu from appearing
        event.preventDefault();

        // Handle the right-click event
        window.open(`https://canonn-science.github.io/Codex-Regions/?entryid=${entryid}&hud_category=${hud_category}`, '_blank');

        // You can perform other actions here, like showing a custom context menu
    });

    // Append circle element to SVG
    svgElement.appendChild(newCircle);

    // Event listener on SVG element to handle mouseover and mouseout events
    parent.addEventListener('mouseover', function (event) {
        if (event.target === newCircle) {
            const circles = document.querySelectorAll(`.entry_${entryid}`);
            circles.forEach(circle => {
                circle.setAttribute('fill', 'yellow');
            });
            showTooltip(event, hoverText);
        }
    });

    parent.addEventListener('mouseout', function (event) {
        if (event.target === newCircle) {
            const circles = document.querySelectorAll(`.entry_${entryid}`);
            circles.forEach(circle => {
                circle.setAttribute('fill', 'red');
            });
            hideTooltip();
        }
    });



    //console.log(`Added circle at (${x}, ${y}) with hover text "${hoverText}"`);
}
