function processCards(){
    // iterates through every card, looks for due data "due MM/DD" and renders them
    var dueRegexp = /due (\d\d?\/\d\d?)/i
    $(".card").each(function(){
        var issueTitle = $(this).find(".title").val();
        var dueMatch = dueRegexp.exec(issueTitle);
        if (dueMatch) {  // if there is a due date match in this issue title...
            var dueDate = dueMatch[1];  // stsring of the due date like "9/1"
            var dueMoment = moment(dueDate, "MM/DD").endOf('day');  // momentjs object of the due date
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
    var dueWhen = dueMoment.fromNow();
    if (dueMoment < moment()) {
        // already late
        $duePill.addClass("dive-due-past");
    }
    else {
        if ((dueMoment < moment().add(1, "days")) && (dueMoment > moment())) {
            // special case when it's less than a day away, but not yet passed. i.e. today
            dueWhen = "today";
            $duePill.addClass("dive-due-today");
        }
        else if (dueMoment <= moment().add(3, "days")) {
            // Stuff due "soon" gets special styling
            $duePill.addClass("dive-due-soon");
        }
    }
    $duePill.html("Due "+dueWhen);
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

// Kick off the process of waiting for cards to load so we can mess with them
doStuffOnceCardsLoad();