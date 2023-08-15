import {
  headerLinkHandle,
  headerInputHandle,
  headerHamburgerHandle,
} from "./controllers/header.controller.js";

import { createUser, viewUserPage } from "./controllers/addUser.controller.js";

import { listUsers } from "../s3/viewUserData.js";

// Header Events
headerLinkHandle();
headerInputHandle();
headerHamburgerHandle();

// create User Events
createUser();
listUsers();

// view user page
viewUserPage();
