document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("typeahead");
    const tooltip = document.getElementById("results-container");
    let selected = null;
    let minMaxArray = [];

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
            tooltip.style.display = 'none';
        }
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest('.container')) {
            tooltip.style.display = 'none';
        }
    });
});
