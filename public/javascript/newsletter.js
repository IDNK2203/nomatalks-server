// FORM VALIDATION
let newsletter_form = document.querySelector(".newsletter-form");
let form__input = document.querySelector(".newsletter-form__input");

newsletter_form.addEventListener("submit", (e) => {
  if (!form__input.validity.valid) {
    check_input_validity(form__input);
  } else {
    fetch_shorten_url();
  }
  e.preventDefault();
});

let check_input_validity_nl = (field) => {
  let validity_value = field.validity.valid;
  let err_msg = field.parentElement.children[1];
  if (field.validity.valueMissing) {
    err_msg.textContent = `Please add a ${field.name}`;
  } else if (field.validity.typeMismatch) {
    err_msg.textContent = "Please input a valid email";
  }

  function display_err(value) {
    if (!value) {
      err_msg.style.display = "block";
    } else {
      err_msg.style.display = "none";
    }
  }
  display_err(validity_value);
};

form__input.addEventListener("input", (e) => {
  check_input_validity_nl(e.target);
});
