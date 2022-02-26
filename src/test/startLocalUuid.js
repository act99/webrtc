export const startLocalUuid = () => {
  function guid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  if (localStorage.getItem("uuid") === null) {
    localStorage.setItem("uuid", guid());
  }
  //   uuidInput.value = localStorage.getItem("uuid");
  console.log("local.uuid:" + localStorage.getItem("uuid"));
  // console.log("input.value:" + uuidInput.value);
};
