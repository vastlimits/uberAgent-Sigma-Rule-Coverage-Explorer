let AppModel = {}

function createSelectFilter(classNameColumn, filterTitle, filterOptions, id, skipAny) {

    const filterItem = document.createElement('div');
    filterItem.classList = classNameColumn;

    const wrap = document.createElement('div');
    wrap.classList.add('row-wrap');

    const filterItemLabel = document.createElement('div');
    filterItemLabel.classList = "filter-item-label";
    filterItemLabel.innerText = filterTitle;

    const select = document.createElement('select');
    select.id = id;
    if (!skipAny)
        select.innerHTML = `<option value="">Any ${filterTitle}</option>`;

    filterOptions.forEach(option => {
        select.innerHTML += `<option value="${option}">${option}</option>`;
    });

    select.addEventListener('change', updateResults);
    select.addEventListener('change', updateErrorResults);

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
    filterRow.appendChild(createSelectFilter('grid-col-2', 'Status', [...statusSet], 'statusFilter'));
    filterRow.appendChild(createSelectFilter('grid-col-2', 'Level', [...levelSet], 'levelFilter'));
    filterRow.appendChild(createSelectFilter('grid-col-2', 'Category', [...categorySet], 'categoryFilter'));
    filterRow.appendChild(createSelectFilter('grid-col-2', 'Product', [...productSet], 'productFilter'));

    const errorFilterRow = document.getElementById('errorFilterRow');
    errorFilterRow.appendChild(createSelectFilter('grid-col-1', 'Backend', Object.keys(AppModel.status), 'backendFilter', true));
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

function createRow(textTitle, textContent) {

    const title = document.createElement('h3');
    title.classList.add('row-title');
    title.textContent = textTitle;

    const content = document.createElement('p');
    content.classList.add('row-description');
    content.textContent = textContent;

    return { title, content  };
}

function createRowWithProgressBar(backendName, coverageCount, totalRules) {
    const coveragePercent = (coverageCount / totalRules) * 100;

    const wrap = document.createElement('div');
    wrap.classList.add('row-wrap');

    const { title, content } = createRow(backendName, `${coverageCount} of ${totalRules}`);

    const progressBarContainer = document.createElement('div');
    progressBarContainer.classList.add('progress');

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar', 'progress-bar-primary');
    progressBar.style.width = `${coveragePercent.toFixed(2)}%`;
    if (coverageCount > 0) {
        progressBar.textContent = `${coveragePercent.toFixed(2)}%`;
    }

    progressBarContainer.appendChild(progressBar);
    wrap.appendChild(title);
    wrap.appendChild(content);
    wrap.appendChild(progressBarContainer);

    return wrap;
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
        const coverageCount = countCoverage(backendIds, filteredRules);
        if (filteredRules.length === 0) {
            const wrap = document.createElement('div');
            wrap.classList.add('row-wrap');
            const emptyRow = createRow(backendName, 'No results available.');
            wrap.appendChild(emptyRow.title);
            wrap.appendChild(emptyRow.content);
            backendResults.appendChild(wrap);
            return;
        }

        const rowWithProgressBar = createRowWithProgressBar(backendName, coverageCount, filteredRules.length);
        backendResults.appendChild(rowWithProgressBar);
    });
}


function updateErrorResults() {

    const errors = AppModel.errors;
    const backendErrorResults = document.getElementById('backendErrorResults');
    const conversionErrorNumber = document.getElementById('conversionErrorNumber');

    backendErrorResults.innerHTML = '';
    conversionErrorNumber.innerText = '';

    const backendFilterValue = document.getElementById('backendFilter').value;

    if (!(backendFilterValue in errors))
        return;

    const backendErrors = errors[backendFilterValue];

    // Right now 'missing_field' error is the only error we care about as displaying
    // not yet supported log sources makes no sense here.

    if (!('missing_field' in backendErrors))
        return;

    const backendMissingFields = backendErrors['missing_field'];
    let count = 0;
    Object.entries(backendMissingFields).forEach(([field, value]) => {

        count++;

        const wrap = document.createElement('div');
        wrap.classList.add('row-wrap');

        const itemField = createRow('Missing Field', field);
        const itemCategories = createRow('Categories', value['logsource.categories'].join(', '));
        const itemProducts = createRow('Products', value['logsource.products'].join(', '));
        const itemRules = createRow('Rules', value.refs.length);

        itemField.content.classList.add('row-description-primary');
        itemCategories.content.classList.add('row-description-primary');
        itemProducts.content.classList.add('row-description-primary');
        itemRules.content.classList.add('row-description-primary');

        wrap.appendChild(itemField.title);
        wrap.appendChild(itemField.content);
        wrap.appendChild(itemCategories.title);
        wrap.appendChild(itemCategories.content);
        wrap.appendChild(itemProducts.title);
        wrap.appendChild(itemProducts.content);
        wrap.appendChild(itemRules.title);
        wrap.appendChild(itemRules.content);

        for (var i = 0; i < value.refs.length; ++i) {
            const rule = AppModel.rules.find((rule) => { return rule.id == value.refs[i]; });
            const ruleLine = document.createElement('a');
            ruleLine.href = rule.file.replace('../sigma', 'https://github.com/SigmaHQ/sigma/tree/master');
            ruleLine.target = "_blank";
            ruleLine.textContent = rule.title;

            const ruleWrap = document.createElement('p');
            ruleWrap.classList.add('row-description');
            ruleWrap.appendChild(ruleLine);

            wrap.appendChild(ruleWrap);
        }
        backendErrorResults.appendChild(wrap);
    });

    conversionErrorNumber.innerText = count;
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
            updateErrorResults();
        })
        .catch(_ => { });
}