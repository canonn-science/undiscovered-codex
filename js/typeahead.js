document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("typeahead");
    const tooltip = document.getElementById("results-container");
    let selected = null; // Local selected variable
    let minMaxArray = [];

    // Global variable to store the selected data
    window.selectedSystem = null;

    input.addEventListener("input", function () {
        const query = input.value;

        if (query.length >= 3) { // Only query if 3 or more characters are typed
            fetch(`https://us-central1-canonn-api-236217.cloudfunctions.net/query/typeahead?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    minMaxArray = data.min_max.slice(0, 10); // Limit to the first 10 suggestions
                    tooltip.innerHTML = '';

                    if (minMaxArray.length > 0) {
                        tooltip.style.display = 'block';
                        minMaxArray.forEach((item, index) => {
                            const div = document.createElement('div');
                            div.textContent = item.name;
                            div.dataset.index = index;
                            tooltip.appendChild(div);
                        });

                        // Position the tooltip below the input
                        const rect = input.getBoundingClientRect();
                        tooltip.style.top = rect.bottom + window.scrollY + 'px';
                        tooltip.style.left = rect.left + window.scrollX + 'px';
                        tooltip.style.width = rect.width + 'px';
                    } else {
                        tooltip.style.display = 'none';
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            tooltip.style.display = 'none';
        }
    });

    tooltip.addEventListener("click", function (event) {
        if (event.target.tagName === 'DIV') {
            const index = event.target.dataset.index;
            const selectedItem = minMaxArray[index];
            input.value = selectedItem.name;
            selected = selectedItem;

            // Store the selected item in the global variable
            window.selectedSystem = selectedItem;

            tooltip.style.display = 'none';

            // Dispatch custom "SystemSelected" event
            const systemSelectedEvent = new CustomEvent("SystemSelected", {
                detail: selectedItem
            });
            document.dispatchEvent(systemSelectedEvent);
        }
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest('.container')) {
            tooltip.style.display = 'none';
        }
    });

    // Listen for the "SystemSelected" event
    document.addEventListener("SystemSelected", function (event) {
        console.log("System selected:", event.detail);

        const x = parseFloat(event.detail.x);
        const y = parseFloat(event.detail.z);

        if (!isNaN(x) && !isNaN(y)) {
            // Calculating tx and ty for positioning
            const tx = ((x + 49985) * 83 / 4096);
            const ty = ((y + 24105) * 83 / 4096);

            console.log(`Calculated coordinates: tx = ${tx}, ty = ${ty}`);

            // Handle the SVG circle creation or movement
            const svgContainer = document.getElementById('svg-container');
            const svgElement = svgContainer.querySelector('svg');
            if (svgElement) {
                // Find the circleGroup inside the SVG
                const circleGroup = svgElement.querySelector('circleGroup');
                if (svgElement) {
                    let currentLocationCircle = svgElement.querySelector('#CurrentLocation');
                    if (!currentLocationCircle) {
                        console.log('Creating new circle element.');

                        // Create a new circle element
                        const svgns = 'http://www.w3.org/2000/svg';
                        currentLocationCircle = document.createElementNS(svgns, 'circle');
                        currentLocationCircle.setAttribute('id', 'CurrentLocation');
                        currentLocationCircle.setAttribute('cx', tx);
                        currentLocationCircle.setAttribute('cy', 2048 - ty);
                        currentLocationCircle.setAttribute('r', '22.2'); // Adjust radius as needed
                        currentLocationCircle.setAttribute('fill', 'green'); // Circle color
                        currentLocationCircle.setAttribute('fill-opacity', '0.5'); // 50% transparency
                        svgElement.appendChild(currentLocationCircle);

                        console.log('Circle created successfully.');
                    } else {
                        // Move the existing circle to the new coordinates
                        console.log('Moving existing circle to new coordinates.');
                        currentLocationCircle.setAttribute('cx', tx);
                        currentLocationCircle.setAttribute('cy', 2048 - ty);
                    }
                } else {
                    console.error('Group with id "circleGroup" not found inside the SVG.');
                }
            } else {
                console.error('SVG container with id "svg-container" not found.');
            }
        } else {
            console.error('Invalid coordinates:', { x, y });
        }
    });
});
