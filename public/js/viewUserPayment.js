// JavaScript to handle sorting
let nameSortDirection = 'asc';
let dateSortDirection = 'asc';

function sortTable(column, type) {
    const table = document.querySelector('table tbody');
    const rows = Array.from(table.rows);
    const sortDirection = column === 'name' ? nameSortDirection : dateSortDirection;
    
    rows.sort((a, b) => {
        const aText = a.cells[column === 'name' ? 0 : 2].textContent.trim();
        const bText = b.cells[column === 'name' ? 0 : 2].textContent.trim();
        
        if (type === 'string') {
            return sortDirection === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
        } else if (type === 'date') {
            return sortDirection === 'asc' ? new Date(aText) - new Date(bText) : new Date(bText) - new Date(aText);
        }
    });

    // Update table with sorted rows
    table.innerHTML = '';
    rows.forEach(row => table.appendChild(row));

    // Toggle sort direction
    if (column === 'name') {
        nameSortDirection = nameSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        dateSortDirection = dateSortDirection === 'asc' ? 'desc' : 'asc';
    }
}