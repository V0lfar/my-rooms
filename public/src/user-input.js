window.redirectToRoom = function() {
    var roomCodeInput = document.getElementById('room-code');
    var roomCode = roomCodeInput.value;
    if (roomCode.trim() === '') {
        roomCodeInput.style.borderColor = 'lightcoral';
      return;
    }
    // Check if room exists here
    // If room does not exist:
    // alert('Room does not exist.');
    // roomCodeInput.style.borderColor = 'lightcoral';
    // return;
    roomCodeInput.style.borderColor = ''; // Reset border color if room ID is valid
    window.location.href = 'myroom/' + roomCode;
  }