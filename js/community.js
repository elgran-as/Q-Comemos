// DOM Elements
const newPostBtn = document.getElementById('newPostBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const feedSection = document.querySelector('.feed-section');

// Create modal HTML
const modalHTML = `
<div class="modal fade" id="newPostModal" tabindex="-1" aria-labelledby="newPostModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="newPostModalLabel">Nueva Publicación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="newPostForm">
                    <div class="mb-3">
                        <label for="postImage" class="form-label">Foto</label>
                        <input type="file" class="form-control" id="postImage" accept="image/*" required>
                        <div class="image-preview mt-2" id="imagePreview"></div>
                    </div>
                    <div class="mb-3">
                        <label for="postDescription" class="form-label">Descripción</label>
                        <textarea class="form-control" id="postDescription" rows="3" maxlength="280" required></textarea>
                        <div class="form-text">Máximo 280 caracteres</div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="submitPost">Publicar</button>
            </div>
        </div>
    </div>
</div>
`;

// Add modal to body
document.body.insertAdjacentHTML('beforeend', modalHTML);

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
    const newPostForm = document.getElementById('newPostForm');
    const uploadArea = document.getElementById('uploadArea');
    const postImage = document.getElementById('postImage');
    const selectedTags = new Set();

    // Handle image upload
    uploadArea.addEventListener('click', () => postImage.click());

    postImage.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;" alt="Preview">
                    <p class="mt-2 mb-0">Cambiar foto</p>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle tags selection
    const tagButtons = document.querySelectorAll('[data-tag]');
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.dataset.tag;
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
                this.classList.remove('active');
            } else {
                selectedTags.add(tag);
                this.classList.add('active');
            }
        });
    });

    // Handle form submission
    newPostForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const description = document.getElementById('postDescription').value;
        const imageFile = postImage.files[0];

        if (!description.trim()) {
            showError('Por favor, escribí algo para compartir');
            return;
        }

        try {
            showLoading();
            const post = {
                id: Date.now().toString(),
                user: {
                    name: 'Usuario',
                    avatar: 'images/default-avatar.png'
                },
                description,
                tags: Array.from(selectedTags),
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: []
            };

            if (imageFile) {
                post.image = await getImageDataUrl(imageFile);
            }

            // Save post
            const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
            posts.unshift(post);
            localStorage.setItem('communityPosts', JSON.stringify(posts));

            // Reset form and close modal
            modal.hide();
            resetForm();
            location.reload();
        } catch (error) {
            console.error('Error creating post:', error);
            showError('No se pudo crear la publicación');
        } finally {
            hideLoading();
        }
    });

    function resetForm() {
        newPostForm.reset();
        uploadArea.innerHTML = `
            <i class="bi bi-image display-4 text-muted"></i>
            <p class="mb-0">Subí una foto</p>
        `;
        selectedTags.clear();
        tagButtons.forEach(btn => btn.classList.remove('active'));
    }

    // Like functionality
    const likeButtons = document.querySelectorAll('.post-actions .bi-heart');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('bi-heart');
            this.classList.toggle('bi-heart-fill');
            this.classList.toggle('text-danger');
        });
    });

    // Story creation functionality will be implemented directly through the modal

    // Load more posts on scroll
    let isLoading = false;
    let page = 1;

    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            if (!isLoading) {
                loadMorePosts();
            }
        }
    });
});

// Create new post
async function createPost() {
    const description = document.getElementById('postDescription').value;
    const imageFile = document.getElementById('postImage').files[0];

    // TODO: Implement API call to create post
    // For now, we'll simulate with localStorage
    const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    
    const newPost = {
        id: Date.now().toString(),
        user: {
            name: 'Usuario',
            avatar: 'images/default-avatar.png'
        },
        description,
        image: await getImageDataUrl(imageFile),
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('communityPosts', JSON.stringify(posts));
}

// Convert image file to data URL
function getImageDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
    });
}

// Load more posts
function loadMorePosts() {
    isLoading = true;
    showLoading();

    // TODO: Implement API call to load more posts
    setTimeout(() => {
        hideLoading();
        isLoading = false;
    }, 1000);
}

// UI Helper functions
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