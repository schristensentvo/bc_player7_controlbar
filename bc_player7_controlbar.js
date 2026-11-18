(function () {
    'use strict';

    var OBSERVER_TIMEOUT_MS = 15000;

    /**
     * Moves the existing Transcript button immediately before Chromecast.
     *
     * Moving the actual DOM element, rather than only using CSS order,
     * keeps keyboard focus order consistent with the visual order.
     */
    function positionTranscriptButton(playerElement) {
        var transcriptButton = playerElement.querySelector(
            '.vjs-transcript-control'
        );

        var chromecastButton = playerElement.querySelector(
            '.vjs-chromecast-receiver-button'
        );

        if (!transcriptButton || !chromecastButton) {
            return false;
        }

        var controlBar = chromecastButton.parentNode;

        if (!controlBar) {
            return false;
        }

        /*
         * This operation is safe to repeat. If Transcript is already directly
         * before Chromecast, no additional move is required.
         */
        if (transcriptButton.nextElementSibling !== chromecastButton) {
            controlBar.insertBefore(transcriptButton, chromecastButton);
        }

        return true;
    }

    function customizePlayer(player) {
        var playerElement = player.el();

        if (!playerElement) {
            return;
        }

        /*
         * Run immediately in case both controls have already been created.
         */
        if (positionTranscriptButton(playerElement)) {
            return;
        }

        /*
         * Transcript and Chromecast are created by separate plugins and may
         * not exist when this script first runs. Observe the player until both
         * controls become available.
         */
        var observer = new MutationObserver(function () {
            if (positionTranscriptButton(playerElement)) {
                observer.disconnect();
            }
        });

        observer.observe(playerElement, {
            childList: true,
            subtree: true
        });

        /*
         * Avoid leaving an observer running indefinitely if one of the
         * required plugins is not enabled on this player.
         */
        window.setTimeout(function () {
            observer.disconnect();
        }, OBSERVER_TIMEOUT_MS);
    }

    function initialize() {
        if (typeof videojs === 'undefined') {
            return;
