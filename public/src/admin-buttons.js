    const endSessionButton = document.getElementById('end-session-button');
    const newRoomButton = document.getElementById('new-room-button');

    if (sessionStorage.getItem('username') && sessionStorage.getItem('password')) {
      if (endSessionButton) {
        endSessionButton.style.visibility = 'visible';
      }
      if (newRoomButton) {
        newRoomButton.style.visibility = 'visible';
      }
    } else {
      if (endSessionButton) {
        endSessionButton.style.visibility = 'hidden';
      }
      if (newRoomButton) {
        newRoomButton.style.visibility = 'hidden';
      }
    }
    endSessionButton.addEventListener('click', function () {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('password');
      window.location.href = '/';
    });