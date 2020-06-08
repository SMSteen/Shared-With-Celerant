let subTotal = 0;
let shipping = 0;
let taxes = 0;

$(function () {
	var showLogin = $("#showLogin");
	showLogin.click(function () {
		$(this).next().slideToggle();
		$(this).toggleClass("toggle-up toggle-down");
	});
});

$("#state").blur(function () {
	let state = $(this).val().toLowerCase();
	taxes = calcTaxes(state);
	sessionStorage.setItem("taxes", taxes);

	getTotal();
});

function getSubTotal() {
	$(".cart-item-info p span").each(function () {
		var itemValue = numberFromString($(this).text());
		let itemQty = numberFromString($(this).parent().next().text());

		subTotal += itemValue * itemQty;
	});
	sessionStorage.setItem("subtotal", subTotal);
	return subTotal;
}

function getShipping(id) {
	shipping = id == "shipotp_1" ? 0 : 5;
	sessionStorage.setItem("shipping", shipping);
	getTotal();
}

function calcTaxes(state) {
	subtotal = sessionStorage.getItem("subtotal")
		? numberFromString(sessionStorage.getItem("subtotal"))
		: getSubTotal();

	if (state == "nc") {
		return (taxes =
			Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100);
	}
}

function getTotal() {
	subtotal = sessionStorage.getItem("subtotal")
		? numberFromString(sessionStorage.getItem("subtotal"))
		: getSubTotal();

	taxes = sessionStorage.getItem("taxes")
		? numberFromString(sessionStorage.getItem("taxes"))
		: 0;

	shipping = sessionStorage.getItem("shipping")
		? numberFromString(sessionStorage.getItem("shipping"))
		: 0;

	let total = subtotal + shipping + taxes;
	console.log(
		"subtotal",
		subtotal,
		"taxes",
		taxes,
		"shipping",
		shipping,
		"total",
		total
	);

	$("#checkout-step5 p:nth-of-type(2) span").text(formatUSD(shipping));
	$("#checkout-step5 p:last-of-type span").text(formatUSD(taxes));
	$("#checkout-step5 h3 span").text(formatUSD(total));
}

function numberFromString(str) {
	return Number(str.replace(/[^0-9\.]+/g, ""));
}

// helper function to format currency
function formatUSD(value, decimalCount = 2, decimal = ".", thousands = ",") {
	if (isNaN(value)) {
		return value;
	}

	decimalCount = Math.abs(decimalCount);
	decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

	let i = parseInt(
		(value = Math.abs(Number(value) || 0).toFixed(decimalCount))
	).toString();
	let j = i.length > 3 ? i.length % 3 : 0;
	console.log(i, j);
	return (
		"$" +
		(j ? i.substr(0, j) + thousands : "") +
		i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
		(decimalCount
			? decimal +
			  Math.abs(value - i)
					.toFixed(decimalCount)
					.slice(2)
			: "")
	);
}

function validateField(field) {
	// all possible error messages
	const errorMessages = {
		FirstNameBlank: "Please enter your first name.",
		LastNameBlank: "Please enter your last name.",
		EmailBlank:
			"Please enter the email address we should send the quote to.",
		phoneBlank:
			"Please provide a phone number we may reach you at just in case we have questions.",
		EmailBadFormat:
			"Please enter your email address in the following format: someone@example.com",
		phoneBadFormat:
			"Please enter your 10-digit phone number. You just need to enter the digits, we'll format it for you.",
	};
	// pattern matching for emails, phone numbers
	const EMAIL_REGEX = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$/;
	const PHONE_REGEX = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
	// the error we will return
	let error;
	let theErrorMessage;
	// clean up the field value itself
	let fieldValue = $(`#${field}`).val().trim();

	// determine which regex to test
	let regexApplied;
	if (field == "Email") {
		regexApplied = EMAIL_REGEX;
	} else if (field == "phone") {
		regexApplied = PHONE_REGEX;
	}

	// now test the field for blanks and/or against the regex
	if (fieldValue === "") {
		theErrorMessage = field + "Blank";
		error = errorMessages[theErrorMessage];
	} else {
		if (regexApplied) {
			// field requires further validation
			if (!regexApplied.test(fieldValue)) {
				// test pattern match
				theErrorMessage = field + "BadFormat";
				error = errorMessages[theErrorMessage];
			}
		}
	}

	// if failed validation, display & return error
	if (error) {
		$(`form#contact-info #${field}`).addClass("invalid");
		$(`form#contact-info #${field}`).siblings('p').text(error);
		$(`form#contact-info #${field}`).siblings('p').show();
		return error;
	} else {
		$(`form#contact-info#${field}`).removeClass("invalid");
		$(`form#contact-info#${field}`).siblings('p').text("no errors");
		$(`form#contact-info#${field}`).siblings('p').hide();
	}
}

// save user inputs into session for temp use
$("form#contact-info").submit(function (e) {
	e.preventDefault();
	let formErrors = false;
	$("form#contact-info input:not([type='submit'])").each(function () {
		let field = $(this).attr("id");
		let error = validateField(field);
		if (error) {
			formErrors = true;
		} else {
			sessionStorage.setItem(field, document.getElementById(field).value);
		}
	});
	if (!formErrors) {
		window.location.assign(
			"checkoutShipping.html?u=new&checkouttype=EXPRESS#step2"
		);
	}
});

function validateShippingAddress(registrationForm) {
	console.log(registrationForm)
	let formErrors = false;
	$(
		".checkout-section form#registrationform input:not([type='submit'])"
	).each(function () {
		let field = $(this).attr("id");
		let error = validateField(field);
		if (error) {
			formErrors = true;
		} else {
			sessionStorage.setItem(
				field,
				document.getElementById(field).value
			);
		}
	});
	// if (!formErrors) {
	// 	window.location.assign(
	// 		"checkoutPayment.html?u=new&checkouttype=EXPRESS#step2"
	// 	);
	// }
}

$(".checkout-section #registrationform button").submit(function (e) {
	e.preventDefault();
	console.log("shipping form submitted");
	sessionStorage.setItem(
		"company",
		document.getElementById("Company Name").value
	);
	sessionStorage.setItem(
		"address",
		document.getElementById("address1").value
	);
	sessionStorage.setItem("city", document.getElementById("City").value);
	sessionStorage.setItem("state", document.getElementById("state").value);
	sessionStorage.setItem("zipcode", document.getElementById("Zip").value);
	if (!formErrors) {
		window.location.assign(
		"checkoutPayment.html?u=new&checkouttype=EXPRESS#step2"
		);
	}

});

$("#tempIframeBtn").click(function () {
	window.location.assign(
		"orderConfRev.html"
	);
})

