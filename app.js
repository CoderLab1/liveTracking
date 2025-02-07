const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
const locationUpdateThreshold = 0.0001;

io.on("connection", (socket) => {
    let lastLocation = null;
    console.log(`User connected: ${socket.id}`);

    socket.on("send-location", (data) => {
        const { latitude, longitude } = data;

        if (!lastLocation || Math.abs(latitude - lastLocation.latitude) > locationUpdateThreshold || Math.abs(longitude - lastLocation.longitude) > locationUpdateThreshold) {
            lastLocation = { latitude, longitude };
            io.emit("receive-location", { id: socket.id, latitude, longitude });
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        console.error("Error in GET / route:", error);
        res.status(500).send("Something went wrong.");
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port", process.env.PORT || 3000);
});
