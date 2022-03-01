import React from "react";

const Login = () => {
  const inputRef1 = React.useRef();
  const inputRef2 = React.useRef();
  const submitHandler = (event) => {
    event.preventDefault();
    const id = inputRef1.current.value;
    const password = inputRef2.current.value;
    console.log(id, password);
  };
  return (
    <div>
      <form onSubmit={submitHandler}>
        <input ref={inputRef1} />
        <input ref={inputRef2} />
        <button type="submit">버튼</button>
      </form>
    </div>
  );
};

export default Login;
