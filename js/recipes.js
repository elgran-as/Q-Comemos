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
    
    // Configuración global de Bootstrap para modales
    const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true
    };

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
                                    <i class="bi bi-cart-plus"></i> Lista de compra
                                </button>
                                <button type="button" class="btn btn-outline-primary">
                                    <i class="bi bi-heart"></i> Favorito
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

    // Inicializar todos los modales con las opciones configuradas
    document.querySelectorAll('.modal').forEach(modalElement => {
        new bootstrap.Modal(modalElement, modalOptions);
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

// Función para manejar favoritos
async function toggleFavorite() {
    const recipeId = getCurrentRecipeId();
    const recipe = await getRecipeById(recipeId);
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteIcon = document.getElementById('favoriteIcon');
    
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const isFavorite = favorites.some(fav => fav.id === recipeId);
    
    if (isFavorite) {
        // Remover de favoritos
        favorites = favorites.filter(fav => fav.id !== recipeId);
        favoriteIcon.classList.remove('bi-heart-fill');
        favoriteIcon.classList.add('bi-heart');
        favoriteBtn.classList.remove('active');
    } else {
        // Agregar a favoritos
        favorites.push(recipe);
        favoriteIcon.classList.remove('bi-heart');
        favoriteIcon.classList.add('bi-heart-fill');
        favoriteBtn.classList.add('active');
    }
    
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

// Obtener ID de la receta actual
function getCurrentRecipeId() {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Obtener receta por ID
async function getRecipeById(id) {
    try {
        const response = await fetch('recipes-data.json');
        const recipes = await response.json();
        return recipes.find(recipe => recipe.id === id);
    } catch (error) {
        console.error('Error al obtener la receta:', error);
        return null;
    }
}

// Verificar estado inicial de favoritos
async function checkFavoriteStatus() {
    const recipeId = getCurrentRecipeId();
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const isFavorite = favorites.some(fav => fav.id === recipeId);
    
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteIcon = document.getElementById('favoriteIcon');
    
    if (isFavorite) {
        favoriteIcon.classList.remove('bi-heart');
        favoriteIcon.classList.add('bi-heart-fill');
        favoriteBtn.classList.add('active');
    }
}

// Inicializar estado de favoritos al cargar la página
document.addEventListener('DOMContentLoaded', checkFavoriteStatus);
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

// Función para filtrar por categoría
function filterByCategory(category) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    recipeCards.forEach(card => {
        const cardCategory = card.dataset.category.toLowerCase();
        const parent = card.closest('.col-6');
        
        if (category.toLowerCase() === 'todas' || cardCategory === category.toLowerCase()) {
            parent.style.display = '';
        } else {
            parent.style.display = 'none';
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
    
    // Agregar eventos a los botones de categoría
    const categoryButtons = document.querySelectorAll('.category-pill');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            // Filtrar recetas
            filterByCategory(button.textContent.trim());
        });
    });
});

// Inicializar el modal de agregar receta
document.addEventListener('DOMContentLoaded', function() {
    // Vincular el botón FAB con el modal
    document.getElementById('addRecipeBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('addRecipeModal'));
        modal.show();
    });

    // Manejar agregar campos dinámicos
    document.getElementById('addIngredientBtn').addEventListener('click', function() {
        const container = document.getElementById('ingredientsContainer');
        const newEntry = container.children[0].cloneNode(true);
        // Limpiar valores
        newEntry.querySelectorAll('input').forEach(input => input.value = '');
        container.appendChild(newEntry);
    });

    document.getElementById('addInstructionBtn').addEventListener('click', function() {
        const container = document.getElementById('instructionsContainer');
        const newEntry = container.children[0].cloneNode(true);
        newEntry.querySelector('input').value = '';
        container.appendChild(newEntry);
    });

    document.getElementById('addTipBtn').addEventListener('click', function() {
        const container = document.getElementById('tipsContainer');
        const newEntry = container.children[0].cloneNode(true);
        newEntry.querySelector('input').value = '';
        container.appendChild(newEntry);
    });

    // Manejar guardado de receta
    document.getElementById('saveRecipeBtn').addEventListener('click', async function() {
        const form = document.getElementById('addRecipeForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Recopilar datos del formulario
        const formData = new FormData(form);
        const recipeData = {
            id: Date.now().toString(), // Generar ID único
            title: formData.get('title'),
            time: parseInt(formData.get('time')),
            defaultServings: parseInt(formData.get('defaultServings')),
            mealType: formData.get('mealType'),
            rating: 0, // Rating inicial
            ingredients: [],
            instructions: [],
            tips: []
        };

        // Procesar imagen
        const imageFile = formData.get('image');
        if (imageFile) {
            // Aquí deberías implementar la lógica para subir la imagen a tu servidor
            // Por ahora, usaremos una URL temporal
            recipeData.image = URL.createObjectURL(imageFile);
        }

        // Recopilar ingredientes
        const amounts = formData.getAll('amounts[]');
        const units = formData.getAll('units[]');
        const ingredients = formData.getAll('ingredients[]');
        const calories = formData.getAll('calories[]');

        for (let i = 0; i < ingredients.length; i++) {
            if (ingredients[i]) {
                recipeData.ingredients.push({
                    name: ingredients[i],
                    baseAmount: parseFloat(amounts[i]),
                    unit: units[i],
                    caloriesPerUnit: parseFloat(calories[i]),
                    totalCalories: parseFloat(amounts[i]) * parseFloat(calories[i])
                });
            }
        }

        // Recopilar instrucciones
        formData.getAll('instructions[]').forEach(instruction => {
            if (instruction) recipeData.instructions.push(instruction);
        });

        // Recopilar tips
        formData.getAll('tips[]').forEach(tip => {
            if (tip) recipeData.tips.push(tip);
        });

        try {
            // Aquí deberías implementar la lógica para guardar la receta en tu backend
            // Por ahora, solo la agregaremos al array local
            const response = await fetch('recipes-data.json');
            const data = await response.json();
            const recipes = Array.isArray(data) ? data : [data];
            recipes.push(recipeData);

            // Actualizar la interfaz
            displayRecipes(recipes);
            loadRecipeModals(recipes);

            // Cerrar el modal y limpiar el formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('addRecipeModal'));
            modal.hide();
            form.reset();

            // Mostrar mensaje de éxito
            alert('Receta guardada exitosamente');
        } catch (error) {
            console.error('Error al guardar la receta:', error);
            alert('Error al guardar la receta. Por favor, intente nuevamente.');
        }
    });
});
// Función para agregar ingredientes a la lista de compras
async function addRecipeToList(recipeId) {
    try {
        // Cargar los datos de la receta
        const response = await fetch('recipes-data.json');
        const data = await response.json();
        const recipes = Array.isArray(data) ? data : [data];
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            console.error('Receta no encontrada');
            return;
        }

        // Obtener el contenedor de la lista de compras
        const shoppingListContainer = document.getElementById('shoppingListContainer');

        // Limpiar items existentes si es necesario
        const shouldClear = confirm('¿Desea reemplazar los items existentes en la lista?');
        if (shouldClear) {
            shoppingListContainer.innerHTML = '';
        }

        // Agregar cada ingrediente de la receta
        recipe.ingredients.forEach(ingredient => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shopping-list-item d-flex gap-2 mb-2 align-items-center';
            itemDiv.innerHTML = `
                <input type="number" class="form-control" value="${ingredient.baseAmount}" style="width: 100px">
                <input type="text" class="form-control" value="${ingredient.unit}" style="width: 100px">
                <input type="text" class="form-control" value="${ingredient.name}">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.parentElement.remove()">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            shoppingListContainer.appendChild(itemDiv);
        });

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modal-shopping-list'));
        modal.show();

    } catch (error) {
        console.error('Error al cargar los ingredientes:', error);
        alert('Error al cargar los ingredientes. Por favor, intente nuevamente.');
    }
}
function addEmptyShoppingItem() {
    const shoppingListContainer = document.getElementById('shoppingListContainer');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shopping-list-item d-flex gap-2 mb-2 align-items-center';
    itemDiv.innerHTML = `
        <input type="number" class="form-control" value="1" style="width: 100px">
        <input type="text" class="form-control" placeholder="unidad" style="width: 100px">
        <input type="text" class="form-control" placeholder="item">
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.parentElement.remove()">
            <i class="bi bi-trash"></i>
        </button>
    `;
    shoppingListContainer.appendChild(itemDiv);
}
function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = ''; // Limpiar grid existente
    
    const difficultyColors = {
        'facil': '#66BB6A',
        'media': '#FFD54F',
        'alta': '#E63946'
    };
    
    recipes.forEach(recipe => {
        const backgroundColor = difficultyColors[recipe.difficulty] || '#FFFFFF';
        const recipeCard = `
            <div class="col-6">
                <div class="recipe-card" data-category="${recipe.mealType}" style="background-color: ${backgroundColor};">
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

const difficulty = receta.difficulty; // viene del JSON
contenedor.classList.add(`bg-${difficulty}`);
  