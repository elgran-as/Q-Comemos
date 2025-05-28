// Cargar recetas desde recipes-data.json
async function loadRecipes() {
    try {
        const response = await fetch('recipes-data.json');
        const data = await response.json();
        // Convertir a array si es un objeto único
        const recipes = Array.isArray(data) ? data : [data];
        displayRecipes(recipes);
        loadRecipeModals(recipes);
    } catch (error) {
        console.error('Error cargando recetas:', error);
    }
}

// Mostrar recetas en el grid
function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = ''; // Limpiar grid existente
    
    recipes.forEach(recipe => {
        const recipeCard = `
            <div class="col-6">
                <div class="recipe-card" data-category="${recipe.mealType}">
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-info">
                        <h3>${recipe.title}</h3>
                        <div class="recipe-meta">
                            <span><i class="bi bi-clock"></i> ${recipe.time} min</span>
                            <span><i class="bi bi-star-fill"></i> ${recipe.rating}</span>
                        </div>
                        <button class="btn btn-primary btn-sm mt-2" data-bs-toggle="modal"
                            data-bs-target="#modal-${recipe.id}">
                            Ver receta
                        </button>
                    </div>
                </div>
            </div>
        `;
        recipeGrid.insertAdjacentHTML('beforeend', recipeCard);
    });
}

// Cargar modales de recetas
function loadRecipeModals(recipes) {
    const container = document.getElementById('recipeModalsContainer');
    container.innerHTML = ''; // Limpiar modales existentes

    recipes.forEach(recipe => {
        const variantOptions = Object.keys(recipe.variants || {}).map(variant => 
            `<option value="${variant}">${variant}</option>`
        ).join('');

        const modal = `
            <div class="modal fade" id="modal-${recipe.id}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${recipe.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <img src="${recipe.image}" class="img-fluid rounded mb-3" alt="${recipe.title}">
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="recipe-meta">
                                    <span><i class="bi bi-clock"></i> ${recipe.time} min</span>
                                    <span><i class="bi bi-star-fill"></i> ${recipe.rating}</span>
                                </div>
                                <div class="servings-control">
                                    <button onclick="adjustServings(-1, '${recipe.id}')" class="btn btn-sm btn-outline-primary">-</button>
                                    <span id="servings-${recipe.id}">${recipe.defaultServings}</span>
                                    <button onclick="adjustServings(1, '${recipe.id}')" class="btn btn-sm btn-outline-primary">+</button>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between mb-3">
                                <button type="button" class="btn btn-outline-primary" onclick="addRecipeToList('${recipe.id}')">
                                    <i class="bi bi-cart-plus"></i> Agregar a lista
                                </button>
                                <button type="button" class="btn btn-outline-primary">
                                    <i class="bi bi-bookmark"></i> Guardar
                                </button>
                                <button type="button" class="btn btn-outline-primary">
                                    <i class="bi bi-share"></i> Compartir
                                </button>
                            </div>

                            ${variantOptions ? `
                                <div class="mb-3">
                                    <select class="form-select" onchange="changeVariant('${recipe.id}', this.value)">
                                        <option value="default">Receta original</option>
                                        ${variantOptions}
                                    </select>
                                </div>
                            ` : ''}

                            <h6>Ingredientes:</h6>
                            <ul id="ingredientsList-${recipe.id}" class="list-unstyled">
                                ${recipe.ingredients.map(ing => `
                                    <li>
                                        <span class="ingredient-amount" 
                                            data-base-amount="${ing.baseAmount}" 
                                            data-base-servings="${recipe.defaultServings}">
                                            ${ing.baseAmount}
                                        </span> 
                                        ${ing.unit} de ${ing.name}
                                        <span class="text-muted">
                                            (<span class="calories" data-cal-per-unit="${ing.caloriesPerUnit}">
                                                ${ing.totalCalories}
                                            </span> cal)
                                        </span>
                                    </li>
                                `).join('')}
                            </ul>

                            <div class="text-end mb-3">
                                Total calorías: <span id="total-calories-${recipe.id}">
                                    ${recipe.ingredients.reduce((sum, ing) => sum + ing.totalCalories, 0)}
                                </span>
                            </div>

                            <h6>Preparación:</h6>
                            <ol>
                                ${recipe.instructions.map(instruction => 
                                    `<li>${instruction}</li>`
                                ).join('')}
                            </ol>

                            ${recipe.tips ? `
                                <h6>Consejos:</h6>
                                <ul>
                                    ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', modal);
    });
}

