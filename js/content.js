function processCards(){
    var dueRegexp = /due (\d\d?\/\d\d?)/i
    // iterates through cards looking for strings like "due MM/DD" and call renderDueDate on them
    // Selects only cards within any column except for the column containing an "archive-all" button
    //  because that column is the "Done" column and it's silly to show due dates on done items.
    $(".column:not(*:has(.archive-all)) .card").each(function(){
        var issueTitle = $(this).find(".title").val();
        var dueMatch = dueRegexp.exec(issueTitle);
        if (dueMatch) {  // if there is a due date match in this issue title...
            var dueDate = dueMatch[1];  // stsring of the due date like "9/1"
            var dueMoment = moment(dueDate, "MM/DD").endOf('day');  // momentjs object of the due date
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

function pageWasJustModified() {
    // this is what actually gets called when the page is modified. 
    clearAllDueDates();
    processCards();
}

var subtreeModifiedTimer = false;
$(document).on('DOMSubtreeModified', '.board', function() {
    // DOMSubtreeModified is an evil, deprecated event that totally still works anyway.
    // Only catch is it fires many times during a refesh so we need to throttle/debounce it
    // We only call pageWasJustMoved at most once every 1/10th of a second.
    if (subtreeModifiedTimer !== false) {
        // cancel any existing timers
        clearTimeout(subtreeModifiedTimer);
    }
    // ...and start a new one for 100ms from now
    subtreeModifiedTimer = setTimeout(pageWasJustModified, 100);
});