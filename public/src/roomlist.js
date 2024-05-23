export async function loadRooms(url) {
  return await fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(rooms => {
      const roomsContainer = document.querySelector('.rooms-container');
      roomsContainer.innerHTML = ''; // Clear the container

      rooms.forEach(room => {
        const roomTile = document.createElement('div');
        roomTile.className = 'room-tile';
        roomTile.onclick = () => openRoom(room.code);

        const roomImage = document.createElement('div');
        roomImage.className = 'room-image';
        roomImage.style.backgroundImage = `url(/resources/images/virtualRoomDefaultIcon.png)`;
        roomTile.appendChild(roomImage);

        const roomName = document.createElement('div');
        roomName.className = 'room-name';
        roomName.textContent = room.title;
        roomTile.appendChild(roomName);

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.onclick = (event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(room.code);
        };

        roomTile.appendChild(copyButton);

        if (sessionStorage.getItem('username') && sessionStorage.getItem('password')) {

          const removeButton = document.createElement('button');
          removeButton.className = 'remove-button';
          removeButton.onclick = (event) => {
            event.stopPropagation();
      
            const username = sessionStorage.getItem('username');
            const password = sessionStorage.getItem('password');
      
            fetch(`http://localhost:8080/rooms/${room.code}`, {
              method: 'DELETE',
              headers: {
                'Authorization': 'Basic ' + btoa(username + ":" + password)
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
      
              window.location.reload();
            })
            .catch(error => {
              console.error('Error:', error);
              window.location.href = '/error';
            });
          };
          roomTile.appendChild(removeButton);

        }
        roomsContainer.appendChild(roomTile);
      });
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      window.location.href = '/error';
    });
}

window.openRoom = function (roomCode) {
  window.location.href = 'http://localhost:3000/myroom/' + roomCode;
}

window.searchRooms = function () {
  const searchTerm = document.getElementById('search-query').value;
  const sortOption = document.getElementById('sort-option').value;
  let url = 'http://localhost:8080/rooms';
  let params = [];
  if (searchTerm) {
    params.push('term=' + encodeURIComponent(searchTerm));
  }
  if (sortOption) {
    params.push('sort=' + encodeURIComponent(sortOption));
  }
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  history.pushState(null, '', window.location.pathname + '?' + params.join('&'));
  loadRooms(url);
}