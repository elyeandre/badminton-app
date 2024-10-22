document.addEventListener('DOMContentLoaded', function () {
    const addProductButton = document.getElementById('addProductButton');
    const modal = document.getElementById('addProductModal');
    const cancelProductModal = document.getElementById('cancelProductModal');

    addProductButton.addEventListener('click', function (e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    cancelProductModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
