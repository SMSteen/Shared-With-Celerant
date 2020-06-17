$(".container.no-banner.checkout-section").ready(function () {
	// hiding blank matrix options (no size, no color) to mirror cart functionality
	$(".checkout-section .cart-item-info .ch4_cartItemOption").each(
		function () {
			if ($(this).html().trim().endsWith("&nbsp;")) {
				$(this).css("display", "none");
			}
		}
	);

	// add a heading for login section (for returning customers) for design consistency
	$(".loginCheckout > .col-md-6.log > p").before("<h3>Returning Customers</h3>");
	// adjust field type to be mobile friendly
	$(".loginCheckout > .col-md-6.log #login #Email").attr("type", "email");
	// correcting typo (remove space between password and ?)
	$(".checkout-section form#login a").text("Forgot Password?");
	// rewording "register new account" heading to remove word register and make it more inviting/personal
	$(".col-md-6.login-right h3").each(function () {
		if ($(this).text().toLowerCase() == "register a new account") {
			$(this).text("New Customers");
		}
		$(this).text($(this).text().toLowerCase());
	});
	// restructuring "by creating an acct..." paragraph
	let acctBenefits = `
            <p>By creating an account, you will be able to:</p>
            <ul>
                <li>Checkout faster.</li>
                <li>Store multiple addresses.</li>
                <li>View and track orders.</li>
            </ul>
        `;
	$(".loginCheckout .col-md-6.login-right p").html(acctBenefits);
	// rewording button to remove word register, make it more inviting/personal and more explicit to what action will happen
	$("div.login-right > a.acount-btn:first-of-type").text("Create My Account");

	// restructure registration form
	formatFields("#registrationform ul");
	// restructure billing/shipping form fields
	formatFields(".checkout-section .updateBilling > .infoInput:not(:last-of-type)");
	formatFields(".checkout-section .checkout-shipping .ShowBillingTBL > .infoInput:not(.buttonwrapper)");

	// toggle company field to show/hide
	$(".show-company").on("click", function () {
		$(".hide-company").slideToggle();
		return false;
	});

	// align billing & shipping forms so same fields are side by side
	if (
		$("#CFForm_1").length &&
		$("#CFForm_2").length &&
		$(window).width() >= 768
	) {
		let bfpleft = $("#CFForm_1 #First_Name").parent().offset().left;
		let bfptop = $("#CFForm_2 #First_Name").parent().offset().top;
		$(".updateBilling").offset({
			top: bfptop,
			left: bfpleft,
		});
	}

	// move the phone number field to follow email (before password fields)
	if ($("#password").length) {
		$("#Email").parent().after($("#PHONE1").parent());
	}

	// inline form field validation
	$(`.checkout-section #registrationform, .checkout-section .checkout-billing form#CFForm_1, .checkout-section .checkout-shipping form#CFForm_2`
	).on("blur", ".form-group input", function () {
		validateField($(this).attr("id"), $(this).closest("form").attr("id"));
	});

	// formatting shipping options
	if ($("#checkout-step4").length || $("#shipping-choices").length == 0) {
		formatShipping();
	}
	// inline validation for shipping options
	if (".pay-now-btn > .ShowHand".length) {
		$(".pay-now-btn > .ShowHand").attr("onclick", "validateShipping();");
		$(".pay-now-btn button").unbind("click");
	}
});

// format general form fields to utilize bootstrap validation states
function formatFields(selector) {
	let label;
	let field;
	let fieldID;

	$(`${selector}`).each(function () {
		if (selector == "#registrationform ul") {
			label = $(this).children(".text-info").text().trim();
			field = $(this).children("li:nth-of-type(2)").html();
			fieldID = $(this)
				.children("li:nth-of-type(2)")
				.children("input, select")
				.attr("name");
		} else {
			label = $(this).children("p").text().trim();
			field = $(this).children("div").html();
			fieldID = $(this)
				.children("div")
				.children("input, select")
				.attr("name");
		}

		if (fieldID == "Company") {
			let companyLink = `<button class="show-company btn btn-link" role="link">Add a Company Name</button>`;
			if ($(`#${fieldID}`).val()) { // if company null, add company; else view company
				companyLink = `<button class="show-company btn btn-link" role="link">Edit Company Name</button>`;
			}

			$(this).replaceWith(`
				${companyLink}
				<div class="form-group hide-company">
					<label for="${fieldID}">${label} (optional)</label>
					${field}
				</div>		
			`);
			$(`#${fieldID}`).addClass("form-control");
			$(`#${fieldID}`).attr("aria-required", "false");
		} else {
			$(this).replaceWith(`
				<div class="form-group field-${fieldID}">
					<label for="${fieldID}">${label}</label>
					${field}
					<p class="help-block" id="${fieldID}Help"></p>
				</div>
			`);
			$(`#${fieldID}, select[name="state"]`).addClass("form-control");
			$(`#${fieldID}, select[name="state"]`).attr(
				"aria-required",
				"true"
			);
			$(`${fieldID}`).attr("aria-describedby", `${fieldID}Help`);
		}
	});

	// // adjust field types to be mobile friendly, add help blocks, tweak microcopy
	$("input#Email").attr("type", "email");
	$("input#Email + .help-block").text(`We'll send your order confirmation to this email address.`);
	$("input#Zip").attr("type", "number");
	$("input#PHONE1").attr("type", "tel");
	$("input#PHONE1 + .help-block").text(`In case we have questions about your order.`);
	$(".checkout-section #checkout-step2 input#registerButton").val("Continue to Shipping");
}

