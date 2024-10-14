let currentSortColumn = '';
let currentSortOrder = 'asc';

function editPaymentStatus(icon) {
    const row = icon.closest('td');
    row.querySelector('.payment-status-text').style.display = 'none';
    row.querySelector('.payment-status-dropdown').style.display = 'inline-block';
    row.querySelector('.edit-icon').style.display = 'none';
    row.querySelector('.save-icon').style.display = 'inline-block';
}

function savePaymentStatus(icon) {
    const row = icon.closest('td');
    const newStatus = row.querySelector('.payment-status-dropdown').value;
    row.querySelector('.payment-status-text').textContent = newStatus;
    
    // Revert to text display mode
    row.querySelector('.payment-status-text').style.display = 'inline-block';
    row.querySelector('.payment-status-dropdown').style.display = 'none';
    row.querySelector('.edit-icon').style.display = 'inline-block';
    row.querySelector('.save-icon').style.display = 'none';
}

function toggleSort(column) {
    const table = document.querySelector('table tbody');
    const rows = Array.from(table.rows);

    if (currentSortColumn === column) {
        currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
    } else {
        currentSortOrder = 'asc';
    }
    currentSortColumn = column;

    rows.sort((a, b) => {
        let aColText = a.cells[columnIndex(column)].innerText.trim();
        let bColText = b.cells[columnIndex(column)].innerText.trim();

        if (currentSortOrder === 'asc') {
            return compareValues(aColText, bColText, column);
        } else {
            return compareValues(bColText, aColText, column);
        }
    });

    // Remove existing rows
    table.innerHTML = '';

    // Re-add sorted rows
    rows.forEach(row => table.appendChild(row));

    // Update sort icons
    updateSortIcons(column);
}

function compareValues(a, b, column) {
    if (column === 'date') {
        return new Date(a) - new Date(b);
    } else if (column === 'from' || column === 'to') {
        return new Date(`1970-01-01T${a}`) - new Date(`1970-01-01T${b}`);
    } else {
        return a.localeCompare(b);
    }
}

function updateSortIcons(column) {
    const icons = document.querySelectorAll('.sort-icon');
    icons.forEach(icon => {
        icon.classList.remove('asc', 'desc');
    });

    const currentIcon = Array.from(icons).find(icon => icon.parentElement.textContent.trim() === column.charAt(0).toUpperCase() + column.slice(1));
    if (currentSortOrder === 'asc') {
        currentIcon.classList.add('asc');
    } else {
        currentIcon.classList.add('desc');
    }
}

function columnIndex(columnName) {
    switch (columnName) {
        case 'name':
            return 0;
        case 'date':
            return 1;
        case 'from':
            return 2;
        case 'to':
            return 3;
        case 'court':
            return 4;
        case 'status':
            return 5;
        case 'totalBill':
            return 6;
        case 'paymentStatus':
            return 7;
        default:
            return 0;
    }
}