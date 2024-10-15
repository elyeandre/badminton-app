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

function editPaymentStatus(editIcon) {
    const row = editIcon.closest('tr');
    const paymentStatusCell = row.querySelector('td:nth-child(6)'); // The 6th cell is the Payment Status

    const paymentStatusText = paymentStatusCell.querySelector('.payment-status-text');
    const paymentStatusDropdown = paymentStatusCell.querySelector('.payment-status-dropdown');
    const saveIcon = row.querySelector('.save-icon');

    // Switch from edit mode to save mode
    paymentStatusText.style.display = 'none'; // Hide text
    paymentStatusDropdown.style.display = 'inline'; // Show dropdown
    editIcon.style.display = 'none'; // Hide edit icon
    saveIcon.style.display = 'inline'; // Show save icon
}

function savePaymentStatus(saveIcon) {
    const row = saveIcon.closest('tr');
    const paymentStatusCell = row.querySelector('td:nth-child(6)'); // The 6th cell is the Payment Status

    const paymentStatusText = paymentStatusCell.querySelector('.payment-status-text');
    const paymentStatusDropdown = paymentStatusCell.querySelector('.payment-status-dropdown');
    const editIcon = row.querySelector('.edit-icon');

    // Save the changes
    const selectedValue = paymentStatusDropdown.value;
    paymentStatusText.textContent = selectedValue; // Update text to selected value
    paymentStatusText.style.display = 'inline'; // Show updated text
    paymentStatusDropdown.style.display = 'none'; // Hide dropdown

    // Switch back to edit mode
    saveIcon.style.display = 'none'; // Hide save icon
    editIcon.style.display = 'inline'; // Show edit icon
    
    // Optionally, add code here to save the updated status to a database
}
