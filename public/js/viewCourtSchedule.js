function searchTable() {
    const input = document.getElementById('search').value.toLowerCase();
    const table = document.querySelector('table tbody');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let rowVisible = false;

        for (let j = 0; j < cells.length; j++) {
            const cellValue = cells[j].textContent.toLowerCase();
            if (cellValue.includes(input)) {
                rowVisible = true;
                break;
            }
        }

        rows[i].style.display = rowVisible ? '' : 'none';
    }
}

function editReservation(editIcon) {
const row = editIcon.closest('tr');
const paymentStatusCell = row.querySelector('td:nth-child(8)'); 

const paymentStatusText = paymentStatusCell.querySelector('.payment-status-text');
const paymentStatusDropdown = paymentStatusCell.querySelector('.payment-status-dropdown');

if (editIcon.classList.contains('fa-edit')) {
// Switch from edit mode to save mode
paymentStatusText.style.display = 'none'; // Hide text
paymentStatusDropdown.style.display = 'inline'; // Show dropdown
editIcon.classList.remove('fa-edit');
editIcon.classList.add('fa-save');
} else if (editIcon.classList.contains('fa-save')) {
// Save the changes
const selectedValue = paymentStatusDropdown.value;
paymentStatusText.textContent = selectedValue; // Update text to selected value
paymentStatusText.style.display = 'inline'; // Show updated text
paymentStatusDropdown.style.display = 'none'; // Hide dropdown

// Switch back to edit mode
editIcon.classList.remove('fa-save');
editIcon.classList.add('fa-edit');

}
}
