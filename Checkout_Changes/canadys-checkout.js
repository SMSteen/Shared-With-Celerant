// attempt to salvage checkout page and make it as user friendly as possible within limitations of current templates provided
// code written by Shannon Steen/Polly Designs

$(".container.no-banner.checkout-section").ready(function () {
	// hiding blank matrix options (no size, no color) to mirror cart functionality
	$(".checkout-section .cart-item-info .ch4_cartItemOption").each(
		function () {
			if ($(this).html().trim().endsWith("&nbsp;")) {
				$(this).css("display", "none");
			}
		}
	);

	// reorder the "Order Details" section so subtotal comes FIRST
    if ($("#checkout-step5 .price-details").length) {
		let taxAmt = $(
			"#checkout-step5 .price-details span:nth-of-type(2)"
		).text();
		let shippingAmt = $(
			"#checkout-step5 .price-details span:nth-of-type(4)"
		).text();
		let subTotalAmt = $(
			"#checkout-step5 .price-details span:nth-of-type(6)"
		).text();
		let totalAmt = $(
			"#checkout-step5 .price-details span:nth-of-type(8)"
		).text();

		let redoHTML = `
            <p>Subtotal <span class="subtotal">${subTotalAmt}</span></p>
            <p>Taxes <span class="tax">${taxAmt}</span></p>
            <p>Shipping <span class="shipping">${shippingAmt}</span></p>
            <p>Total <span class="grand-total">${totalAmt}</span></p>	                    
        `;
        $(".price-details").html(redoHTML);
        
        showShippingInTotal(shippingAmt);
	}

    // move the "Order Details" section to under cart contents
    $("#checkout-step5").insertAfter($(".checkout-section .right-container section"))

	// add a heading for login section (for returning customers) for design consistency
	$(".loginCheckout > .col-md-6.log > p").before(
		"<h3>Returning Customers</h3>"
	);

	// adjust field type to be mobile friendly
	$(".loginCheckout > .col-md-6.log #login #Email").attr("type", "email");

	// correcting typo (remove space between password and ?)
	$(
		".checkout-section form#login a, .my_account form#login a:last-child"
	).text("Forgot Password?");

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

	// restructure registration form fields
	formatFields("#registrationform ul");

	// restructure billing/shipping form fields
	formatFields(
		".checkout-section .updateBilling > .infoInput:not(:last-of-type)"
	);
	formatFields(
		".checkout-section .checkout-shipping .ShowBillingTBL > .infoInput:not(.buttonwrapper)"
	);

	// toggle company field to show/hide
	$(".show-company").on("click", function () {
		$(".hide-company").slideToggle();
		return false;
	});
    // if billing & shipping address showing
    if ($("#CFForm_1").length && $("#CFForm_2").length) {
        // display previously entered data with option to edit
		let billingAddress = `
            <div class="address-block">
                <p>${$("#CFForm_1 #First_Name").val()} ${$(
			"#CFForm_1 #Last_Name"
		).val()}</p>
                <p>${$("#CFForm_1 #Address1").val()}</p>
                <p>${$("#CFForm_1 #City").val()}, ${$(
			"#CFForm_1 select"
		).val()}  ${$("#CFForm_1 #Zip").val()}</p>
            </div>
        `;
		$(".checkout-billing h5").after(billingAddress);
		$(".checkout-billing h5").html(
			"Billing Address<button class='btn btn-link' role='link' data-show='CFForm_1'>Edit</button>"
		);
		$("#CFForm_1").css("display", "none");
		let shippingAddress = `
            <div class="address-block">
                <p>${$("#CFForm_2 #First_Name").val()} ${$(
			"#CFForm_2 #Last_Name"
		).val()}</p>
                <p>${$("#CFForm_2 #Address1").val()}</p>
                <p>${$("#CFForm_2 #City").val()}, ${$(
			"#CFForm_2 select"
		).val()}  ${$("#CFForm_2 #Zip").val()}</p>
            </div>
        `;
		$(".checkout-shipping h5").after(shippingAddress);
		$(".checkout-shipping h5").html(
			"Shipping Address<button class='btn btn-link' role='link' data-show='CFForm_2'>Edit</button>"
		);
        $("#CFForm_2").css("display", "none");
	}

	// move the phone number field to follow email (before password fields)
	if ($("#password").length) {
		$("#Email").parent().after($("#PHONE1").parent());
	}

	// inline form field validation
	$(
		`.checkout-section #registrationform, .checkout-section .checkout-billing form#CFForm_1, .checkout-section .checkout-shipping form#CFForm_2`
	).on("blur", ".form-group input", function () {
		validateField($(this).attr("id"), $(this).closest("form").attr("id"));
	});
	$(`.registration-form #registrationform .form-group input`).blur(
		function () {
			validateField(
				$(this).attr("id"),
				$(this).closest("form").attr("id")
			);
		}
	);

	// formatting shipping options
	if ($("#checkout-step4").length || $("#shipping-choices").length == 0) {
		formatShipping();
	}

	// inline validation for shipping options
	if (".pay-now-btn > .ShowHand".length) {
		$(".pay-now-btn > .ShowHand").attr("onclick", "validateShipping();");
		$(".pay-now-btn button").unbind("click");
    }
    
    $("#checkout-step2 h5 > button").on("click", function () {
		console.log("edit billing/shipping got clicked");
		$(this).parent().siblings(".address-block").slideToggle();
		let showForm = $(this).attr("data-show");
		$(`#${showForm}`).toggle();
		// alignForms();
	});
});

