let codexData = {};
let codexKeys = []
let selectedRecord = null; // Global variable to store the selected record


async function fetchData() {
    try {
        const response = await fetch('https://us-central1-canonn-api-236217.cloudfunctions.net/query/codex/ref');
        codexData = await response.json();
        console.log('Fetched Data:', codexData); // Debugging: Log fetched data

        checkURLParameters();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function getNextValue() {
    qp = getQueryParams()

    const keys = Object.keys(codexData);
    currentKey = qp.entryid || "2100301";
    console.log(currentKey);
    const currentIndex = keys.indexOf(currentKey);
    if (currentIndex === -1) {
        throw new Error("Invalid key");
    }
    const nextIndex = (currentIndex + 1) % keys.length;
    const nextKey = keys[nextIndex];
    console.log(codexData[nextKey])

    k = codexData[nextKey];

    window.location.href = `?entryid=${k.entryid}&hud_category=${k.hud_category}`;

}

function getPrevValue(y) {
    qp = getQueryParams()

    currentKey = qp.entryid || "2100301";
    const keys = Object.keys(codexData);
    const currentIndex = keys.indexOf(currentKey);
    if (currentIndex === -1) {
        throw new Error("Invalid key");
    }
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
    const prevKey = keys[prevIndex];
    k = codexData[prevKey];

    window.location.href = `?entryid=${k.entryid}&hud_category=${k.hud_category}`;
}

function searchCodex() {
    const query = document.getElementById('search-box').value.toLowerCase().trim(); // Trim whitespace
    console.log('Search Query:', query); // Debugging: Log search query
    if (query === '') {
        clearResults();
        return;
    }
    const results = Object.values(codexData)
        .filter(item => item.english_name.toLowerCase().includes(query))
        .sort((a, b) => a.english_name.localeCompare(b.english_name))
        .slice(0, 10);

    console.log('Search Results:', results); // Debugging: Log search results
    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    results.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('result-item');
        div.textContent = item.english_name;
        div.onclick = () => selectItem(item);
        resultsContainer.appendChild(div);
    });
    resultsContainer.classList.add('active'); // Add 'active' class to display results
    hideSelectedRecord(); // Hide selected record when results are displayed
}

function clearResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('active'); // Remove 'active' class to hide results
    showSelectedRecord(); // Show selected record when results are cleared
}

function selectItem(item) {
    document.getElementById('search-box').value = item.english_name;

    selectedRecord = item; // Store selected item in global variable
    logSelectedRecord(); // Log selected record
    hideResults(); // Hide results after selecting an item
    dispatchSelectedRecordEvent(); // Dispatch custom event
}

function displaySelectedRecord(item) {
    const recordDiv = document.getElementById('selected-record');


    image_panel = `
    <div class="image-panel">
    <img src="${item.image_url}" alt="${item.english_name} by CMDR ${item.image_cmdr}">
    <div class="caption">${item.english_name} by CMDR ${item.image_cmdr}
    &nbsp;<p><centre><button id="downloadButton" onclick="fetchMissing()">Download Missing Images List</button></centre></p>
    </div>
    
    </div>
    `
    if (item.image_url == null) {
        image_panel = `
        <div class="image-panel">
        <img src="images/vistagenomics.png" alt="Send us your samples">
        <div class="caption">Please send your samples to&nbsp;<a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdtS-78k6MDb_L2RodLnVGoB3r2958SA5ARnufAEZxLeoRbhA/viewform?usp=pp_url&entry.1282362439=${item.english_name}&entry.468337930=${item.entryid}">Vista Genomics</a>
        &nbsp;<p><centre><button id="downloadButton" onclick="fetchMissing()">Download Missing Images List</button></centre></p>
        </div>
        
        </div>
        
    `    }

    recordDiv.innerHTML = `
    ${image_panel}
    <h3>${item.english_name}</h3>
    <p><strong>Category:</strong> ${item.category}</p>
    <p><strong>Name:</strong> ${item.name}</p>
    <p><strong>Sub Category:</strong> ${item.sub_category}</p>
    <p><strong>Sub Class:</strong> ${item.sub_class}</p>
    <p><strong>Entry ID:</strong> ${item.entryid}</p>
    <p><strong>HUD Category:</strong> ${item.hud_category}</p>
    <p><strong>Platform:</strong> ${item.platform}</p>
    <p><strong>Reward:</strong> ${item.reward}</p>
    <p><a href="${item.dump}" target="_blank">Download Dump</a></p>
  `;
    recordDiv.style.display = 'block';
}

function hideSelectedRecord() {
    document.getElementById('selected-record').style.display = 'none';
}

function showSelectedRecord() {
    document.getElementById('selected-record').style.display = 'block';
}

function hideResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.classList.remove('active'); // Remove 'active' class to hide results
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        entryid: params.get('entryid'),
        hud_category: params.get('hud_category')
    };
}

function checkURLParameters() {
    const { entryid, hud_category } = getQueryParams();
    if (entryid && hud_category) {
        const selectedItem = Object.values(codexData).find(item => item.entryid == entryid && item.hud_category === hud_category);
        if (selectedItem) {
            displaySelectedRecord(selectedItem);
            selectItem(selectedItem);
            selectedRecord = selectedItem; // Store selected item in global variable
            logSelectedRecord(); // Log selected record 
            dispatchSelectedRecordEvent(); // Dispatch custom event
        }
    }
}

function submitSearch() {
    const searchBox = document.getElementById('search-box');
    const selectedItem = Object.values(codexData).find(item => item.english_name.toLowerCase() === searchBox.value.toLowerCase());
    if (selectedItem) {
        window.location.href = `?entryid=${selectedItem.entryid}&hud_category=${selectedItem.hud_category}`;
    } else {
        alert('Please select a valid item from the list.');
    }
}

// Example function that uses the selectedRecord
function logSelectedRecord() {
    if (selectedRecord) {
        console.log('Selected Record:', selectedRecord);
    } else {
        console.log('No record selected');
    }
}

// Dispatch custom event when selectedRecord is updated
function dispatchSelectedRecordEvent() {
    const event = new CustomEvent('recordSelected', { detail: selectedRecord });
    document.dispatchEvent(event);
}

// Ensure fetchData is called after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchData);



function fetchMissing() {
    const englishNames = [];

    // Populate the array with value.english_name
    for (const key in codexData) {
        if (codexData.hasOwnProperty(key)) {
            if (codexData[key].image_url == null) {
                englishNames.push(codexData[key].english_name);
            }
        }
    }

    // Create the content of the text file
    const content = englishNames.join('\n');

    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });

    // Create an anchor element and trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'missing_images.txt';
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
};