// format radio buttons to utilize bootstrap validation states
function formatShipping() {
	let payNowBtn = $("#checkout-step4 ul").children(":not(li)").html();
	let optionsHTML = ``;
	$("#checkout-step4 ul li").each(function () {
		// get the label text only
		let label = $(this)
			.children("label")
			.clone()
			.children()
			.remove()
			.end()
			.text();
		// get the input only
		const regex = /(<[input].+?>)/;
		const inputStr = $(this).children("label").html();
		const match = inputStr.match(regex);
		let field = inputStr.match(regex)[1];
		let fieldID = $(this).children("label").children("input").attr("id");
		optionsHTML += `
			<div onclick="selectRadio('${fieldID}');">
				${field}
				<label for="${fieldID}">${label.trim()}</label>
			</div>
		`;
	});

	$("#checkout-step4 ul").replaceWith(`
		<fieldset id="shipping-choices" aria-required="true">
			<legend>Please select a shipping option.</legend>
			${optionsHTML}
		</fieldset>
	`);
	if (payNowBtn) {
		$("#shipping-choices").after(payNowBtn);
	}
}

// Validate individual form fields
function validateField(field, form) {
	let fieldValue = $(`#${form} #${field}`).val().trim();

	// all possible error messages
	const errorMessages = {
		FirstNameBlank: "Please enter your first name.",
		First_NameBlank:
			form == "CFForm_2"
				? "Please enter recipient's first name."
				: "Please enter your first name.",
		LastNameBlank: "Please enter your last name.",
		Last_NameBlank:
			form == "CFForm_2"
				? "Please enter recipient's last name."
				: "Please enter your last name.",
		address1Blank: "Please enter your billing address.",
		Address1Blank:
			form == "CFForm_2"
				? "Please enter the shipping address."
				: "Please enter your billing address.",
		CityBlank:
			form == "CFForm_2"
				? "Please enter the shipping city."
				: "Please enter your billing city.",
		stateBlank: "Please select your billing state.",
		ZipBlank:
			form == "CFForm_2"
				? "Please enter the shipping zip code."
				: "Please enter your billing zip code.",
		EmailBlank:
			"Please enter the email address we should send your order confirmation to.",
		PHONE1Blank:
			"Please provide a phone number we may reach you at just in case we have questions.",
		EmailBadFormat:
			"Please enter your email address in the following format: someone@example.com",
		PHONE1BadFormat:
			"Please enter your 10-digit phone number. You just need to enter the digits, we'll format it for you.",
		passwordBlank:
			"Please enter a password. Any 6 or more characters you can remember will do the trick.",
		passwordChkBlank: "Please confirm your password.",
		passwordChkNoMatch:
			"The password you entered does not match. Please try again.",
	};
	// the error, errorMessage we will return
	let error;
	let theErrorMessage;
	
	// pattern matching for emails, phone numbers
	const EMAIL_REGEX = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$/;
	const PHONE_REGEX = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
	
	// determine which regex to test
	let regexApplied;
	if (field == "email" || field == "Email") {
		regexApplied = EMAIL_REGEX;
	} else if (field == "phone" || field == "PHONE1") {
		regexApplied = PHONE_REGEX;
	}

	// now test the field for blanks and/or against the regex
	if (fieldValue === "") { // if blank
		theErrorMessage = field + "Blank";
		error = errorMessages[theErrorMessage];
	} else {
		if (field == "passwordChk") { // confirm password match
			let compare = $("#password").val();
			if (fieldValue != compare) {
				theErrorMessage = field + "NoMatch";
				error = errorMessages[theErrorMessage];
			}
		}
		if (regexApplied) { // email/phone format
			if (!regexApplied.test(fieldValue)) {
				theErrorMessage = field + "BadFormat";
				error = errorMessages[theErrorMessage];
			}
		}
	}

	// if failed validation, display & return error
	if (error) {
		$(`#${form} #${field}`).parent().addClass("has-error");
		$(`#${form} #${field}`).parent().removeClass("has-success");
		$(`#${form} #${field}`).attr("aria-invalid", "true");
		$(`#${form} #${field}`).siblings(".help-block").text(error);
		return error;
	} else {
		$(`#${form} #${field}`).parent().addClass("has-success");
		$(`#${form} #${field}`).parent().removeClass("has-error");
		$(`#${form} #${field}`).attr("aria-invalid", "false");
		$(`#${form} #${field}`).siblings(".help-block").text("");
	}
}

// helper function to determine if value is null/undefined
function hasValue(value) {
	return value !== undefined && value !== "" ? value : false;
}

// Validate shipping option selection
function validateShipping() {
	if (!$("input[name='shipotp']:checked").val()) {
		$("#shipping-choices legend").text("Please select your preferred shipping method.");
		$("#shipping-choices legend").attr("has-error");
		$("#shipping-choices legend").show();
	} else {
		checkAddress();
		selectShipping();
		$("#shipping-choices legend").attr("has-success");
		$("#shipping-choices legend").hide();
	}
}
