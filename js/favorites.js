// DOM Elements
const favoritesGrid = document.getElementById('favoritesGrid');
const emptyState = document.getElementById('emptyState');
const loadingSpinner = document.getElementById('loadingSpinner');

// Load favorite recipes
async function loadFavorites() {
    try {
        showLoading();
        const favorites = await getFavoriteRecipes();
        
        if (favorites.length === 0) {
            showEmptyState();
        } else {
            displayFavorites(favorites);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        showError('No se pudieron cargar los favoritos');
    } finally {
        hideLoading();
    }
}

// Get favorite recipes from storage/API
async function getFavoriteRecipes() {
    // TODO: Implement API call or local storage retrieval
    return JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
}

// Display favorites in the grid
function displayFavorites(favorites) {
    favoritesGrid.innerHTML = favorites.map(recipe => `
        <div class="col-6 col-md-4 col-lg-3" data-recipe-id="${recipe.id}">
            <div class="card h-100">
                <img src="${recipe.image}" class="card-img-top" alt="${recipe.name}">
                <div class="card-body">
                    <h2 class="card-title h6">${recipe.name}</h2>
                    <p class="card-text small text-muted mb-0">
                        <i class="bi bi-clock"></i> ${recipe.cookTime} min
                        <span class="ms-2"><i class="bi bi-star-fill text-warning"></i> ${recipe.rating}</span>
                    </p>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-link text-danger p-0" onclick="removeFavorite('${recipe.id}')">
                        <i class="bi bi-heart-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Remove recipe from favorites
async function removeFavorite(recipeId) {
    try {
        const favorites = await getFavoriteRecipes();
        const updatedFavorites = favorites.filter(recipe => recipe.id !== recipeId);
        localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
        
        // Remove card with animation
        const card = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        card.style.transition = 'opacity 0.3s ease-out';
        card.style.opacity = '0';
        
        setTimeout(() => {
            if (updatedFavorites.length === 0) {
                showEmptyState();
            } else {
                card.remove();
            }
        }, 300);
    } catch (error) {
        console.error('Error removing favorite:', error);
        showError('No se pudo eliminar de favoritos');
    }
}

// UI Helper functions
function showEmptyState() {
    favoritesGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    // TODO: Implement error toast or notification
    alert(message);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadFavorites);