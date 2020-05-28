import Search from './models/search';
import Recipe from './models/recipe';
import List from './models/list';
import Likes from './models/likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global STATE of the app 
    - search object
    - current recipe object
    - shopping list object 
    - liked recipes
*/
const state = {};

//SEARCH CONTROLLER
const searchController = async () => {
    // Get query from the view 
    const query = searchView.getInput();
    //const query = 'pizza';
    
    if(query) {
        // create new search object and add it to state 
        state.search = new Search(query);

        // Preparing UI for result - clearing previous result, showing spinner
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // Search for recipes
            await state.search.getResult();

            // Render result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(error) {
            clearLoader();
            alert('Something wrong!');
        }

        
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    searchController();
});

//TESTING
// window.addEventListener('load', e => {
//     e.preventDefault();
//     searchController();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = btn.dataset.goto;
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//RECIPE CONTROLLER
const recipeController = async () => {
    //Get ID from URL
    const id = window.location.hash.replace('#', '');
    
    if(id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Hightlight selected recipe
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe object 
        state.recipe = new Recipe(id);

        //TESTING
        window.r = state.recipe;

        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error processing recipe');
        }
        
    }
}

// window.addEventListener('hashchange', recipeController);
// window.addEventListener('load', recipeController);

['hashchange', 'load'].forEach(event => window.addEventListener(event, recipeController));

//LIST CONTROLLER

const listController = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//LIKE CONTROLLER
const likeController = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has not yet liked current recipe
    if(!state.likes.isLiked()) {
        //add like to state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.img);

        //toggle like button 
        likesView.toggleLikeBtn(true);

        //add like to UI 
        likesView.renderLike(newLike);

       //user has liked recipe
    } else {
        //remove like from state
        state.likes.deleteLike(currentID);

        //toggle like button 
        likesView.toggleLikeBtn(false);

        //remove like from UI 
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//Restore liked recipes on page load 
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render existing likes 
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button clicked
        if(state.recipe.servings > 1 ){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        listController();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        likeController();
    }
});
