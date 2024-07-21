
let MatsToggle = "hidden"

function toggleMaterials() {
    const matBtn = document.querySelector('#materialsButton');
    const columns = document.querySelectorAll('.materials');
    columns.forEach(column => {
        if (column.classList.contains('hidden')) {
            MatsToggle = "visible"
            column.classList.remove('hidden');
        } else {
            MatsToggle = "hidden"
            column.classList.add('hidden');
        }
    });
}


document.addEventListener('recordSelected', function (event) {
    console.log('Event Received: Selected Record:', selectedRecord);
    const apiUrl = 'https://us-central1-canonn-api-236217.cloudfunctions.net/query/codex/bodies'; // API endpoint
    let currentPage = 1;
    const rowsPerPage = 10;
    let lastPage = false;

    function fetchData(page) {
        const offset = (page - 1) * rowsPerPage;
        fetch(`${apiUrl}?english_name=${selectedRecord.english_name}&limit=${rowsPerPage}&offset=${offset}`)
            .then(response => response.json())
            .then(data => {
                const dataLength = Object.keys(data).length;
                if (dataLength < rowsPerPage) {
                    lastPage = true; // If fewer items are returned, this is the last page
                } else {
                    lastPage = false; // Otherwise, we assume there are more pages
                }
                populateTable(data);
                setupPagination(page);
            })
            .catch(error => console.error('Error fetching data:', error));
    }


    function populateTable(data) {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear existing data

        data.forEach((system, index) => {


            const row = document.createElement('tr');

            checkmark = '<span class="red-cross">&#10006;</span>'
            if (system.complete == 'Y') {
                checkmark = '<span class="green-tick">&#10004;</span>'
            }


            if (system.codex_star_match == 1) {
                starmatch = '<span class="green-tick">&#10004;</span>'
            } else if (system.codex_star_match == 0) {
                starmatch = '<span class="red-cross">&#10006;</span>'
            } else {
                starmatch = '-'
            }

            //if (system.atmosphereComposition == null) {
            //    system.atmosphereComposition = {}
            //}

            //if (system.materials == null) {
            //    system.materials = {}
            //}
            //const antimonyMaterial = system.materials.find(material => material.key === 'Antimony');
            const AntimonyMaterial = system.materials?.["Antimony"] ?? 0;
            const ArsenicMaterial = system.materials?.["Arsenic"] ?? 0;
            const CadmiunMaterial = system.materials?.["Cadmiun"] ?? 0;
            const CarbonMaterial = system.materials?.["Carbon"] ?? 0;
            const ChromiumMaterial = system.materials?.["Chromium"] ?? 0;
            const GermaniumMaterial = system.materials?.["Germanium"] ?? 0;
            const IronMaterial = system.materials?.["Iron"] ?? 0;
            const ManganeseMaterial = system.materials?.["Manganese"] ?? 0;
            const MercuryMaterial = system.materials?.["Mercury"] ?? 0;
            const MolybdenumMaterial = system.materials?.["Molybdenum"] ?? 0;
            const NickelMaterial = system.materials?.["Nickel"] ?? 0;
            const NiobiumMaterial = system.materials?.["Niobium"] ?? 0;
            const PhospherousMaterial = system.materials?.["Phospherous"] ?? 0;
            const PoloniumMaterial = system.materials?.["Polonium"] ?? 0;
            const RutheniumMaterial = system.materials?.["Ruthenium"] ?? 0;
            const SeleniumMaterial = system.materials?.["Selenium"] ?? 0;
            const SulpherMaterial = system.materials?.["Sulpher"] ?? 0;
            const TechnetiumMaterial = system.materials?.["Technetium"] ?? 0;
            const TelluriumMaterial = system.materials?.["Tellurium"] ?? 0;
            const TinMaterial = system.materials?.["Tin"] ?? 0;
            const TungstenMaterial = system.materials?.["Tungsten"] ?? 0;
            const VanadiumMaterial = system.materials?.["Vanadium"] ?? 0;
            const ZincMaterial = system.materials?.["Zinc"] ?? 0;
            const ZirconiumMaterial = system.materials?.["Zirconium"] ?? 0;



            row.innerHTML = `
                <!--td>${(currentPage - 1) * rowsPerPage + index + 1}</td-->
                <td><a class="no-underline" title="click here to report an issue" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSfO5hZAOp2gUJGRF84YQmwHBbd_OKN5o_pnsD6vB5JfLpgKow/viewform?usp=pp_url&entry.1105671098=${system.english_name}&entry.1456144812=${system.entryid}&entry.856887466=${system.system_name}&entry.649737753=${system.system_address}&entry.1480250981=${system.body}&entry.34397199=${system.body_id}">${checkmark}</a></td>   
                <td class="nowrap-cell"><a href="https://signals.canonn.tech?system=${system.system_name}">${system.system_name}</a> ${system.body}</td>
                <td>${system.star_class}</td>
                <td>${system.star_types}</td>
                <td>${system.illuminating_subtype}</td>
                <td>${starmatch}</td>
                <td>${system.body_type}</td>
                <td>${system.atmosphereType}</td>
                <td>${JSON.stringify(system.atmosphereComposition)}</td>
                <td>${system.volcanismType}</td>
                <td>${system.distanceToArrival}</td>

                <td>${system.nearest_nebula}</td>
                <td>${system.nearest_nebula_type}</td>

                <td>${system.orbitalEccentricity}</td>
                <td>${system.temperature}</td>
                <td>${system.gravity}</td>
                
                <td class="materials ${MatsToggle}">${AntimonyMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${PoloniumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${RutheniumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${SeleniumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${TechnetiumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${TelluriumMaterial.toFixed(2)}%</td>


                <td class="materials ${MatsToggle}">${CadmiunMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${MercuryMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${MolybdenumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${NiobiumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${TinMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${VanadiumMaterial.toFixed(2)}%</td>

                <td class="materials ${MatsToggle}">${ArsenicMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${ChromiumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${GermaniumMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${ManganeseMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${PhospherousMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${TungstenMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${ZincMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${ZirconiumMaterial.toFixed(2)}%</td>

                <td class="materials ${MatsToggle}">${CarbonMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${IronMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${NickelMaterial.toFixed(2)}%</td>
                <td class="materials ${MatsToggle}">${SulpherMaterial.toFixed(2)}%</td>
                
                
                
                <td>${system.cmdr}</td>
                <td>${system.reported_at}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function setupPagination(currentPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ''; // Clear existing pagination

        // Previous Button
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        if (currentPage === 1) {
            prevLi.classList.add('disabled');
        }
        prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchData(currentPage);
            }
        });
        pagination.appendChild(prevLi);

        // Next Button
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        if (lastPage) {
            nextLi.classList.add('disabled');
        }
        nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (!lastPage) {
                currentPage++;
                fetchData(currentPage);
            }
        });
        pagination.appendChild(nextLi);
    }

    // Initial data fetch
    fetchData(currentPage);
});
