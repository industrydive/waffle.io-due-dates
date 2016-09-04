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
    // add the counts
    $(".column:has(.dive-due-date)").each(function(){
        var $column = $(this);
        if ($column.find(".dive-due-date").length > 0) {
            $column.find(".column-text").addClass("dive-column-label");
        }
    })
}

function clearAllDueDates() {
    $(".dive-due-date, .dive-column-label").remove();
}

function renderDueDate(card, dueMoment) {
    // renders a due date for a given card (DOM element) and a given momentjs date
    var $card = $(card);
    var $duePill = $("<span class='label-pill dive-due-date'/>");
    var dueWhen = dueMoment.fromNow();
    if ((dueMoment < moment().add(1, "days")) && (dueMoment > moment())) {
        // check for stuff due today
        dueWhen = "today";
        $duePill.addClass("dive-due-today");
    } else if((dueMoment <= moment().endOf('day').add(3, "days")) && (dueMoment > moment())) {
        // Stuff due "soon" gets special styling
        $duePill.addClass("dive-due-soon");
    } else if (dueMoment < moment()) {
        // already late
        $duePill.addClass("dive-due-past");
    }
    $duePill.html("Due "+dueWhen);
    $card.find(".pills").prepend($duePill);
}

function pageWasJustModified() {
    // this is what actually gets called when the page is modified. 
    ignoreChanges = true;
    clearAllDueDates();
    processCards();
    ignoreChanges = false;
}

var subtreeModifiedTimer = false, ignoreChanges = false;
$(document).on('DOMSubtreeModified', '.board', function() {
    // DOMSubtreeModified is an evil, deprecated event that totally still works anyway.
    // Only catch is it fires many times during a refesh so we need to throttle/debounce it
    // We only call pageWasJustMoved at most once every 1/10th of a second.
    if (ignoreChanges) {
        // ignore changes made as part of *our* updates so we don't get stuck in a loop
        return;
    }
    if (subtreeModifiedTimer !== false) {
        // cancel any existing timers
        clearTimeout(subtreeModifiedTimer);
    }
    // ...and start a new one for 100ms from now
    subtreeModifiedTimer = setTimeout(pageWasJustModified, 100);
});