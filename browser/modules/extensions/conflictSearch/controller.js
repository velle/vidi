/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */

'use strict';

var print;
var conflictSearch;
var backboneEvents;
var reportRender;
var infoClick;
var config = require('../../../../config/config.js');
var printC = config.print.templates;
var scales = config.print.scales;

/**
 *
 * @returns {*}
 */
module.exports = {
    set: function (o) {
        print = o.print;
        reportRender = o.extensions.conflictSearch.reportRender;
        infoClick = o.extensions.conflictSearch.infoClick;
        backboneEvents = o.backboneEvents;
        conflictSearch = o.extensions.conflictSearch.index;
        return this;
    },
    init: function () {
        var endPrintEventName = "end:conflictPrint";

        // Turn off if advanced info or drawing is activated
        backboneEvents.get().on("off:conflict on:advancedInfo on:drawing", function () {
            conflictSearch.off();
        });

        // Handle GUI when print is done. Using at custom event, so standard print is not triggered
        backboneEvents.get().on(endPrintEventName, function (response) {
            $("#conflict-get-print-fieldset").prop("disabled", false);
            $("#conflict-download-pdf, #conflict-open-pdf").prop("href", "/static/tmp/print/pdf/" + response.key + ".pdf");
            $("#conflict-download-pdf").prop("download", response.key);
            $("#conflict-open-html").prop("href", response.url);
            $("#conflict-print-btn").button('reset');
        });

        // When conflict search is done, enable the print button
        backboneEvents.get().on("end:conflictSearch", function () {
            $("#conflict-print-btn").prop("disabled", false);
        });

        // Handle conflict info click events
        backboneEvents.get().on("on:conflictInfoClick", function () {
            console.log("Starting conflictInfoClick");
            infoClick.active(true);
        });

        backboneEvents.get().on("off:conflictInfoClick", function () {
            console.log("Stopping conflictInfoClick");
            infoClick.active(false)
        });

        // When print module emit on:customData when render the custom data
        backboneEvents.get().on("on:customData", function (e) {
            reportRender.render(e);
        });

        // Click event for print button
        $("#conflict-print-btn").on("click", function () {
            // Trigger print dialog off
            backboneEvents.get().trigger("off:print");
            $("#conflict-get-print-fieldset").prop("disabled", true);

            $(this).button('loading');
            print.control(printC, scales, "_conflictPrint", "A4", "p", "inline");
            print.print(endPrintEventName, conflictSearch.getResult());
            print.cleanUp();
        });

        // Click event for conflict search on/off toggle button
        $("#conflict-btn").on("click", function () {
            conflictSearch.control();
        });


    }
};