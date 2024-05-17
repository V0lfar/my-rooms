export async function loadRooms() {
  return await fetch('http://localhost:8080/rooms')
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
        roomTile.onclick = () => openRoom(room.id);

        const roomImage = document.createElement('div');
        roomImage.className = 'room-image';
        roomImage.style.backgroundImage = 'resources/images/virtualRoomDefaultIcon.pdf';
        roomTile.appendChild(roomImage);

        const roomName = document.createElement('div');
        roomName.className = 'room-name';
        roomName.textContent = room.title;
        roomTile.appendChild(roomName);

        roomsContainer.appendChild(roomTile);
      });
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}