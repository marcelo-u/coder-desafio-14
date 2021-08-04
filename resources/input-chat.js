//const socketchat = io();
const messages = document.querySelector("#messages");
const sendBtn = document.querySelector("#send");
const messageTxt = document.querySelector("#chat-message");
const emailTxt = document.querySelector("#chat-email");

socket.on("chat:messages", (data) => {
  messages.innerHTML = "";
  data.forEach(
    (msg) =>
      (messages.innerHTML += `<p><strong style="color:blue"> ${msg.email} </strong><span style="color:brown"> ${msg.date} </span><span style="color:green"> ${msg.message} </span></p>`)
  );
});

sendBtn.addEventListener("click", () => {
  if (emailTxt.value !== "" && messageTxt !== "") {
    const data = {
      email: emailTxt.value,
      message: messageTxt.value,
    };
    socket.emit("chat:new-message", data);
  }
});
