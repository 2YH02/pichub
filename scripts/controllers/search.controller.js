import { listSearchUsers } from "../../s3/viewUserData";

export function searchByUser() {
  const searchEls = document.querySelectorAll("header input");

  searchEls.forEach((searchEl) => {
    searchEl.addEventListener("change", async (e) => {
      let data = await getUserData();
      const filter = data.filter((v) => v.name.includes(e.target.value));
      // console.log(filter);
      listSearchUsers(filter);
    });
  });
}

function getUserData() {
  const userJson = import.meta.env.VITE_USER_JSON;
  return new Promise((res, rej) => {
    fetch(userJson)
      .then((res) => res.json())
      .then((data) => {
        res(data);
      })
      .catch((error) => {
        rej("Error:", error);
      });
  });
}
