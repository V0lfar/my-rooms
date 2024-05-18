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
        // Show the modal
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        span.onclick = function() {
          modal.style.display = "none";
        }
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
        return;
      }
      roomCodeInput.style.borderColor = '';
      window.location.href = 'myroom/' + roomCode;
    })
    .catch(error => {
      console.error('Not able to check room existence:', error);
    });
}