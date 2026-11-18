videojs.registerPlugin('bc_player7_controlbar', function () {
    var player = this;
    var observer = null;
    var timeout = null;

    function positionTranscriptButton() {
        var playerElement = player.el();

        if (!playerElement) {
            return false;
        }

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
         * Move the actual Transcript button immediately before Chromecast.
         * This keeps keyboard/DOM order consistent with visual order.
         */
        if (transcriptButton.nextElementSibling !== chromecastButton) {
            controlBar.insertBefore(transcriptButton, chromecastButton);
        }

        return true;
    }

    player.ready(function () {
        /*
         * The existing Transcript plugin and Chromecast plugin may finish
         * creating their controls after this plugin initializes.
         */
        if (positionTranscriptButton()) {
            return;
        }

        observer = new MutationObserver(function () {
            if (positionTranscriptButton()) {
                observer.disconnect();
                observer = null;

                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            }
        });

        observer.observe(player.el(), {
            childList: true,
            subtree: true
        });

        /*
         * Don't leave the observer running forever if one of the expected
         * controls is unavailable.
         */
        timeout = setTimeout(function () {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }, 15000);
    });
});
