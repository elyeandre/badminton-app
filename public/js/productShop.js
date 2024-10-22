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

function toggleTables() {
    const productTableContainer = document.getElementById('productTableContainer');
    const archiveTableContainer = document.getElementById('archiveTableContainer');
    const toggleButton = document.getElementById('toggleTableButton');

    // Check the current visibility of the product table container
    if (productTableContainer.style.display === 'none') {
        // Show product table container, hide archive table container, change button text to 'Archive'
        productTableContainer.style.display = 'block';
        archiveTableContainer.style.display = 'none';
        toggleButton.innerHTML = 'Archive <i class="fas fa-archive"></i>';
    } else {
        // Show archive table container, hide product table container, change button text to 'Product List'
        productTableContainer.style.display = 'none';
        archiveTableContainer.style.display = 'block';
        toggleButton.innerHTML = 'Product List <i class="fas fa-box"></i>';
    }
}

