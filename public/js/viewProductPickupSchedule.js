function editStatus(editIcon) {
    const row = editIcon.closest('tr');

    // Payment Status
    const paymentStatusCell = row.querySelector('td:nth-child(6)');
    const paymentStatusText = paymentStatusCell.querySelector('.payment-status-text');
    const paymentStatusDropdown = paymentStatusCell.querySelector('.payment-status-dropdown');

    // Pickup Status
    const pickupStatusCell = row.querySelector('td:nth-child(7)');
    const pickupStatusText = pickupStatusCell.querySelector('.pickup-status-text');
    const pickupStatusDropdown = pickupStatusCell.querySelector('.pickup-status-dropdown');

    const saveIcon = row.querySelector('.save-icon');

    if (editIcon.style.display !== 'none') {
        // Switch to edit mode for Payment Status
        paymentStatusText.style.display = 'none';
        paymentStatusDropdown.style.display = 'inline';

        // Switch to edit mode for Pickup Status
        pickupStatusText.style.display = 'none';
        pickupStatusDropdown.style.display = 'inline';

        // Toggle icons
        editIcon.style.display = 'none';
        saveIcon.style.display = 'inline';
    }
}

function saveStatus(saveIcon) {
    const row = saveIcon.closest('tr');

    // Payment Status
    const paymentStatusCell = row.querySelector('td:nth-child(6)');
    const paymentStatusText = paymentStatusCell.querySelector('.payment-status-text');
    const paymentStatusDropdown = paymentStatusCell.querySelector('.payment-status-dropdown');

    // Pickup Status
    const pickupStatusCell = row.querySelector('td:nth-child(7)');
    const pickupStatusText = pickupStatusCell.querySelector('.pickup-status-text');
    const pickupStatusDropdown = pickupStatusCell.querySelector('.pickup-status-dropdown');

    const editIcon = row.querySelector('.edit-icon');

    // Save the selected values
    const selectedPaymentStatus = paymentStatusDropdown.value;
    const selectedPickupStatus = pickupStatusDropdown.value;

    // Update text with selected values
    paymentStatusText.textContent = selectedPaymentStatus;
    pickupStatusText.textContent = selectedPickupStatus;

    // Switch back to display mode
    paymentStatusText.style.display = 'inline';
    paymentStatusDropdown.style.display = 'none';

    pickupStatusText.style.display = 'inline';
    pickupStatusDropdown.style.display = 'none';

    // Toggle icons
    saveIcon.style.display = 'none';
    editIcon.style.display = 'inline';
    }
    