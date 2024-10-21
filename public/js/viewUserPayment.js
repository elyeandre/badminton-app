let sortOrder = [true, true, true, true, true]; // true for ascending

function sortTable(columnIndex) {
    const table = document.querySelector("table tbody");
    const rows = Array.from(table.rows);
    const isAscending = sortOrder[columnIndex];

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].innerText;
        const cellB = rowB.cells[columnIndex].innerText;

        // Handling date sorting
        if (columnIndex === 2 || columnIndex === 5 || columnIndex === 6) {
            return isAscending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
        }

        // Handling numeric values (if any)
        if (columnIndex === 3 || columnIndex === 7) {
            return isAscending ? parseFloat(cellA.replace(/[^0-9.-]+/g,"")) - parseFloat(cellB.replace(/[^0-9.-]+/g,"")) : parseFloat(cellB.replace(/[^0-9.-]+/g,"")) - parseFloat(cellA.replace(/[^0-9.-]+/g,""));
        }

        // Default string comparison
        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    // Toggle sort order for the next sort
    sortOrder[columnIndex] = !isAscending;

    // Clear existing rows and append sorted rows
    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));
}

document.getElementById('expandButton').addEventListener('click', function() {
    const hiddenColumns = document.querySelectorAll('.hide-column');
    hiddenColumns.forEach(column => {
        if (column.style.display === 'none' || column.style.display === '') {
            column.style.display = 'table-cell';
            document.getElementById('expandButton').innerHTML = 'Collapse Table <i class="fas fa-compress"></i>';
        } else {
            column.style.display = 'none';
            document.getElementById('expandButton').innerHTML = 'Expand Table <i class="fas fa-expand"></i>';
        }
    });
});

// Initially hide columns
window.onload = function() {
    const hiddenColumns = document.querySelectorAll('.hide-column');
    hiddenColumns.forEach(column => {
        column.style.display = 'none';
    });
};