import axios from 'axios';
import { key } from '../config'

export default class Recipe {

    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}`);
            this.title = res.data.title;
            this.img = res.data.image;
            this.url = res.data.sourceUrl;
            this.totalTime = res.data.readyInMinutes;
            this.servings = res.data.servings;
            this.ingredients = [];
            let arrIngredients = res.data.extendedIngredients;

            arrIngredients.forEach(element => {
                this.ingredients.push(element.original);
            });;

        } catch (error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    parseIngredients() {
        const unitsLong = ['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds','pound'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','lb','lb'];
        const units = [...unitsShort, 'kg','g'];

        const newIngredients = this.ingredients.map(el => {
            // Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // Remove parantheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //parse into count, unit and ingredient 
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //unit present 
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;

                if(arrCount[0] == "⅔"){
                    count = 0.66;
                } else if(arrCount[0] == "½") {
                    count = 0.5;
                } else if(arrCount[0].startsWith('*')){
                    count= 1; 
                } else if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-','+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count, 
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10) ) {
                // no unit, but a number to measure an ingredient
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else if(unitIndex === -1) {
                //no unit
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });

        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(el => {
            el.count *= ( newServings / this.servings);
        })

        this.servings = newServings;
    }
}