// determine which shipping option chosen
$("#shipping-choices").ready(function () {
    $("#shipping-choices label")
        .off("click")
        .on("click", function () {
            let choice = $(this).text();
            showShippingInTotal(choice);
            $("#shipping-choices legend").attr("has-success");
            $("#shipping-choices legend").hide();
        });
})

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
			if ($(`#${fieldID}`).val()) {
				// if company null, add company; else view company
				companyLink = `<button class="show-company btn btn-link" role="link">Edit Company Name</button>`;
			}

			$(this).replaceWith(`
				${companyLink}
				<div class="form-group hide-company">
					<label for="${fieldID}">${label} (optional)</label>
                    ${field}
                    <p class="help-block" id="${fieldID}Help"></p>
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
			$(`#${fieldID}`).attr("aria-describedby", `${fieldID}Help`);
		}
	});

	// // adjust field types to be mobile friendly, add help blocks, tweak microcopy
	$("input#Email").attr("type", "email");
	$("input#Email + .help-block").text(
		`We'll send your order confirmation to this email address.`
	);
    $("input#Zip").attr({
		inputmode: "numeric",
		pattern: "\\d{5}(?:[-\\s]\\d${4})?",
	});
	$("input#PHONE1").attr("type", "tel");
	$("input#PHONE1 + .help-block").text(
		`In case we have questions about your order.`
	);
	$(".checkout-section #checkout-step2 input#registerButton").val(
		"Continue to Shipping"
	);
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
			<div>
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
			form == "registrationform"
				? "Please enter your email address"
				: "Please enter the email address we should send your order confirmation to.",
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
	if (fieldValue === "") {
		// if blank
		theErrorMessage = field + "Blank";
		error = errorMessages[theErrorMessage];
	} else {
		if (field == "passwordChk") {
			// confirm password match
			let compare = $("#password").val();
			if (fieldValue != compare) {
				theErrorMessage = field + "NoMatch";
				error = errorMessages[theErrorMessage];
			}
		}
		if (regexApplied) {
			// email/phone format
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
		$("#shipping-choices legend").text(
			"Please select your preferred shipping method."
		);
		$("#shipping-choices legend").attr("has-error");
		$("#shipping-choices legend").show();
	} else {
		checkAddress();
        // selectShipping();
        proceedToPay();
		$("#shipping-choices legend").attr("has-success");
		$("#shipping-choices legend").hide();
	}
}

// Include shipping amount in Grand Total on user selection
function showShippingInTotal(selection) {
    console.log(selection)
    // get all amts needed for calculation
    let subTotalAmt = stripCharacters(
        $("#checkout-step5 .price-details .subtotal").text()
    );
    let taxAmt = stripCharacters($("#checkout-step5 .price-details .tax").text());
    let shipAmt = stripCharacters(selection);
    
    // calculate
    let grandTotal = (subTotalAmt + taxAmt + shipAmt).toFixed(2);

    console.log("showshipping function", subTotalAmt, taxAmt, shipAmt, grandTotal)
    // convert figures back to decimals & display on site
    taxAmt = taxAmt.toFixed(2);
    shipAmt = shipAmt.toFixed(2);
    $("#checkout-step5 .price-details .tax").text(`$${taxAmt}`);
    $("#checkout-step5 .price-details .shipping").text(`$${shipAmt}`);
	$("#checkout-step5 .price-details .grand-total").text(`$${grandTotal}`);
}

