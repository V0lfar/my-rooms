    const endSessionButton = document.getElementById('end-session-button');

    if (sessionStorage.getItem('username') && sessionStorage.getItem('password')) {
      endSessionButton.style.visibility = 'visible';
    } else {
      endSessionButton.style.visibility = 'hidden';
    }

    endSessionButton.addEventListener('click', function () {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('password');
      window.location.href = '/';
    });