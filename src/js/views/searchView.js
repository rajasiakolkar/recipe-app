import { elements } from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = "";
};

export const clearResults = () => {
  elements.searchResultList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        // return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}


const renderRecipe = recipe => {
  const markup = `<li>
                        <a class="results__link" href="#${recipe.id}">
                            <figure class="results__fig">
                                <img src="${recipe.image}" alt="${recipe.title}">
                            </figure> 
                            <div class="results__data">
                            <h4 class="results__name">${(recipe.title)}</h4>
                            </div>
                        </a>
                    </li>`;

  var htmlObject = document.createElement("div");
  htmlObject.innerHTML = markup;
  elements.searchResultList.insertAdjacentElement("beforeend", htmlObject);
};

export const renderResult = recipes => {
  recipes.forEach(element => {
    let img = element.image.split('-');
    img = img[img.length-1];
    var finalImage = img.split('.')[0];

    element.image = `https://spoonacular.com/recipeImages/${finalImage}-556x370.jpg`;
    renderRecipe(element);
  });
};

//"cabbage-salad-with-peanuts-723984.jpg"

const createButton = (page, type) => {
    let pageNum;
    if(type === 'prev'){
        pageNum = parseInt(page)-1; 
    } else if(type === 'next'){
        pageNum = parseInt(page)+1;
    }
    
    //data-goto=${type === 'prev' ? page - 1 : page + 1}

    const a = 
    `<button class="btn-inline results__btn--${type}" data-goto="${pageNum}">
        <span>Page ${type === 'prev' ? parseInt(page) - 1 : parseInt(page) + 1 }</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right' }"></use>
        </svg>
    </button>`;

    return a;
}
    

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
  
    let button;

    if(page == 1) {
        //Only button to go to the next page 
        button = createButton(page, 'next');

    }  else if(page < pages) {
        //both buttons
        button = `${createButton(page, 'prev')} ${createButton(page, 'next')}`; 

    } else if(page == pages && pages > 1) {
        //Only button for previous page 
        button = createButton(page, 'prev');
    } 

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 5) => {
    //render results for current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    const r = recipes;
    recipes = recipes.slice(start, end);
    renderResult(recipes);

    //render buttons for pagination
    renderButtons(page, r.length, resPerPage);
};
 