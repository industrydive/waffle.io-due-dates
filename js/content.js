function processCards(){
    // iterates through every card, looks for due data "due MM/DD" and renders them
    var dueRegexp = /due (\d\d?\/\d\d?)/i
    $(".card").each(function(){
        var issueTitle = $(this).find(".title").val();
        var dueMatch = dueRegexp.exec(issueTitle);
        if (dueMatch) {  // if there is a due date match in this issue title...
            var dueDate = dueMatch[1];  // stsring of the due date like "9/1"
            var dueMoment = moment(dueDate, "MM/DD");  // momentjs object of the due date
            // console.log(issueTitle, dueDate, dueMoment.fromNow());
            renderDueDate(this, dueMoment);
        }
    });
}

function clearAllDueDates() {
    $(".dive-due-date").remove();
}

function renderDueDate(card, dueMoment) {
    // renders a due date for a given card (DOM element) and a given momentjs date
    var $card = $(card);
    var $duePill = $("<span class='label-pill dive-due-date'/>");
    // alarm clock glyph from http://www.fileformat.info/info/unicode/char/23f0/index.htm
    $duePill.html("&#9200; Due "+dueMoment.fromNow());
    if (dueMoment <= moment().add(3, "days")) {
        $duePill.addClass("dive-due-soon");
    }
    $card.find(".pills").prepend($duePill);
}

function doStuffOnceCardsLoad(try_count) {
    if (!try_count) try_count = 1; // try_count not specificed, assume first try
    if (try_count > 20) return; // give up trying after 10 sec delay (20 attempts * 500ms = 10000ms)

    // $(".loading-mask").is(":visible")
    if ($(".card").length==0) {
        // not loaded yet; try again in 1/2 second.
        setTimeout(function() {
            doStuffOnceCardsLoad(try_count + 1);
        }, 500);
    } else {
        // it loaded!
        processCards();
        setUpEvents();
    }
}

function setUpEvents() {
    $(".card textarea").blur(function(){
        // Any time any textarea blurs (focus is lost) nuke all due date rendering and rebuild it all
        clearAllDueDates();
        processCards();
    });
}

doStuffOnceCardsLoad();