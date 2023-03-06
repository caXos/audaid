$(document).ready(function () {
    $('#link-to-terms-up-to-06').click(abreTerms06);
    $('#link-to-terms-starting-in-07').click(abreTerms07);
});

function abreTerms06() {
    window.open("./../termos/termos_ate_v06.html", "_blank");
}

function abreTerms07() {
    window.open("./../termos/termos.html", "_blank");
}