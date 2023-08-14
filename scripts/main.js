import {
  headerLinkHandle,
  headerInputHandle,
  headerHamburgerHandle,
} from "./controllers/header.controller.js";

// Header Events
headerLinkHandle();
headerInputHandle();
headerHamburgerHandle();

const users = [];

const arr = {
  name: "user1",
  pn: "010-0000-0000",
  email: "user1@user1.com",
  nation: "Korea",
  picture: "./images/user.png",
};

const arr1 = {
  name: "user2",
  pn: "010-1000-0000",
  email: "user2@user2.com",
  nation: "Korea",
  picture: "./images/user.png",
};

users.push(arr);
users.push(arr1);

localStorage.setItem("users", JSON.stringify(users));
