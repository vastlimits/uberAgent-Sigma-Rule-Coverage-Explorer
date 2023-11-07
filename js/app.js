let AppModel = {}

function createSelectFilter(filterTitle, filterOptions, id) {

    const filterItem = document.createElement('div');
    filterItem.classList = "grid-col-2";

    const wrap = document.createElement('div');
    wrap.classList.add('row-wrap');

    const filterItemLabel = document.createElement('div');
    filterItemLabel.classList = "filter-item-label";
    filterItemLabel.innerText = filterTitle;

    const select = document.createElement('select');
    select.id = id;
    select.innerHTML = `<option value="">Any ${filterTitle}</option>`;

    filterOptions.forEach(option => {
        select.innerHTML += `<option value="${option}">${option}</option>`;
    });

    select.addEventListener('change', updateResults);

    wrap.appendChild(filterItemLabel);
    wrap.appendChild(select);
    filterItem.appendChild(wrap);

    return filterItem;
}

function initializeFilters() {
    const statusSet = new Set();
    const levelSet = new Set();
    const categorySet = new Set();
    const productSet = new Set();

    AppModel.rules.forEach(rule => {
        statusSet.add(rule.status);
        levelSet.add(rule.level);
        categorySet.add(rule['logsource.category']);
        productSet.add(rule['logsource.product']);
    });

    const filterRow = document.getElementById('filterRow');
    filterRow.appendChild(createSelectFilter('Status', [...statusSet], 'statusFilter'));
    filterRow.appendChild(createSelectFilter('Level', [...levelSet], 'levelFilter'));
    filterRow.appendChild(createSelectFilter('Category', [...categorySet], 'categoryFilter'));
    filterRow.appendChild(createSelectFilter('Product', [...productSet], 'productFilter'));
}

function countCoverage(backendIds, rules) {
    let count = 0;
    rules.forEach(rule => {
        if (backendIds.includes(rule.id)) {
            count++;
        }
    });
    return count;
}

function updateResults() {
    const backends = AppModel.status;
    const backendResults = document.getElementById('backendResults');
    backendResults.innerHTML = '';

    const statusFilterValue = document.getElementById('statusFilter').value;
    const levelFilterValue = document.getElementById('levelFilter').value;
    const categoryFilterValue = document.getElementById('categoryFilter').value;
    const productFilterValue = document.getElementById('productFilter').value;

    const filteredRules = AppModel.rules.filter(rule => {
        const statusMatch = statusFilterValue ? rule.status === statusFilterValue : true;
        const levelMatch = levelFilterValue ? rule.level === levelFilterValue : true;
        const categoryMatch = categoryFilterValue ? rule['logsource.category'] === categoryFilterValue : true;
        const productMatch = productFilterValue ? rule['logsource.product'] === productFilterValue : true;
        return statusMatch && levelMatch && categoryMatch && productMatch;
    });

    Object.entries(backends).forEach(([backendName, backendIds]) => {
        if (filteredRules.length === 0) {
            wrap.classList.add('row-wrap');
            return;
        }

        const coverageCount = countCoverage(backendIds, filteredRules);
        const coveragePercent = (coverageCount / filteredRules.length) * 100;

        const wrap = document.createElement('div');
        wrap.classList.add('row-wrap');

        const row = document.createElement('div');
        row.classList.add('product-label');
        row.textContent = backendName;

        const rowLine = document.createElement('div');
        rowLine.classList.add('product-description');
        rowLine.textContent = `${coverageCount} of ${filteredRules.length}`;

        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress');

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar', 'progress-bar-primary');
        progressBar.style.width = `${coveragePercent.toFixed(2)}%`;
        if (coverageCount > 0)
            progressBar.textContent = `${coveragePercent.toFixed(2)}%`;

        progressBarContainer.appendChild(progressBar);

        wrap.appendChild(row);
        wrap.appendChild(rowLine);
        wrap.appendChild(progressBarContainer);

        backendResults.appendChild(wrap);
    });
}

window.onload = function () {
    fetch('/data/model.json')
        .then(response => {
            if (!response.ok) {
                alert('Could not load model.json!');
            }
            return response.json();
        })
        .then(data => {
            AppModel = data;
            initializeFilters();
            updateResults();
        })
        .catch(_ => { });
}