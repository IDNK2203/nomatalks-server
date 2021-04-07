// contact form
// hooks
let trial_form = document.querySelector(".contact-us-form");
let trial_form_input = Array.from(
  document.querySelectorAll(".contact-us-form__input")
);
let err_msg = Array.from(
  document.querySelectorAll(".contact-us-form__err-msg")
);

let textarea = document.querySelector(".contact-us-form__input--textarea");

textarea.value = "";
trial_form.addEventListener("submit", (e) => {
  trial_form_input.forEach((input) => {
    if (!input.validity.valid) {
      e.preventDefault();
      check_input_validity(input);
    }
  });
});

let check_input_validity = (field) => {
  let validity_value = field.validity.valid;
  let err_msg = field.parentElement.children[3];
  if (field.validity.valueMissing) {
    err_msg.textContent = `The field ${field.name} hasn't been filled yet`;
  } else if (field.validity.tooShort) {
    err_msg.textContent = `The feild ${field.name} should have at least ${field.minLength} characters; you have entered ${field.value.length}`;
  } else if (field.validity.typeMismatch) {
    err_msg.textContent = `The value entered in this field needs to be a ${field.type}`;
  } else if (field.validity.patternMismatch) {
    err_msg.textContent =
      "the set password value is not consistent with check password value";
  }

  function display_err(value) {
    value
      ? (err_msg.style.display = "none")
      : (err_msg.style.display = "block");
  }
  display_err(validity_value);
};

trial_form_input.forEach((input) => {
  input.addEventListener("input", () => {
    check_input_validity(input);
  });
});
