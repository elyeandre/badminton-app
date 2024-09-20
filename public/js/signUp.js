function showSignUpForm(type) {
    if (type === 'courtOwner') {
        document.getElementById('courtOwnerFormContainer').style.display = 'block';
        document.getElementById('userFormContainer').style.display = 'none';
    } else {
        document.getElementById('courtOwnerFormContainer').style.display = 'none';
        document.getElementById('userFormContainer').style.display = 'block';
    }
}

function hideSignupForm() {
    document.getElementById('courtOwnerFormContainer').style.display = 'none';
    document.getElementById('userFormContainer').style.display = 'none';
}