// helper function to strip number as string down to floating number
function stripCharacters(val, desc) {
    let amt;
    let startIdx = val.indexOf("$") ? val.indexOf("$") : 0;
    let endIdx = val.indexOf(")");
    if (endIdx > 0) {
        amt = parseFloat(val.slice(startIdx + 1, endIdx));
    } else {
        amt = parseFloat(val.slice(startIdx + 1));  
    }
    return amt ? amt : 0; // if amt == 0 (NAN), return 0 otherwise return amt
}

// handle shipping selection after validated
function proceedToPay() {
	let currentShippingID = $(".shipotp:checked").val();
	if (currentShippingID) {
		window.location = "checkoutStep4Guest.html";
		// window.location='/cartcheckout.cfm?ship_method_id='+currentShippingID+'+#step7';
	} else {
		alert("Please select a shipping method!");
	}
}

$("#checkout-step6").ready(function () {
    if ($("a[href='#step7'").length) {
        console.log("we are showing payment iframe")
        // $("#checkout-step4").html("Shipping Options <span class='checked'></span>")
        $("#checkout-step4 .checkout-header").html(
            "Shipping Options <span class='checked'></span>"
        );
    
    }
})

// $("#checkout-step6").ready(function () {
//     if ($("a[href='#step7'").length) {
//         console.log("we are showing payment iframe")
//         // collapse billing form
//         $("#checkout-step2 .checkout-billing").prepend(
// 			`<button id="show-edit-billing" class="btn btn-link toggle-down" role="link">View/Edit Billing Address</button>`
// 		);
//         $("#checkout-step2 .checkout-billing div").css("display", "none");
//         $("#checkout-step2 .checkout-billing h5").css("display", "none");
        
//         // collapse shipping form
//         $("#checkout-step2 .checkout-shipping").prepend(
//             `<button id="show-edit-shipping" class="btn btn-link toggle-down" role="link">View/Edit Shipping Address</button>`
//         );
//         $("#checkout-step2 .checkout-shipping div").css("display", "none");
//         $("#checkout-step2 .checkout-shipping h5").css("display", "none");
//     }

//     $("#show-edit-billing").on("click", function () {
//         $("#checkout-step2 .checkout-billing div").slideToggle();
//         $("#show-edit-billing").removeClass("toggle-down");
//         $("#show-edit-billing").addClass("toggle-up");
//         return false;
//     })
//     $("#show-edit-shipping").on("click", function () {
//         $("#checkout-step2 .checkout-shipping div").slideToggle();
//         $("#show-edit-shipping").removeClass("toggle-down");
// 		$("#show-edit-shipping").addClass("toggle-up");        
//         return false;
//     });
// })


// $("#checkout-step2 .checkout-content").css("display", "none")
// $("#checkout-step2 .checkout-header").addClass("toggle-down");
// let heading = $("#checkout-step2 .checkout-header").text()
// $("#checkout-step2 .checkout-header").html(`View/Edit ${heading}<span class="checked"></span>`);




// DO NOT ADD TO LIVE CODE - TEMPORARY TO MIMIC WORLDPAY IFRAME
$("#tempIframeBtn").click(function () {
	window.location = "orderConfirmation.html";
});




// not yet working
// helper function to align billing/shipping forms evenly
function alignForms() {
    if (($("#CFForm_1").css("display") != "none") && ($("#CFForm_2").css("display") != "none")) {
        console.log("showing both forms")
		if ($(window).width() >= 768) {
			let bfpleft = $("#CFForm_1 #First_Name").parent().parent().offset().left;
            let bfptop = $("#CFForm_2 #First_Name").parent().offset().top;

            console.log(
                "bill left",
                $("#CFForm_1 #First_Name").parent().parent().offset().left,
                "ship left",
                $("#CFForm_2 #First_Name").parent().parent().offset().left
            );
            
            console.log(
                "bill top",
                $("#CFForm_1 #First_Name")
                    .parent()
                    .parent()
                    .offset().top,
                "ship top",
                $("#CFForm_2 #First_Name")
                    .parent()
                    .offset().top
            );

			$(".updateBilling").offset({
				top: bfptop,
				left: bfpleft,
            });
            
            console.log("updateBilling top", $(".updateBilling").offset().top)
		}
    }
}