
document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('svg-container');
    const systemInput = document.getElementById('typeahead'); // Updated to match your input ID
    const cmdrInput = document.getElementById('search-box'); // Added to reference the commander input

    // Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cmdrParam = urlParams.get('cmdr');
    const systemParam = urlParams.get('System');

    // Set the input values if parameters are present
    if (cmdrParam) {
        cmdrInput.value = cmdrParam;
    }
    if (systemParam) {
        systemInput.value = systemParam;
    }

    const cmdr_system = systemParam ? systemParam.trim() : ''; // Get the input value

    // First, fetch coordinates if cmdr_system is provided
    if (cmdr_system) {
        console.log("Fetching coordinates for " + cmdr_system);

        // Fetch coordinates asynchronously
        fetchCoordinates(cmdr_system)
            .then(coordinates => {
                console.log("Coordinates: ", coordinates);

                // Now that coordinates are fetched, load the SVG map
                fetch('RegionMap.svg')
                    .then(response => response.text())
                    .then(svgText => {
                        // Insert the SVG into the container
                        svgContainer.innerHTML = svgText;
                        fetchCoordinatesAndAddCircles(svgContainer, coordinates); // Use the coordinates
                    })
                    .catch(error => console.error('Error fetching the SVG:', error));
            })
            .catch(error => {
                console.error('Error fetching coordinates:', error);
                // Handle error, perhaps by loading the SVG anyway or showing an error message
                fetch('RegionMap.svg')
                    .then(response => response.text())
                    .then(svgText => {
                        svgContainer.innerHTML = svgText;
                        fetchCoordinatesAndAddCircles(svgContainer, null); // Pass null if coordinates aren't fetched
                    })
                    .catch(error => console.error('Error fetching the SVG:', error));
            });
    } else {
        // If no cmdr_system provided, just load the SVG
        fetch('RegionMap.svg')
            .then(response => response.text())
            .then(svgText => {
                svgContainer.innerHTML = svgText;
                fetchCoordinatesAndAddCircles(svgContainer, null); // Pass null if no system
            })
            .catch(error => console.error('Error fetching the SVG:', error));
    }
});


function getCoordinatesSync(cmdr_system) {
    let result = null;

    // Create a wrapper to wait for the async function
    (async () => {
        result = await fetchCoordinates(cmdr_system);
        console.log(result)
    })();

    return result;
}

async function fetchCoordinates(cmdr_system) {
    try {
        // Make a request to the API
        const response = await fetch(`https://us-central1-canonn-api-236217.cloudfunctions.net/query/typeahead?q=${cmdr_system}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response as JSON
        const data = await response.json();

        console.log(data)
        // Find the entry with the matching name in the min_max array
        const entry = data.min_max.find(item => item.name === cmdr_system);
        console.log(entry)
        // If entry is found, return the coordinates as an array
        if (entry) {
            return [entry.x, entry.y, entry.z];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}



async function fetchCoordinatesAndAddCircles(svgContainer, coordinates) {

    url = new URL(window.location.href);
    // Extract the query parameters
    params = new URLSearchParams(url.search);
    // Get the value of the 'cmdr' parameter
    const cmdr = params.get('cmdr');

    if (!cmdr) {
        console.error('No cmdr parameter found in the URL');
        return;
    }

    const apiUrl = `https://us-central1-canonn-api-236217.cloudfunctions.net/query/missing/codex?cmdr=${cmdr}`;

    try {
        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
            throw new Error(`API request failed with status ${apiResponse.status}`);
        }
        const data = await apiResponse.json();

        console.log(data)

        // we could filter some but no need
        const filteredItems = Object.values(data)

        // Process each item asynchronously
        for (const codexentry of filteredItems) {
            fetchAndRenderItem(svgContainer, codexentry, coordinates);
        }

    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
}

async function fetchAndRenderItem(svgContainer, codexentry, coordinates) {
    const { entryid, hud_category } = codexentry;
    const coordinatesUrl = `https://storage.googleapis.com/canonn-downloads/dumpr/${hud_category}/${entryid}.csv`;

    try {
        const response = await fetch(coordinatesUrl);
        if (!response.ok) {
            throw new Error(`CSV request failed with status ${response.status}`);
        }
        const csvText = await response.text();


        let filteredCsvText = csvText;

        console.log("coordinates " + coordinates);

        if (coordinates) {
            // Parse the CSV into rows
            const rows = csvText.trim().split("\n");

            const parsedData = rows.map(row => {
                const [dummy, x, y, z, ...rest] = row.split(",").map(Number);
                const distance = Math.sqrt(
                    Math.pow(x - coordinates[0], 2) +
                    Math.pow(y - coordinates[1], 2) +
                    Math.pow(z - coordinates[2], 2)
                );
                return { distance, row }; // Include the original row data
            });

            // Sort by distance and take the 20 closest points
            const closestPoints = parsedData
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 20);

            // Reconstruct the CSV
            filteredCsvText = closestPoints.map(point => point.row).join("\n");
        }

        await renderData(svgContainer, codexentry, filteredCsvText, coordinates);
    } catch (error) {
        console.error(`Error fetching CSV for entryid ${entryid} and hud_category ${hud_category}:`, error);
    }
}


async function renderData(svgContainer, item, csvText) {
    const svgElement = svgContainer.querySelector('svg');

    if (!svgElement) return;

    const { entryid, hud_category, english_name } = item;

    // Split CSV text into lines
    const lines = csvText.trim().split('\n');
    const circleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    circleGroup.setAttribute('id', 'circleGroup');
    svgElement.append(circleGroup); // Add the group as the first child of the SVG

    // Process each line (assuming no header and x, y are in fields 1 and 3)
    let index = 0;
    const batchSize = 1000; // Number of circles to add in each batch
    const intervalId = setInterval(() => {
        for (let i = 0; i < batchSize && index < lines.length; i++) {
            const line = lines[index];
            const fields = line.split(',');
            if (fields.length >= 3) {
                const x = parseFloat(fields[1]);
                const z = parseFloat(fields[3]);
                const title = fields[0] + '<br>' + english_name;
                const cRegion = fields[6];
                const bRegion = fields[7];

                var regionElement = svgElement.getElementById("Region_" + cRegion.padStart(2, '0'));
                // Check if the element exists
                if (regionElement) {
                    // Set the fill-opacity to 50%
                    regionElement.style.fillOpacity = "0.5";
                }

                if (!isNaN(x) && !isNaN(z)) {
                    const tx = ((x + 49985) * 83 / 4096);
                    const tz = ((z + 24105) * 83 / 4096);

                    addCircleToSVG(svgElement, circleGroup, tx, 2048 - tz, title, fields[0], entryid, hud_category);
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
    newCircle.setAttribute('r', '7'); // Adjust radius as needed
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
                //now bring the element to the front 
                svgElement.appendChild(circle);
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
