JBrowse docs (also with notes not found on the interwebz.)
============================================================

config = {
    containerID: HTML container id,
    include: list of config files to include (had to include both browser.conf and browser_conf.json),
    browserRoot: URL to browser document root,
    dataRoot: URL to data root,
    queryParams: TODO,
    location: starting genome location,
    forceTracks: force tracks with names seperated by commas,
    initialHighlight: TODO,
    show_nav: true/false,
    show_tracklist: true/false,
    show_overview: true/false,
    stores: {
        url: {
            type: "JBrowse/Store/SeqFeature/FromConfig", features: []
        }
    },
    makeFullViewURL: URL to full screen view,
    updateBrowserURL: setting this to true will refresh URL for (almost) any action in the browser and
                      reload Angular app. It should therefore be set to false, and we should update the
                      URL (hash part) manually.
};

Stores
========
- JBrowse/Store/SeqFeature/FromConfig: Store that shows features defined in its `features` configuration key, e.g.

    features: [
        { "seq_id": "ctgA", "start":1, "end":20 },
        ...
    ]

