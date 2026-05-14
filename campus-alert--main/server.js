// ===============================
// SMART CAMPUS ALERT SYSTEM
// SERVER.JS
// ===============================

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const twilio = require("twilio");

// ===============================
// CREATE EXPRESS APP
// ===============================

const app = express();

const server = http.createServer(app);

// ===============================
// SOCKET.IO SETUP
// ===============================

const io = socketIo(server, {

cors: {

origin: "*"

}

});

// ===============================
// PUBLIC FOLDER
// ===============================

app.use(express.static("public"));

// ===============================
// TWILIO CONFIGURATION
// ===============================

const accountSid =
process.env.TWILIO_ACCOUNT_SID;

const authToken =
process.env.TWILIO_AUTH_TOKEN;

const twilioNumber =
process.env.TWILIO_PHONE_NUMBER;

// ===============================
// TWILIO CLIENT
// ===============================

const client =
twilio(accountSid, authToken);

// ===============================
// REGISTERED STUDENT NUMBERS
// ===============================

const studentNumbers = [

"+917823846953",
"+918329259798"

// Add more numbers here

];

// ===============================
// SOCKET CONNECTION
// ===============================

io.on("connection", (socket) => {

console.log("🟢 User Connected");

// ===============================
// STUDENT SENDS REPORT
// ===============================

socket.on("studentReport", (msg) => {

console.log("🚨 Emergency Report:", msg);

// Send live report to security page

io.emit("newReport", msg);

socket.on("securityBroadcast", (msg) => {

console.log("Security Broadcast:", msg);

studentNumbers.forEach(number => {

client.messages.create({

body: msg,

from: "+16514002769",

to: number

})
.then(message => {

console.log("Broadcast SMS Sent:", message.sid);

})
.catch(error => {

console.log("Broadcast Error:", error);

});

});

});
});

// ===============================
// SECURITY APPROVES ALERT
// ===============================

socket.on("approveAlert", async (msg) => {

console.log("✅ Approved Alert:", msg);

// Notify all connected clients

io.emit("approvedAlert", msg);

// ===============================
// SEND SMS TO REGISTERED USERS
// ===============================

for (let number of studentNumbers) {

try {

const message =
await client.messages.create({

body:
"🚨 CAMPUS EMERGENCY ALERT 🚨\n\n" + msg,

from: twilioNumber,

to: number

});

console.log(
"✅ SMS Sent:",
message.sid
);

} catch (error) {

console.log(
"❌ SMS Error:",
error.message
);

}

}

});

// ===============================
// SECURITY DISMISSES ALERT
// ===============================

socket.on("dismissAlert", (msg) => {

console.log("❌ Alert Dismissed:", msg);

io.emit("alertDismissed", msg);

});

// ===============================
// USER DISCONNECTED
// ===============================

socket.on("disconnect", () => {

console.log("🔴 User Disconnected");

});

});

// ===============================
// ROUTES
// ===============================

// Student Page

app.get("/", (req, res) => {

res.sendFile(
__dirname + "/public/student.html"
);

});

// Security Page

app.get("/security", (req, res) => {

res.sendFile(
__dirname + "/public/security.html"
);

});

// ===============================
// START SERVER
// ===============================

const PORT =
process.env.PORT || 3000;

server.listen(PORT, () => {

console.log(
"Server Running On Port" +PORT);

});