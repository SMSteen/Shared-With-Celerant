// attempt to salvage checkout page and make it as user friendly as possible within limitations of current templates provided
// code written by Shannon Steen/Polly Designs

// By Phil - 09/09/2020 
//Resolving Juqery Conflict

var js = jQuery.noConflict();

js(".container.no-banner.checkout-section").ready(function ($) {
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
    $(".col-md-6.login-right h3").each(function ($) {
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

    // open/collapse billing/shipping forms post entry
    $("#checkout-step2 h5 > button").on("click", function () {
        $(this).parent().siblings(".address-block").slideToggle();
        let showForm = $(this).attr("data-show");
        $(`#${showForm}`).toggle();
        // alignForms();
    });

    // validate all entries of initial "registration" form; needed to make email address required
    $("#registerButton").on("click", function (e) {
        e.preventDefault();
        let selector = $(this).parent("form").attr("id");
        let formHasErrors = validateForm(selector)
        if (formHasErrors) {
            alert("Please correct any errors reflected in red.");
        } else {
            $(`#${selector}`).submit();
        }
    })
});

// determine which shipping option chosen
js("#shipping-choices").ready(function ($) {
    js("#shipping-choices label")
        .off("click")
        .on("click", function () {
            let choice = js(this).text();
            showShippingInTotal(choice);
            js("#shipping-choices legend").attr("has-success");
            js("#shipping-choices legend").hide();
        });
});

// format general form fields to utilize bootstrap validation states
function formatFields(selector) {
    let label;
    let field;
    let fieldID;

    js(`${selector}`).each(function ($) {
        if (selector == "#registrationform ul") {
            label = js(this).children(".text-info").text().trim();
            field = js(this).children("li:nth-of-type(2)").html();
            fieldID = js(this)
                .children("li:nth-of-type(2)")
                .children("input, select")
                .attr("name");
        } else {
            label = js(this).children("p").text().trim();
            field = js(this).children("div").html();
            fieldID = js(this)
                .children("div")
                .children("input, select")
                .attr("name");
        }
        if (fieldID == "Company") {
            let coOption = "Add"
            if (js(`#${fieldID}`).val()) {
                // if company null, add company; else view company
                coOption = "Edit";
            }
            let companyLink = `<button class="show-company btn btn-link" role="link">${coOption} a Company Name</button>`;

            js(this).replaceWith(`
				${companyLink}
				<div class="form-group hide-company">
					<label for="${fieldID}">${label} (optional)</label>
                    ${field}
                    <p class="help-block" id="${fieldID}Help"></p>
				</div>		
			`);
            js(`#${fieldID}`).addClass("form-control");
            js(`#${fieldID}`).attr("aria-required", "false");
        } else {
            js(this).replaceWith(`
				<div class="form-group field-${fieldID}">
					<label for="${fieldID}">${label}</label>
					${field}
					<p class="help-block" id="${fieldID}Help"></p>
				</div>
			`);
            js(`#${fieldID}, select[name="state"]`).addClass("form-control");
            js(`#${fieldID}, select[name="state"]`).attr(
                "aria-required",
                "true"
            );
            js(`#${fieldID}`).attr("aria-describedby", `${fieldID}Help`);
        }
    });

    // // adjust field types to be mobile friendly, add help blocks, tweak microcopy
    js("input#Email").attr("type", "email");
    js("input#Email + .help-block").text(
        `We'll send your order confirmation to this email address.`
    );
    js("input#Zip").attr({
        inputmode: "numeric",
        pattern: "\\d{5}(?:[-\\s]\\d{4})?",
    });
    js("input#PHONE1").attr("type", "tel");
    js("input#PHONE1 + .help-block").text(
        `In case we have questions about your order.`
    );
    js(".checkout-section #checkout-step2 input#registerButton").val(
        "Continue to Shipping"
    );
}

// format radio buttons to utilize bootstrap validation states
function formatShipping() {
    let payNowBtn = js("#checkout-step4 ul")
        .children("div.billingUpdateButton")
        .html();
    let optionsHTML = ``;
    js("#checkout-step4 ul li").each(function ($) {
        // get the label text only
        let label = js(this)
            .children("label")
            .clone()
            .children()
            .remove()
            .end()
            .text();
        // get the input only
        const regex = /(<[input].+?>)/;
        const inputStr = js(this).children("label").html();
        const match = inputStr.match(regex);
        let field = inputStr.match(regex)[1];
        let fieldID = js(this).children("label").children("input").attr("id");
        optionsHTML += `
			<div>
				${field}
				<label for="${fieldID}">${label.trim()}</label>
			</div>
        `;
    });

    js("#checkout-step4 ul").replaceWith(`
		<fieldset id="shipping-choices" aria-required="true">
			<legend>Please select a shipping option.</legend>
			${optionsHTML}
		</fieldset>
	`);
    if (payNowBtn) {
        js("#shipping-choices").after(payNowBtn);
        // overriding checkout.js checkAddress IIFE
        js(".pay-now-btn").show();
    }
}

// Validate individual form fields
function validateField(field, form) {
    let fieldValue = js(`#${form} #${field}`).val().trim();

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
            let compare = js("#password").val();
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
        js(`#${form} #${field}`).parent().addClass("has-error");
        js(`#${form} #${field}`).parent().removeClass("has-success");
        js(`#${form} #${field}`).attr("aria-invalid", "true");
        js(`#${form} #${field}`).siblings(".help-block").text(error);
        return error;
    } else {
        js(`#${form} #${field}`).parent().addClass("has-success");
        js(`#${form} #${field}`).parent().removeClass("has-error");
        js(`#${form} #${field}`).attr("aria-invalid", "false");
        js(`#${form} #${field}`).siblings(".help-block").text("");
    }
}

// validate entire form (in the event user does not touch each form field individually)
function validateForm(selector) {
    let formHasErrors = false;
    let action = js(`#${selector}`).attr("action");
    js(`#${selector} .form-group input:not(#Company)`).each(function () {
        validateField(js(this).attr("id"), js(this).closest("form").attr("id"));
        if (!js(this).val().length) {
            formHasErrors = true;
        }
    });
    return formHasErrors;
}

// helper function to determine if value is null/undefined
function hasValue(value) {
    return value !== undefined && value !== "" ? value : false;
}

// new function to override checkout.js checkAddress IIFE so only called when invoked
function checkAddressReplacement() {
    let formHasErrors = false;
    js(
        "#CFForm_1 input:not(#Company), #CFForm_1 select, #CFForm_2 input:not(#Company), #CFForm_2 select"
    ).each(function () {
        if (!js(this).val().length) {
            formHasErrors = true;
        }
    });
    formHasErrors ? alert("Please correct any errors reflected in red.") : proceedToPay();
}

// put this on click of pay now button
// Validate shipping option selection
function validateShipping() {
    if (!js("input[name='shipotp']:checked").val()) {
        js("#shipping-choices legend").text(
            "Please select your preferred shipping method."
        );
        js("#shipping-choices legend").attr("has-error");
        js("#shipping-choices legend").show();
    } else {
        // overriding checkout.js checkAddress IIFE
        checkAddressReplacement();
        js("#shipping-choices legend").attr("has-success");
        js("#shipping-choices legend").hide();
    }
}

// Include shipping amount in Grand Total on user selection
function showShippingInTotal(selection) {
    // get all amts needed for calculation
    let subTotalAmt = stripCharacters(
        js("#checkout-step5 .price-details .subtotal").text()
    );
    let taxAmt = stripCharacters(js("#checkout-step5 .price-details .tax").text());
    let shipAmt = stripCharacters(selection);

    // calculate
    let grandTotal = (subTotalAmt + taxAmt + shipAmt).toFixed(2);

    // convert figures back to decimals & display on site
    taxAmt = taxAmt.toFixed(2);
    shipAmt = shipAmt.toFixed(2);
    js("#checkout-step5 .price-details .tax").text(`$${taxAmt}`);
    js("#checkout-step5 .price-details .shipping").text(`$${shipAmt}`);
    js("#checkout-step5 .price-details .grand-total").text(`$${grandTotal}`);
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
    let currentShippingID = js(".shipotp:checked").val();
    if (currentShippingID) {
        window.location='/cartcheckout.cfm?ship_method_id='+currentShippingID+'+#step7';
    } else {
        alert("Please select a shipping method!");
    }
}

// add "checked" class to Shipping options once section is complete
js("#checkout-step6").ready(function ($) {
    if (js("a[href='#step7'").length) {
        js("#checkout-step4 .checkout-header").html(
            "Shipping Options <span class='checked'></span>"
        );

    }
});