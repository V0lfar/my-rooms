export async function login(name, inputPassword) {
    // Hash the password
    const password = await hashPassword(inputPassword);

    return new Promise((resolve, reject) => {
        fetch('http://localhost:8080/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data === true) {
                    // The credentials are correct, store them in the session
                    sessionStorage.setItem('username', name);
                    sessionStorage.setItem('password', password);
                    resolve();
                } else {
                    reject(new Error('Invalid login credentials'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hash = await window.crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}