// Función para ajustar las porciones
function adjustServings(change, recipeId) {
    const servingsDisplay = document.getElementById(`servings-${recipeId}`);
    let currentServings = parseInt(servingsDisplay.textContent);
    
    if (currentServings + change >= 1) {
        currentServings += change;
        servingsDisplay.textContent = currentServings;
        updateIngredients(recipeId, currentServings);
    }
}

// Actualizar ingredientes y calorías
function updateIngredients(recipeId, newServings) {
    const ingredientsList = document.getElementById(`ingredientsList-${recipeId}`);
    const ingredients = ingredientsList.querySelectorAll('li');
    let totalCalories = 0;
    
    ingredients.forEach(ingredient => {
        const amountElement = ingredient.querySelector('.ingredient-amount');
        const caloriesElement = ingredient.querySelector('.calories');
        
        if (amountElement) {
            const baseAmount = parseFloat(amountElement.dataset.baseAmount);
            const baseServings = parseFloat(amountElement.dataset.baseServings);
            
            const newAmount = (baseAmount * newServings) / baseServings;
            amountElement.textContent = newAmount.toFixed(1);
            
            if (caloriesElement) {
                const calPerUnit = parseFloat(caloriesElement.dataset.calPerUnit);
                const newCalories = calPerUnit * newAmount;
                caloriesElement.textContent = Math.round(newCalories);
                totalCalories += newCalories;
            }
        }
    });
    
    const totalCaloriesElement = document.getElementById(`total-calories-${recipeId}`);
    if (totalCaloriesElement) {
        totalCaloriesElement.textContent = Math.round(totalCalories);
    }
}

// Cambiar variante de receta
async function changeVariant(recipeId, variant) {
    try {
        const response = await fetch('recipes-data.json');
        const data = await response.json();
        const recipes = Array.isArray(data) ? data : [data];
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) return;

        const modal = document.getElementById(`modal-${recipeId}`);
        const ingredientsList = modal.querySelector(`#ingredientsList-${recipeId}`);
        const instructionsList = modal.querySelector('ol');
        
        if (variant === 'default') {
            // Restaurar ingredientes originales
            ingredientsList.innerHTML = recipe.ingredients.map(ing => `
                <li>
                    <span class="ingredient-amount" 
                        data-base-amount="${ing.baseAmount}" 
                        data-base-servings="${recipe.defaultServings}">
                        ${ing.baseAmount}
                    </span> 
                    ${ing.unit} de ${ing.name}
                    <span class="text-muted">
                        (<span class="calories" data-cal-per-unit="${ing.caloriesPerUnit}">
                            ${ing.totalCalories}
                        </span> cal)
                    </span>
                </li>
            `).join('');

            // Restaurar instrucciones originales
            instructionsList.innerHTML = recipe.instructions.map(instruction => 
                `<li>${instruction}</li>`
            ).join('');
        } else {
            const variantData = recipe.variants[variant];
            if (!variantData) return;

            // Actualizar instrucciones si hay modificaciones
            if (variantData.modifiedInstructions) {
                instructionsList.innerHTML = variantData.modifiedInstructions.map(instruction =>
                    `<li>${instruction}</li>`
                ).join('');
            }

            // Agregar ingredientes adicionales si existen
            if (variantData.additionalIngredients) {
                const additionalIngredientsHtml = variantData.additionalIngredients.map(ing => `
                    <li>
                        <span class="ingredient-amount" 
                            data-base-amount="${ing.baseAmount}" 
                            data-base-servings="${recipe.defaultServings}">
                            ${ing.baseAmount}
                        </span> 
                        ${ing.unit} de ${ing.name}
                        <span class="text-muted">
                            (<span class="calories" data-cal-per-unit="${ing.caloriesPerUnit}">
                                ${ing.totalCalories}
                            </span> cal)
                        </span>
                    </li>
                `).join('');
                ingredientsList.insertAdjacentHTML('beforeend', additionalIngredientsHtml);
            }
        }

        // Actualizar calorías totales
        const currentServings = parseInt(document.getElementById(`servings-${recipeId}`).textContent);
        updateIngredients(recipeId, currentServings);
    } catch (error) {
        console.error('Error al cambiar variante:', error);
    }
}

// Función para filtrar recetas por las primeras tres letras
function filterRecipes(searchTerm) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    const searchPrefix = searchTerm.toLowerCase().substring(0, 3);

    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const titlePrefix = title.substring(0, 3);
        
        if (searchTerm === '' || titlePrefix.includes(searchPrefix)) {
            card.closest('.col-6').style.display = '';
        } else {
            card.closest('.col-6').style.display = 'none';
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    
    // Agregar evento de búsqueda
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterRecipes(e.target.value);
        });
    }
});