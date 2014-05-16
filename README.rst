genapp-jbrowse
==============
TODO:
- changes to Vagrantfile need to be commited to genesis
- changes to base.py (STATIC_DIRS) need to be commited to genesis

JBrowse:
==============
- JBrowse's vertical scroll is fixed to the center of the screen (position: fixed; may be the problem)
- Storing options in URL (zipped?) in the hash part of the URL:
    - let Angular controller take care of unzipping and applying the options
    - right now, the options stored in local storage are:
        - gen-browser-location-: location of view

          example:
          {"_version":1,"ctgA":{"l":"ctgA:22757..25016","t":60033932}}

        - gen-browser-recentTracks-: TODO

          example:
          [{"label":"my-bam-track","time":1400245012}]

        - gen-browser-refseq-: reference sequence that is shown

          example:
          ctgA

        - gen-browser-tracks-: shown tracks

          example:
          DNA,my-bam-track

    - options, contained in the URL look like:
        ?loc=ctgA%3A22757..25016&tracks=DNA%2Cmy-bam-track&highlight=