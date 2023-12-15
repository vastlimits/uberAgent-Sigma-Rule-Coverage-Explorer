// for burger menu
let burger = document.querySelector("#burger-menu-button");
let closes = document.querySelectorAll(".close");
let navbar = document.querySelector("#navbar"); 

burger.addEventListener("click", () => {
  navbar.classList.toggle("active");  
}); 

if(closes.length > 0){
closes.forEach(close => {
  close.addEventListener("click", () => {
    navbar.classList.remove("active");   
  });
});
}

window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('#menus a');

 
  sections.forEach(function (section, index) {
    const top = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < bottom) {
      navLinks.forEach(function (link) {
        link.parentElement.classList.remove('active');
      });
      navLinks[index].parentElement.classList.add('active');
    } 
  });
  if (window.scrollY >= 10 && window.scrollY <= 600) { 
    navLinks.forEach(function (link) {
      link.parentElement.classList.remove('active');
    });
  }
});
 

let AppModel = {}

function createSelectFilter(classNameColumn, filterTitle, filterOptions, id, skipAny) {

    const filterItem = document.createElement('div');
    filterItem.classList = classNameColumn;

    const wrap = document.createElement('div');
    wrap.classList.add('space-y-1');

    const filterItemLabel = document.createElement('div');
    filterItemLabel.classList = "block text-base font-bold text-primary-500";
    filterItemLabel.innerText = filterTitle;

  const select = document.createElement('select');
  select.classList = 'w-full appearance-none border border-brand-gray-light bg-brand-gray-light bg-[url(../img/triangle.svg)] bg-[right_12px_center] bg-no-repeat px-6 py-2.5 text-base text-brand-gray transition-[border] duration-100 focus:border-b-2 focus:border-b-tertiary focus:outline-none'
    select.id = id;
    if (!skipAny)
        select.innerHTML = `<option value="">Any ${filterTitle}</option>`;

    filterOptions.forEach(option => {
        select.innerHTML += `<option value="${option}">${option}</option>`;
    });

    select.addEventListener('change', updateResults);
    select.addEventListener('change', updateErrorResults);
    select.addEventListener('change', loadAccordion);

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

    const showProducts = ['Any Product', 'macos', 'windows'];

    AppModel.rules = AppModel.rules.filter(rule => {
      if (rule && rule['logsource.product'] && showProducts.includes(rule['logsource.product'])) {
        statusSet.add(rule.status);
        levelSet.add(rule.level);
        categorySet.add(rule['logsource.category']);
        productSet.add(rule['logsource.product']);

        return true;
      } else {
        return false;
      }
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
    title.classList = "text-center font-proxima_nova text-lg font-bold text-primary-500 lg:text-xl";
    title.textContent = textTitle;

    const content = document.createElement('p');
    content.classList = 'text-center text-base text-primary-500';
    content.textContent = textContent;

    return { title, content  };
}

function createRowWithProgressBar(backendName, coverageCount, totalRules) {
    const coveragePercent = (coverageCount / totalRules) * 100;

    const wrap = document.createElement('div'); 
  wrap.classList = 'transition-all duration-200';
    const { title, content } = createRow(backendName, `${coverageCount} of ${totalRules}`);

    const titleDesContainer = document.createElement('div');
  titleDesContainer.classList = 'border-t border-primary-500 pb-4 pt-4';
  
    const progressOverlay = document.createElement('div');
    progressOverlay.classList = 'absolute bottom-0 left-0 right-0 w-full bg-secondary-500 ';
    progressOverlay.style.height = `${coveragePercent.toFixed(2)}%`;
  

    const Tooltip = document.createElement('div');
    Tooltip.classList = 'absolute bottom-0 left-full  -mb-2 ml-3 w-[110px] font-proxima_nova text-xl font-bold text-secondary-500 lg:text-[28px]';
    if (coverageCount > 0) {
      Tooltip.innerHTML = `${coveragePercent.toFixed(2)}%`
      }
    Tooltip.style.bottom = `${coveragePercent.toFixed(2)}%`;
  
  
    const progressBarContainer = document.createElement('div');
    progressBarContainer.classList = "pb-5 pl-10";

    const progressBar = document.createElement('div');
    progressBar.classList = 'relative h-[100px] w-[62px] bg-primary-500 ';
    

  progressBarContainer.appendChild(progressBar);

  progressBar.appendChild(progressOverlay);
  progressBar.appendChild(Tooltip);
  
    wrap.appendChild(progressBarContainer);
    titleDesContainer.appendChild(title);
    titleDesContainer.appendChild(content);
    wrap.appendChild(titleDesContainer);

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

          const titleDesContainer = document.createElement('div');
          titleDesContainer.classList = 'border-t border-primary-500 pb-4 pt-4'; 
          
          const imgTitleContainer = document.createElement('div');
          imgTitleContainer.classList = 'flex flex-col items-center justify-center gap-2 pb-4';

          const imgTitle = document.createElement('h3');
          imgTitle.classList = 'text-center font-proxima_nova text-xl font-bold text-secondary-500 lg:text-[28px]';
          imgTitle.innerHTML = 'No results available';

            const img = document.createElement('img');
            img.src = "./img/no-result.svg"
            img.alt = "no-result.svg"
       
          const emptyRow = createRow(backendName, `${coverageCount} of ${filteredRules.length}`);
          
            titleDesContainer.appendChild(emptyRow.title);
            titleDesContainer.appendChild(emptyRow.content);
            imgTitleContainer.appendChild(img);
            imgTitleContainer.appendChild(imgTitle);
            wrap.appendChild(imgTitleContainer);
            wrap.appendChild(titleDesContainer);
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
        wrap.classList = 'space-y-4 px-4 py-5 shadow-3xl odd:bg-white even:bg-brand-gray-light sm:space-y-6 sm:px-8 sm:py-8';;
        let htmlContent = `<div
              class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8"
            >
              <div class="space-y-1 sm:space-y-2">
                <h5
                  class="font-proxima_nova text-lg font-bold text-primary-500 lg:text-xl"
                >
                  Missing Field
                </h5>
                <h3
                  class="font-proxima_nova break-all text-lg font-bold text-secondary-500 sm:text-xl lg:text-2xl lg:text-[28px]"
                >
                  ${field}
                </h3>
              </div>
              <div class="space-y-1 sm:space-y-2">
                <h5
                  class="font-proxima_nova text-lg font-bold text-primary-500 lg:text-xl"
                >
                  Categories
                </h5>
                <h3
                  class="font-proxima_nova text-lg font-bold text-secondary-500 sm:text-xl lg:text-2xl lg:text-[28px]"
                >
                  ${value['logsource.categories'].join(', ')}
                </h3>
              </div>
              <div class="space-y-1 sm:space-y-2 lg:pl-10">
                <h5
                  class="font-proxima_nova text-lg font-bold text-primary-500 lg:text-xl"
                >
                  Products
                </h5>
                <h3
                  class="font-proxima_nova text-lg font-bold text-secondary-500 sm:text-xl lg:text-2xl lg:text-[28px]"
                >
                  ${value['logsource.products'].join(', ')}
                </h3>
              </div>
              <div class="space-y-1 sm:space-y-2 lg:pl-10">
                <h5
                  class="font-proxima_nova text-lg font-bold text-primary-500 lg:text-xl"
                >
                  Rules
                </h5>
                <h3
                  class="font-proxima_nova text-lg font-bold text-secondary-500 sm:text-xl lg:text-2xl lg:text-[28px]"
                >
                 ${value.refs.length}
                </h3>
              </div>
            </div>
            <div class="group w-full">
              <button
                type="button"
                class="accordion-header flex w-full items-center justify-between border-b border-primary-500 px-1.5 py-2 font-proxima_nova text-lg font-bold text-primary-500 group-[.open]:border-b-0 sm:px-4 lg:text-xl"
              >
                <span>See rules</span>
                <img
                  class="transition-all group-[.open]:rotate-180"
                  src="./img/triangle.svg"
                  alt="triangle.svg"
                />
              </button>
              <div
                class="max-h-0 overflow-hidden transition-all duration-200"
              >
        
                <ul class="grid gap-1 pt-2 sm:px-4" id="list-items">`;
                  for (var i = 0; i < value.refs.length; ++i) {
                    const rule = AppModel.rules.find((rule) => { return rule.id == value.refs[i]; });
                    const ruleLine = document.createElement('a');
                    ruleLine.classList = 'text-base text-secondary-500 hover:opacity-70 transition-all duration-200';
                    ruleLine.href = rule.file.replace('../sigma', 'https://github.com/SigmaHQ/sigma/tree/master');
                    ruleLine.target = "_blank";
                    ruleLine.textContent = rule.title;
         
                    htmlContent += `<li>${ruleLine.outerHTML}</li>`;
                }
               htmlContent +=`</ul>
              </div>
            </div>`
        wrap.innerHTML = htmlContent;

      

        backendErrorResults.appendChild(wrap);
    });

    conversionErrorNumber.innerText = count;
}

window.onload = function () {
    fetch('./data/model.json')
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
          loadAccordion();
       
        })
        .catch(_ => { });
}



function loadAccordion() {
  
const accordions = document.querySelectorAll(".accordion-header");
 
Accordion(accordions);


function Accordion(headers) {
  if (headers.length > 0) {  
    for (var i = 0; i < headers.length; i++) {
      headers[i].addEventListener("click", openCurrAccordion);
    }
  }
  function openCurrAccordion(e) {
    for (var i = 0; i < headers.length; i++) {
      var parent = headers[i].parentElement;
      var article = headers[i].nextElementSibling;
  
      if (this === headers[i] && !parent.classList.contains("open")) {
        parent.classList.add("open");
        article.style.maxHeight = article.scrollHeight + "px";
      } else {
        parent.classList.remove("open");
        article.style.maxHeight = "0px";
      }
    }
  }
}
}