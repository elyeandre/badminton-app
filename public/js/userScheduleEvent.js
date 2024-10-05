function toggleHistoryTable() {
    const historyTable = document.getElementById("historyTable");
    historyTable.style.display = historyTable.style.display === "none" || historyTable.style.display === "" ? "block" : "none";
}

function goToReservationPage() {
    window.location.href = 'userScheduleReservation.html';
}

function goToTrainingPage() {
    window.location.href = 'userScheduleTraining.html';
}

function goToEventPage() {
    window.location.href = 'userScheduleEvent.html';
}

function goToTournamentPage() {
    window.location.href = 'userScheduleTournament.html';
}