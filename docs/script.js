document.addEventListener('DOMContentLoaded', () => {
    // Image modal viewer
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-close">&times;</div>
        <img class="image-modal-content" src="" alt="Aperçu de l'image">
        <div class="image-modal-caption"></div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.image-modal-content');
    const modalCaption = modal.querySelector('.image-modal-caption');
    const closeBtn = modal.querySelector('.image-modal-close');

    const images = document.querySelectorAll('.image-container img');

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            modal.classList.add('active');
            modalImg.src = img.src;
            modalCaption.textContent = img.alt || 'Aperçu HubFPK';
        });
    });

    const closeModal = () => modal.classList.remove('active');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === modalImg) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    console.log("HubFPK — Site de présentation chargé.");
});
