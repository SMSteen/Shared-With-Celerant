// CODE FOR PRODUCT PAGES

// // VERSION 1 - ADD A "VIEW" CTA BUTTON
// $('.category-products .productListing, #boat-cards li article').hover(
    
//     function () {
//         let linkPath = $(this).children('a').attr("href");
//         let newHTMLString = `
//             <div class="product-card-overlay">
//                 <a class="btn product-card__overlay-btn" href=${linkPath}>View</a>
//             </div>
//         `
//         $(this).append(newHTMLString)
//         $(this).find('.product-card-overlay').fadeIn(400);
//         },

//     function () {
//         $(".product-card-overlay").remove();
//     }
// )



// VERSION 2 - IF ITEM IS MATRIXED, ADD "SELECT OPTIONS" CTA BUTTON OTHERWISE ADD "ADD TO CART" CTA BUTTON
// $('.category-products .productListing, #boat-cards li article').hover(
//     function () {
//         let linkPath = $(this).children('a').attr("href");
//         let buttonText = "";
//         // console.log($(this).children('a').children().last().hasClass("matrixed-item"))

//         if ($(this).children('a').children().last().hasClass("matrixed-item")) {
//             buttonText = "Select Options"
//         } else {
//             buttonText = "Add to Cart"
//         }
//         let newHTMLString = `
//             <div class="product-card-overlay">
//                 <a class="btn product-card__overlay-btn" href=${linkPath}>${buttonText}</a>
//             </div>
//         `
//         $(this).append(newHTMLString)
//         $(this).find('.product-card-overlay').fadeIn(400);
//         },

//     function () {
//         $(".product-card-overlay").remove();
//     }
// )




// VERSION 3 - IF ITEM IS MATRIXED, ADD "SELECT OPTIONS" CTA BUTTON OTHERWISE ADD "ADD TO CART" CTA BUTTON & DISPLAY MODAL UPON CLICKING ADD TO CART
$(document).ready(function () {
    // create placeholder Modal for Add To Cart product overlay
    createAddToCartModal();
})

$('.category-products .category-product .productListing').hover(
    function () {
        // create object to store all product info needed for modal
        let productDetails = {};
        // get the product details path
        productDetails.linkPath = $(this).children('.product').attr("href");
        // get the productID from said path
        productDetails.productID = productDetails.linkPath.split("/")[2];
        // get the product image path
        productDetails.productImg = $(this).children('.product').children('.product-image').children('img').attr('src');
        // get the product name
        productDetails.productName = $(this).children('.product').children('.name').text().trim();
        // get the product price
        productDetails.productPrice = $(this).children('.product').children('.pricing').children('strong').text().trim();

        
        let buttonText = "";
        
        if ($(this).children('.product').children().last().hasClass("matrixed-item")) {
            // console.log('matrixed')
            buttonText = `<a class="btn product-card__overlay-btn" href=${productDetails.linkPath}>Select Options</a>`
        } else {
            buttonText = `
                <a class="btn product-card__overlay-btn" href=${productDetails.linkPath}>View Product</a>
                <button class="btn product-card__overlay-btn" id="addToCartNow">Add to Cart</button>
            `;

        }
        let newHTMLString = `
            <div class="product-card-overlay">
                ${buttonText}
            </div>
        `

        $('.category-products .productListing').append(newHTMLString)
        $('propduct-card-overlay')

        let overlayWidth = $(this).css('width');
        let overlayHeight = $(this).css('height');
        $('.product-card-overlay').css("width", overlayWidth);
        $('.product-card-overlay').css("height", overlayHeight);
        $(this).parent().find('.product-card-overlay').fadeIn(300);

        populateProductModal(productDetails);

        $(".product-card-overlay button").click(function () {
            $("#myProductModal").modal();
        })
    },

    function () {
        $(".product-card-overlay").remove();
    }
);


function createAddToCartModal() {
    let modalString = `
        <div class="modal fade" id="myProductModal" role="dialog">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img class="img-reponsive" src="" alt="image of product">
                        <h3>Name of Product</h3>
                        <h4>Price of Product USD</h4>
                        <form role="form">
                            <div class="form-group" name="addToCartForm" id="addToCartForm" action="/addtocart.cfm" method="post">
                                <label for="qty">Quantity</label>
                                <input type="number" class="form-control" id="qty" value="1">
                                <input type="hidden" id="product_id" name="product_id" value="productID">
                            </div>
                            <button type="submit" class="btn btn-success btn-block">Add to Cart</button>
                            <a role="button" class="btn btn-primary btn-block" href="site_design/cart.html">Check Out Now</a>
                        </form>
                    </div>
                </div>
            </div>
    `

    $("#categoryCriteria").append(modalString);
}


function populateProductModal(product) {
    // product id
    $("#myProductModal .modal-body #product_id").val(product.productID)
    // image source & alt
    $("#myProductModal .modal-body img").attr("src", product.productImg);
    $("#myProductModal .modal-body img").attr("alt", `image of ${product.productName}`);
    // product name
    $("#myProductModal .modal-body h3").text(product.productName);
    // product price
    $("#myProductModal .modal-body h4").text(product.productPrice) 

    $("#myProductModal .modal-body form").on('submit', "#addToCartForm", _CF_checkaddToCartForm(product))
}





_CF_checkaddToCartForm = function (_CF_this) {
    //reset on submit
    _CF_error_exists = false;
    _CF_error_messages = new Array();
    _CF_error_fields = new Object();
    _CF_FirstErrorField = null;


    //display error messages and return success
    if (_CF_error_exists) {
        if (_CF_error_messages.length > 0) {
            // show alert() message
            _CF_onErrorAlert(_CF_error_messages);
            // set focus to first form error, if the field supports js focus().
            if (_CF_this[_CF_FirstErrorField].type == "text") { _CF_this[_CF_FirstErrorField].focus(); }

        }
        return false;
    } else {
        return true;
    }
}