window.redirectToRoom = function() {
  var roomCodeInput = document.getElementById('room-code');
  var roomCode = roomCodeInput.value;
  if (roomCode.trim() === '') {
    roomCodeInput.style.borderColor = 'lightcoral';
    return;
  }
  // Check if room exists
  fetch('http://localhost:8080/rooms/' + roomCode + '/exist')
    .then(response => response.json())
    .then(roomExists => {
      if (!roomExists) {
        roomCodeInput.style.borderColor = 'lightcoral';
        alert('Room does not exist.');
        return;
      }
      roomCodeInput.style.borderColor = '';
      window.location.href = 'myroom/' + roomCode;
    })
    .catch(error => {
      console.error('Not able to check room existence:', error);
    });
}