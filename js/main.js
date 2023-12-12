// initialize page
$(document).ready(function() {
    $("#nav-bar").hide();
    
    // page swapping
    $(".nb-button").click(function() {
        console.log("screen swap");
        let screen = $(this).data("screen");
        if (!$(`#${screen}-screen`).hasClass("current-screen")) {
            console.log("swapping screen");
            $(".current-screen").toggleClass("current-screen");
            $(`#${screen}-screen`).toggleClass("current-screen");
            if (screen != "home") {
                $("#nav-bar").show();
            } else {
                $("#nav-bar").hide();
            }
        }
    });

    // hide the loading page
    setTimeout(() => {
        $("#loading-page").fadeOut(250);
    }, 150);
});
