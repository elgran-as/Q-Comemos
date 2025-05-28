document.addEventListener('DOMContentLoaded', function() {
    // Like functionality
    const likeButtons = document.querySelectorAll('.post-actions .bi-heart');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const likeCount = this.nextElementSibling;
            if (this.classList.contains('bi-heart-fill')) {
                this.classList.replace('bi-heart-fill', 'bi-heart');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            } else {
                this.classList.replace('bi-heart', 'bi-heart-fill');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            }
        });
    });

    // Story creation
    const addStoryButton = document.querySelector('.add-story');
    addStoryButton.addEventListener('click', function() {
        // Add your story creation logic here
        console.log('Create new story');
    });

    // Create post button
    const createPostBtn = document.getElementById('createPostBtn');
    createPostBtn.addEventListener('click', function() {
        // Add your post creation logic here
        console.log('Create new post');
    });

    // Share functionality
    const shareButtons = document.querySelectorAll('.post-actions .bi-share');
    shareButtons.forEach(button => {
        button.addEventListener('click', async function() {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Q\'COMEMOS Post',
                        text: 'Check out this amazing recipe!',
                        url: window.location.href
                    });
                }
            } catch (err) {
                console.log('Error sharing:', err);
            }
        });
    });

    // Load more posts on scroll
    let isLoading = false;
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (!isLoading) {
                loadMorePosts();
            }
        }
    });

    function loadMorePosts() {
        isLoading = true;
        // Simulate loading more posts
        setTimeout(() => {
            // Add your post loading logic here
            isLoading = false;
        }, 1000);
    }
});