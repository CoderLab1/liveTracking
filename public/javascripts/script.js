const socket = io();

function sendLocation(position) {
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", { latitude, longitude });
}

function handleLocationError(error) {}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(sendLocation, handleLocationError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (id === socket.id) {
        updateOwnLocation(latitude, longitude);
    } else {
        updateOtherUserLocation(id, latitude, longitude);
    }
});

function updateOwnLocation(latitude, longitude) {
    if (ownMarker) {
        ownMarker.setLatLng([latitude, longitude]);
    } else {
        ownMarker = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], 16);
}

function updateOtherUserLocation(id, latitude, longitude) {
    if (!userMarkers[id]) {
        userMarkers[id] = L.marker([latitude, longitude]).addTo(map);
    } else {
        userMarkers[id].setLatLng([latitude, longitude]);
    }
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const userMarkers = {};
let ownMarker = null;
